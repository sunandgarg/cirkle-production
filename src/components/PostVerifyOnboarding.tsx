import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CheckCircle2, ArrowRight, ArrowLeft, User, GraduationCap, MapPin, Briefcase, Sparkles } from "lucide-react";
import SearchableSelect from "@/components/SearchableSelect";
import { locations } from "@/data/locationsList";
import { companies } from "@/data/companiesList";
import { ALL_COURSES, getSpecialisations } from "@/data/courseSpecialisations";

const STATUSES = [
  { value: "current_student", label: "🎓 Student", desc: "Currently studying" },
  { value: "alumni", label: "🏛️ Alumni", desc: "Graduated" },
];
const YEARS = Array.from({ length: 56 }, (_, i) => String(2035 - i));

type Step = "name" | "status" | "degree" | "branch" | "year" | "optional" | "done";
const STEP_ORDER: Step[] = ["name", "status", "degree", "branch", "year", "optional"];

interface PostVerifyOnboardingProps {
  derivedIit?: string;
  onComplete: () => void;
}

const PostVerifyOnboarding = ({ derivedIit, onComplete }: PostVerifyOnboardingProps) => {
  const { user, profile, refetchProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("name");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(profile?.name || "");
  const iit = derivedIit || profile?.iit_name || "";
  const [status, setStatus] = useState(profile?.student_status || "");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [location, setLocation] = useState(profile?.location || "");
  const [linkedin, setLinkedin] = useState("");
  const [company, setCompany] = useState("");
  const [searchDegree, setSearchDegree] = useState("");
  const [searchBranch, setSearchBranch] = useState("");

  const stepIdx = STEP_ORDER.indexOf(step as any);
  const totalSteps = STEP_ORDER.length;

  // Get specialisations for selected degree
  const specialisations = degree ? getSpecialisations(degree) : [];

  const filteredDegrees = searchDegree
    ? ALL_COURSES.filter(d => d.toLowerCase().includes(searchDegree.toLowerCase()))
    : ALL_COURSES;

  const filteredBranches = searchBranch
    ? specialisations.filter(b => b.toLowerCase().includes(searchBranch.toLowerCase()))
    : specialisations;

  useEffect(() => {
    if (profile?.name && step === "name") {
      setName(profile.name);
    }
  }, [profile]);

  // Reset branch when degree changes
  useEffect(() => {
    setBranch("");
    setSearchBranch("");
  }, [degree]);

  const canProceed = () => {
    switch (step) {
      case "name": return name.trim().length >= 2;
      case "status": return !!status;
      case "degree": return !!degree;
      case "branch": return !!branch;
      case "year": return !!year;
      case "optional": return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (stepIdx < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[stepIdx + 1]);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (stepIdx > 0) setStep(STEP_ORDER[stepIdx - 1]);
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error: profileError } = await supabase.from("profiles").update({
        name: name.trim(),
        iit_name: iit,
        student_status: status,
        location: location || null,
        onboarding_completed: true,
      } as any).eq("user_id", user.id);

      if (profileError) throw profileError;

      const { data: existingEdu } = await supabase
        .from("education")
        .select("id")
        .eq("user_id", user.id)
        .eq("institution", iit)
        .maybeSingle();

      if (existingEdu) {
        await supabase.from("education").update({
          degree, branch_area: branch, passing_year: year,
        }).eq("id", existingEdu.id);
      } else {
        const { data: newEdu } = await supabase.from("education").insert({
          user_id: user.id, institution: iit, degree, branch_area: branch, passing_year: year,
        }).select("id").single();

        if (newEdu) {
          await supabase.from("profiles").update({
            primary_education_id: newEdu.id,
          } as any).eq("user_id", user.id);
        }
      }

      // Save company if provided
      if (company.trim()) {
        await supabase.from("professional_experience").insert({
          user_id: user.id,
          company_name: company.trim(),
          is_current: true,
        });
      }

      // Refetch profile first so AppLayout sees onboarding_completed = true
      await refetchProfile();
      toast.success("Profile complete! Welcome to Cirkle 🎉");
      onComplete();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">You're all set!</h2>
          <p className="text-muted-foreground">Welcome to your IIT community.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {/* Progress */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        {stepIdx > 0 && (
          <button onClick={handleBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex gap-1.5 flex-1">
          {STEP_ORDER.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${stepIdx >= i ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{stepIdx + 1}/{totalSteps}</span>
      </div>

      <div className="flex-1 px-4 pb-8 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          {/* Locked IIT badge */}
          {iit && (
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{iit}</span>
              <span className="text-xs text-muted-foreground">(verified)</span>
            </div>
          )}

          {step === "name" && (
            <div className="animate-fade-in">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">What's your full name?</h2>
              <p className="text-sm text-muted-foreground mb-6">This will be visible to other community members</p>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Rahul Sharma" className="h-12 rounded-xl bg-secondary border-border" autoFocus />
            </div>
          )}

          {step === "status" && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-foreground mb-1">What's your current status?</h2>
              <p className="text-sm text-muted-foreground mb-6">This helps personalize your forum rooms</p>
              <div className="space-y-3">
                {STATUSES.map(s => (
                  <button key={s.value} onClick={() => setStatus(s.value)}
                    className={`w-full p-4 rounded-xl border text-left transition-all press-scale ${
                      status === s.value ? "bg-primary/10 border-primary" : "bg-card border-border hover:border-primary/30"
                    }`}>
                    <p className="font-bold text-foreground">{s.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "degree" && (
            <div className="animate-fade-in">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">Select your degree</h2>
              <p className="text-sm text-muted-foreground mb-4">Your primary course of study</p>
              <Input
                value={searchDegree}
                onChange={e => setSearchDegree(e.target.value)}
                placeholder="Search degree..."
                className="h-10 rounded-xl bg-secondary border-border mb-3"
              />
              <div className="grid grid-cols-3 gap-2 max-h-[45vh] overflow-y-auto scrollbar-hide">
                {filteredDegrees.map(d => (
                  <button key={d} onClick={() => setDegree(d)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all press-scale ${
                      degree === d ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-foreground hover:border-primary/30"
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "branch" && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{degree}</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">Select your specialisation</h2>
              <p className="text-sm text-muted-foreground mb-4">Your branch or area of study</p>
              <Input
                value={searchBranch}
                onChange={e => setSearchBranch(e.target.value)}
                placeholder="Search specialisation..."
                className="h-10 rounded-xl bg-secondary border-border mb-3"
              />
              <div className="grid grid-cols-2 gap-2 max-h-[45vh] overflow-y-auto scrollbar-hide">
                {filteredBranches.map(b => (
                  <button key={b} onClick={() => setBranch(b)}
                    className={`p-3 rounded-xl border text-sm font-medium text-left transition-all press-scale ${
                      branch === b ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-foreground hover:border-primary/30"
                    }`}>
                    {b}
                  </button>
                ))}
                {filteredBranches.length === 0 && (
                  <p className="col-span-2 text-sm text-muted-foreground text-center py-4">No specialisations found</p>
                )}
              </div>
            </div>
          )}

          {step === "year" && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-foreground mb-1">Batch / Passout year</h2>
              <p className="text-sm text-muted-foreground mb-6">When do/did you graduate?</p>
              <div className="grid grid-cols-4 gap-2 max-h-[50vh] overflow-y-auto scrollbar-hide">
                {YEARS.map(y => (
                  <button key={y} onClick={() => setYear(y)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all press-scale ${
                      year === y ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-foreground hover:border-primary/30"
                    }`}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "optional" && (
            <div className="animate-fade-in">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">Optional details</h2>
              <p className="text-sm text-muted-foreground mb-6">You can skip these and add later</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Location</label>
                  <SearchableSelect options={locations} value={location} onChange={setLocation} placeholder="Search city worldwide..." allowOther={true} className="rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">LinkedIn URL</label>
                  <Input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." className="h-11 rounded-xl bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Current Company</label>
                  <SearchableSelect options={companies} value={company} onChange={setCompany} placeholder="Search company..." allowOther={true} className="rounded-xl" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom action */}
      {(step as string) !== "done" && (
        <div className="px-4 pb-6 safe-bottom">
          <div className="max-w-lg mx-auto">
            <Button
              className="w-full h-12 rounded-xl font-semibold gap-2"
              onClick={handleNext}
              disabled={!canProceed() || loading}
            >
              {loading ? "Saving..." : step === "optional" ? "Complete Profile" : "Continue"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
            {step === "optional" && (
              <button onClick={handleComplete} className="text-sm text-muted-foreground hover:text-foreground mt-3 block mx-auto">
                Skip & finish
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostVerifyOnboarding;
