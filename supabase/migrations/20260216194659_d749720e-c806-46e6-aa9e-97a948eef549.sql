-- Create trigger for auto-creating profiles on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure admin role exists for super admin
INSERT INTO user_roles (user_id, role) VALUES ('1d031611-1bd6-42f7-8f66-c628134ccacf', 'admin')
ON CONFLICT DO NOTHING;