import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef } from "react";
import {
  MessageSquareText, Briefcase, GraduationCap, Shield,
  ArrowRight, CheckCircle2, Plane, Sparkles, Users, Heart, Repeat2, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import cirkLogo from "@/assets/cirkle-logo.png";

const JOURNEY = [
  { label: "IIT Community", status: "live", caption: "Students + alumni, one verified network" },
  { label: "Premier Institutes", status: "next", caption: "NITs, IIMs, BITS & more" },
  { label: "Corporate Circles", status: "soon", caption: "Company alumni networks" },
  { label: "Global Niches", status: "soon", caption: "Sports, arts, regional groups" },
];

const FEATURES = [
  { icon: MessageSquareText, title: "Community Forum", desc: "Real conversations with real, verified people — as simple as messaging." },
  { icon: GraduationCap, title: "Consult", desc: "Book time with verified seniors and experts who've done it before." },
  { icon: Briefcase, title: "Jobs", desc: "Referral-first roles shared inside the community, not scraped from the web." },
  { icon: Shield, title: "Verified Only", desc: "Institute email verification on every single member. No noise, no bots." },
];

const STATS = [
  { value: "23", label: "IIT campuses" },
  { value: "100%", label: "Email verified" },
  { value: "0", label: "Cost, forever" },
];

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const journeyRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: journeyRef, offset: ["start end", "end start"] });
  const planeX = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], ["5%", "25%", "50%", "75%", "90%"]);
  const planeY = useTransform(scrollYProgress, [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1], ["0px", "-20px", "8px", "-16px", "4px", "-12px", "0px"]);
  const planeRotate = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, -8, 5, -6, 3, 0]);

  useEffect(() => {
    if (!loading && user) navigate("/cirkle-forum");
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (user) return null;

  const goAuth = () => navigate("/auth");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Top nav ── */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto h-16 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={cirkLogo} alt="Cirkle" className="w-8 h-8 rounded-lg" />
            <span className="font-display text-lg font-bold tracking-tight">Cirkle</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="story-link hover:text-foreground transition-colors">Product</a>
            <a href="#journey" className="story-link hover:text-foreground transition-colors">Journey</a>
            <a href="#join" className="story-link hover:text-foreground transition-colors">Community</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={goAuth} className="rounded-full text-sm font-semibold px-4">Sign in</Button>
            <Button onClick={goAuth} className="rounded-full text-sm font-semibold px-5 shadow-sm">Join now</Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative bg-hero-mesh">
        <div className="absolute inset-0 bg-grid-faint pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-5 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-card/80 text-primary text-[11px] font-semibold px-3 py-1.5 rounded-full mb-7 border border-primary/15 shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              Live — IIT Community
            </div>

            <h1 className="font-display text-[2.6rem] sm:text-6xl lg:text-[4.2rem] font-bold tracking-[-0.03em] leading-[1.03] mb-6">
              Your community.<br />
              Your network.<br />
              <span className="text-gradient-primary">Your career.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-lg mb-9 leading-relaxed">
              A community-first networking forum and job platform — starting with the IITs,
              expanding to every circle worth belonging to.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-9">
              <Button size="lg" onClick={goAuth} className="rounded-full px-8 h-13 text-sm font-semibold gap-2 shadow-elevated">
                Enter my community <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={goAuth} className="rounded-full px-8 h-13 text-sm font-semibold bg-card/60">
                Explore the forum
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Free forever</span>
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> Institute email verified</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary" /> Invite-quality members</span>
            </div>
          </motion.div>

          {/* Hero visual — layered product mock */}
          <motion.div
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            className="relative hidden sm:block"
          >
            <div className="absolute -top-6 -left-6 w-40 rounded-2xl border border-border bg-card p-3 shadow-elevated rotate-[-6deg]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold leading-tight">New referral</p>
                  <p className="text-[10px] text-muted-foreground">SDE-2 · Bengaluru</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card shadow-elevated overflow-hidden">
              <div className="h-20 profile-cover" />
              <div className="px-5 pb-5 -mt-8">
                <div className="w-16 h-16 rounded-2xl bg-secondary border-4 border-card flex items-center justify-center">
                  <span className="font-display font-bold text-lg text-primary">AK</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <p className="font-semibold text-sm">Ananya K.</p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    <Shield className="w-2.5 h-2.5" /> Verified
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">IIT Bombay ’24 · Product</p>

                <div className="mt-4 rounded-2xl border border-border/70 bg-background p-4">
                  <p className="text-[13px] leading-relaxed">
                    Anyone here moved from core to product? Happy to trade notes —
                    posting my full switch timeline in the forum tonight.
                  </p>
                  <div className="mt-3 flex items-center gap-5 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> 128</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> 42</span>
                    <span className="flex items-center gap-1"><Repeat2 className="w-3.5 h-3.5" /> 9</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -right-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-elevated rotate-[5deg]">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Consult booked</p>
              <p className="text-sm font-semibold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" /> 30 min · Today</p>
            </div>
          </motion.div>
        </div>

        {/* stats strip */}
        <div className="relative border-t border-border/70 bg-card/60 backdrop-blur">
          <div className="max-w-6xl mx-auto px-5 py-6 grid grid-cols-3 divide-x divide-border/70 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{s.value}</p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">What you get</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight max-w-xl mb-12">
            Everything a real network should be — nothing it shouldn’t.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-2xl border border-border bg-card p-6 hover-lift hover:border-primary/30"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <f.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Journey ── */}
      <section id="journey" ref={journeyRef} className="py-20 px-5 bg-secondary/40 border-y border-border/70 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">Our journey</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-3">Start with one community. Perfect it. Expand.</h2>
            <p className="text-muted-foreground">Cirkle grows one verified circle at a time.</p>
          </div>

          <div className="relative h-28 mb-10">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 80" preserveAspectRatio="none">
              <path d="M0,40 C100,10 200,70 300,35 C400,0 500,60 600,30 C700,0 800,50 800,40" stroke="hsl(var(--border))" strokeWidth="2" fill="none" strokeDasharray="6 4" />
              <motion.path d="M0,40 C100,10 200,70 300,35 C400,0 500,60 600,30 C700,0 800,50 800,40"
                stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" style={{ pathLength: scrollYProgress }} />
            </svg>
            <motion.div style={{ left: planeX, y: planeY, rotate: planeRotate }} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
              <div className="bg-primary text-primary-foreground rounded-full p-2.5 shadow-elevated">
                <Plane className="w-5 h-5" />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {JOURNEY.map((stop, i) => (
              <motion.div
                key={stop.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-5 border bg-card transition-all ${
                  stop.status === "live" ? "border-primary/30 shadow-elevated ring-1 ring-primary/10"
                  : stop.status === "next" ? "border-border"
                  : "border-border/50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${stop.status === "live" ? "bg-primary" : stop.status === "next" ? "bg-primary/50" : "bg-muted-foreground/40"}`} />
                  <span className="text-sm font-semibold">{stop.label}</span>
                  {stop.status === "live" && (
                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase ml-auto">Live</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{stop.caption}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="join" className="py-24 px-5">
        <div className="max-w-4xl mx-auto rounded-[2rem] border border-border bg-card shadow-elevated px-8 py-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-mesh opacity-70 pointer-events-none" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Ready to find your <span className="text-gradient-primary">circle</span>?
            </h2>
            <p className="text-muted-foreground mb-8">Verification required. Always free.</p>
            <Button size="lg" onClick={goAuth} className="rounded-full px-9 h-13 text-sm font-semibold gap-2 shadow-elevated">
              Enter my community <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={cirkLogo} alt="Cirkle" className="w-6 h-6 rounded" />
            <span className="font-display text-sm font-bold">Cirkle</span>
          </div>
          <nav className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Product</a>
            <a href="#journey" className="hover:text-foreground transition-colors">Journey</a>
            <a href="#join" className="hover:text-foreground transition-colors">Join</a>
          </nav>
          <p className="text-[11px] text-muted-foreground/60">© 2026 Cirkle</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
