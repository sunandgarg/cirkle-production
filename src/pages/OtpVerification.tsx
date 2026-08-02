import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as any)?.phone || "";
  const countryCode = (location.state as any)?.countryCode || "+91";
  const fullPhone = (location.state as any)?.fullPhone || `${countryCode}${phone}`;

  if (!phone) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <ShieldCheck className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Session Expired</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">Please go back and enter your phone number again.</p>
        <Button onClick={() => navigate("/auth")} className="rounded-xl">Go to Login</Button>
      </div>
    );
  }

  const handleVerify = async () => {
    if (otp.length !== 6) { toast.error("Please enter the full 6-digit OTP"); return; }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otp,
        type: "sms",
      });
      if (error) throw error;

      toast.success("Verified successfully!");
      navigate("/cirkle-forum", { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(message);
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("A new code was sent");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-6 pt-12 pb-4">
        <button onClick={() => navigate("/auth")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <ShieldCheck className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground text-center">Verify OTP</h1>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Enter the 6-digit code sent to <span className="text-foreground font-medium">{countryCode} {phone}</span>
        </p>
        <div className="mt-8">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <InputOTPSlot key={index} index={index} className="w-12 h-14 text-lg font-bold text-foreground bg-secondary border-border rounded-xl" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button size="lg" className="w-full max-w-xs h-12 text-base font-semibold rounded-xl mt-8" onClick={handleVerify} disabled={loading || otp.length !== 6}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </Button>
        <button onClick={handleResend} disabled={loading} className="text-sm text-primary mt-4 hover:underline disabled:opacity-50">Resend OTP</button>
      </div>
    </div>
  );
};

export default OtpVerification;
