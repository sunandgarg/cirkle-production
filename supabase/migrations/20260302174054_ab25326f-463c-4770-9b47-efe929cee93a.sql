-- Create the trigger to auto-create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also create missing profiles for existing users who don't have one
INSERT INTO public.profiles (user_id, name)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'name', u.email)
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;