import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "+63", flag: "🇵🇭", name: "Philippines" },
];

const Auth = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCountry, setShowCountry] = useState(false);
  const [country, setCountry] = useState(COUNTRY_CODES[0]);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Redirect already-logged-in users
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/cirkle-forum", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handlePhoneChange = (value: string) => {
    // Only allow digits, max 10
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
  };

  const handleContinue = () => {
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    navigate("/otp-verify", { state: { phone, countryCode: country.code } });
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast.error("Google sign-in failed");
      console.error(error);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-background">
      {/* Avatar grid background */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        <div className="grid grid-cols-4 gap-1 p-1 opacity-30">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg"
              style={{
                backgroundImage: `url(https://i.pravatar.cc/150?img=${i + 1})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "grayscale(100%) blur(1px)",
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      {/* Login form */}
      <div className="relative z-10 px-6 pb-6 pt-4 -mt-16 flex-shrink-0">
        <h1 className="text-3xl font-bold text-foreground">Welcome</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-4">Sign up or login to your account</p>

        <div className="flex items-center gap-2 mb-4">
          {/* Country code selector */}
          <button
            onClick={() => setShowCountry(true)}
            className="h-12 px-3 rounded-xl bg-secondary border border-border flex items-center gap-1.5 flex-shrink-0 hover:bg-accent transition-colors"
          >
            <span className="text-lg">{country.flag}</span>
            <span className="text-foreground text-sm font-medium">{country.code}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="Enter 10-digit number"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:border-primary flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            maxLength={10}
          />
        </div>

        {/* Digit count indicator */}
        <p className={`text-xs mb-2 ${phone.length === 10 ? "text-green-500" : "text-muted-foreground"}`}>
          {phone.length}/10 digits
        </p>

        <Button
          size="lg"
          className="w-full h-12 text-base font-semibold rounded-xl"
          onClick={handleContinue}
          disabled={loading || phone.length !== 10}
        >
          Continue
        </Button>

        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">Or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full h-12 rounded-xl bg-secondary border border-border flex items-center justify-center gap-2 text-foreground hover:bg-accent transition-colors press-scale"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-sm font-medium">Google</span>
        </button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By continuing, you agree to our{" "}
          <button onClick={() => setShowTerms(true)} className="underline text-muted-foreground hover:text-foreground transition-colors">T&C</button> &{" "}
          <button onClick={() => setShowPrivacy(true)} className="underline text-muted-foreground hover:text-foreground transition-colors">Privacy policy</button>
        </p>
      </div>

      {/* Country code picker */}
      <Dialog open={showCountry} onOpenChange={setShowCountry}>
        <DialogContent className="max-w-sm max-h-[70vh]">
          <DialogHeader><DialogTitle>Select Country</DialogTitle></DialogHeader>
          <div className="space-y-1 overflow-y-auto max-h-[50vh]">
            {COUNTRY_CODES.map((c) => (
              <button
                key={c.code}
                onClick={() => { setCountry(c); setShowCountry(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  country.code === c.code ? "bg-primary/10" : "hover:bg-muted/50"
                }`}
              >
                <span className="text-xl">{c.flag}</span>
                <span className="text-sm font-medium text-foreground flex-1 text-left">{c.name}</span>
                <span className="text-sm text-muted-foreground">{c.code}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Terms & Conditions</DialogTitle></DialogHeader>
          <div className="text-sm text-muted-foreground space-y-3">
            <p><strong>1. Acceptance of Terms</strong><br />By accessing and using Cirkle, you agree to be bound by these Terms and Conditions.</p>
            <p><strong>2. User Account</strong><br />You must provide accurate information during registration. You are responsible for maintaining the confidentiality of your account.</p>
            <p><strong>3. Community Guidelines</strong><br />Users must maintain respectful communication. Harassment, spam, and inappropriate content are strictly prohibited.</p>
            <p><strong>4. Intellectual Property</strong><br />Content posted on Cirkle remains the property of the original creator. By posting, you grant Cirkle a non-exclusive license to display your content.</p>
            <p><strong>5. Privacy</strong><br />Your data is handled in accordance with our Privacy Policy. We do not sell personal data to third parties.</p>
            <p><strong>6. Termination</strong><br />Cirkle reserves the right to terminate accounts that violate these terms without prior notice.</p>
            <p><strong>7. Limitation of Liability</strong><br />Cirkle is provided "as is" without warranties. We are not liable for any indirect damages arising from use of the platform.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Dialog */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Privacy Policy</DialogTitle></DialogHeader>
          <div className="text-sm text-muted-foreground space-y-3">
            <p><strong>1. Data Collection</strong><br />We collect your phone number, profile information, and usage data to provide our services.</p>
            <p><strong>2. Data Usage</strong><br />Your data is used to personalize your experience, facilitate connections, and improve our platform.</p>
            <p><strong>3. Data Sharing</strong><br />We do not sell your personal data. Information is shared only with your consent or as required by law.</p>
            <p><strong>4. Data Security</strong><br />We implement industry-standard security measures to protect your data including encryption and secure storage.</p>
            <p><strong>5. Your Rights</strong><br />You can access, update, or delete your personal data at any time through your profile settings.</p>
            <p><strong>6. Cookies</strong><br />We use cookies to enhance your browsing experience and analyze platform usage.</p>
            <p><strong>7. Contact</strong><br />For privacy-related inquiries, contact us at privacy@cirkle.world</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
