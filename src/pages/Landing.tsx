import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import {
  MessageSquareText, Briefcase, GraduationCap, Shield, ArrowRight, CheckCircle2,
  Sparkles, Users, Cpu, Radar, Zap, Command, Brain, LineChart, Network as NetworkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import cirkLogo from "@/assets/cirkle-logo.png";

const AI_PROMPTS = [
  "Find IIT Bombay alumni hiring for product roles…",
  "Draft a warm intro to a senior in fintech…",
  "Summarise this week's forum in 5 bullets…",
  "Match me with mentors who switched core → PM…",
];

const CAPABILITIES = [
  { icon: Brain, title: "AI Match Engine", desc: "Vector-matched introductions to the exact people who can move your career forward.", tag: "Live" },
  { icon: Radar, title: "Opportunity Radar", desc: "Referral-first roles surfaced and ranked against your profile in real time.", tag: "Live" },
  { icon: MessageSquareText, title: "Forum Copilot", desc: "Threads summarised, questions routed, answers sourced from verified members.", tag: "Live" },
  { icon: GraduationCap, title: "Mentor Autopilot", desc: "Books, briefs and follows up on consults so no conversation goes cold.", tag: "Beta" },
  { icon: LineChart, title: "Career Signals", desc: "See where people with your background went next — and what it took.", tag: "Beta" },
  { icon: Shield, title: "Verified-Only Graph", desc: "Institute email verification on every node. Zero bots, zero noise.", tag: "Core" },
];

const METRICS = [
  { value: "23", label: "IIT campuses" },
  { value: "100%", label: "Email verified" },
  { value: "<1s", label: "AI match latency" },
  { value: "0", label: "Cost, forever" },
];

const JOURNEY = [
  { label: "IIT Community", status: "live", caption: "Students + alumni, one verified network" },
  { label: "Premier Institutes", status: "next", caption: "NITs, IIMs, BITS & more" },
  { label: "Corporate Circles", status: "soon", caption: "Company alumni networks" },
  { label: "Global Niches", status: "soon", caption: "Sports, arts, regional groups" },
];

const MARQUEE = ["IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur", "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad"];

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
  const [promptIdx, setPromptIdx] = useState(0);
  const [typed, setTyped] = useState("");

  const { scrollYProgress } = useScroll({ target: journeyRef, offset: ["start end", "end start"] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const full = AI_PROMPTS[promptIdx];
    if (typed.length < full.length) {
      const t = setTimeout(() => setTyped(full.slice(0, typed.length + 1)), 28);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setTyped("");
      setPromptIdx((i) => (i + 1) % AI_PROMPTS.length);
    }, 1900);
    return () => clearTimeout(t);
  }, [typed, promptIdx]);

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
    <div className="landing-shell min-h-screen overflow-x-hidden">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto h-16 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={cirkLogo} alt="Cirkle logo" className="w-8 h-8 rounded-lg" />
            <span className="font-display text-lg font-bold tracking-tight">Cirkle</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-accent border border-accent/30 bg-accent/10 px-1.5 py-0.5 rounded">
              <Cpu className="w-2.5 h-2.5" /> AI
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</a>
            <a href="#engine" className="hover:text-foreground transition-colors">Engine</a>
            <a href="#journey" className="hover:text-foreground transition-colors">Journey</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={goAuth} className="rounded-full text-sm font-semibold px-4 hover:bg-secondary">Sign in</Button>
            <Button onClick={goAuth} className="rounded-full text-sm font-semibold px-5 shadow-glow">Join now</Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-aurora animate-aurora pointer-events-none" />
        <div className="absolute inset-0 bg-grid-tech pointer-events-none opacity-70" />

        <div className="relative max-w-6xl mx-auto px-5 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 glass-panel text-[11px] font-semibold px-3 py-1.5 rounded-full mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
              <span className="shimmer-text">AI network intelligence — live for the IITs</span>
            </div>

            <h1 className="font-display text-[2.6rem] sm:text-6xl lg:text-[4.1rem] font-bold tracking-[-0.035em] leading-[1.02] mb-6">
              The network that<br />
              thinks with you.<br />
              <span className="text-gradient-ai">Your career, compounded.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-lg mb-9 leading-relaxed">
              Cirkle is a verified community graph with an AI engine on top — matching people,
              referrals and mentors in real time. Built for the IITs, expanding to every circle worth belonging to.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-9">
              <Button size="lg" onClick={goAuth} className="rounded-full px-8 h-12 text-sm font-semibold gap-2 shadow-glow">
                Enter my community <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={goAuth} className="rounded-full px-8 h-12 text-sm font-semibold glass-panel border-0 hover:bg-secondary">
                See the AI engine
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Free forever</span>
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-accent" /> Institute email verified</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-accent" /> Invite-quality members</span>
            </div>
          </motion.div>

          {/* AI command console mock */}
          <motion.div
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl glass-panel glow-ring overflow-hidden">
              <div className="flex items-center gap-2 px-4 h-11 border-b border-border/60">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
                <span className="ml-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Command className="w-3 h-3" /> cirkle · copilot
                </span>
              </div>

              <div className="p-5">
                <div className="rounded-2xl bg-background/60 border border-border/70 px-4 py-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent shrink-0" />
                  <p className="text-[13px] font-medium truncate">
                    {typed}
                    <span className="inline-block w-[2px] h-4 align-middle bg-accent ml-0.5 animate-pulse-dot" />
                  </p>
                </div>

                <p className="mt-5 mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Matched from your graph</p>

                <div className="space-y-2.5">
                  {[
                    { initials: "AK", name: "Ananya K.", meta: "IIT Bombay ’24 · Product", score: "98%" },
                    { initials: "RS", name: "Rohit S.", meta: "IIT Delhi ’19 · Hiring SDE-2", score: "94%" },
                    { initials: "MV", name: "Meera V.", meta: "IIT Madras ’21 · Mentor", score: "91%" },
                  ].map((m, i) => (
                    <motion.div
                      key={m.name}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.12 }}
                      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/50 px-3 py-2.5"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center font-display text-xs font-bold text-primary">
                        {m.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold leading-tight flex items-center gap-1.5">
                          {m.name}
                          <Shield className="w-3 h-3 text-accent" />
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">{m.meta}</p>
                      </div>
                      <span className="text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded">{m.score}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 text-accent" /> 3 intros drafted · 0.4s
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -right-3 z-20 rounded-2xl glass-panel px-4 py-3 rotate-[4deg]">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Referral surfaced</p>
              <p className="text-sm font-semibold flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-primary" /> SDE-2 · Bengaluru</p>
            </div>
          </motion.div>
        </div>

        {/* Marquee */}
        <div className="relative border-y border-border/60 bg-background/40 py-4 overflow-hidden">
          <div className="flex w-max animate-marquee gap-10 px-5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={`${m}-${i}`} className="whitespace-nowrap">{m}</span>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="relative border-b border-border/60">
          <div className="max-w-6xl mx-auto px-5 py-7 grid grid-cols-2 sm:grid-cols-4 gap-y-6 sm:divide-x divide-border/60 text-center">
            {METRICS.map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gradient-ai">{s.value}</p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section id="capabilities" className="py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent mb-3">Capabilities</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl mb-12">
            Six systems working quietly in the background of your career.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAPABILITIES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group relative rounded-2xl glass-panel p-6 transition-all hover:-translate-y-1 hover:border-primary/40"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <f.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground border border-border px-1.5 py-0.5 rounded">{f.tag}</span>
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Engine ── */}
      <section id="engine" className="relative py-20 px-5 border-y border-border/60 overflow-hidden">
        <div className="absolute inset-0 bg-aurora opacity-50 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent mb-3">The engine</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-5">
              A verified graph, read by AI — <span className="text-gradient-ai">not a feed</span>.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Every member is verified by institute email, then embedded into a private graph of skills,
              campuses, companies and intent. The engine reads that graph to route the right conversation to you.
            </p>
            <div className="space-y-3">
              {[
                { icon: Shield, t: "Verify", d: "Institute email + IIT check on every account." },
                { icon: NetworkIcon, t: "Embed", d: "Profiles, posts and roles vectorised into one graph." },
                { icon: Brain, t: "Reason", d: "Matches, summaries and intros generated in under a second." },
              ].map((s, i) => (
                <motion.div
                  key={s.t}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 rounded-2xl glass-panel p-4"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                    <s.icon className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{s.t}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.d}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative rounded-3xl glass-panel glow-ring p-8 min-h-[320px] flex items-center justify-center">
            <svg viewBox="0 0 320 260" className="w-full h-auto">
              {[
                [160, 130, 60, 40], [160, 130, 262, 78], [160, 130, 250, 200],
                [160, 130, 70, 205], [160, 130, 158, 34], [160, 130, 40, 128],
              ].map(([x1, y1, x2, y2], i) => (
                <motion.line
                  key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="hsl(var(--primary) / 0.45)" strokeWidth="1.2"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.12 }}
                />
              ))}
              {[[60, 40], [262, 78], [250, 200], [70, 205], [158, 34], [40, 128]].map(([cx, cy], i) => (
                <motion.circle
                  key={i} cx={cx} cy={cy} r="7"
                  fill="hsl(var(--accent) / 0.85)"
                  initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                />
              ))}
              <circle cx="160" cy="130" r="26" fill="hsl(var(--primary) / 0.18)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
              <text x="160" y="135" textAnchor="middle" fontSize="11" fontWeight="700" fill="hsl(var(--foreground))">YOU</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ── Journey ── */}
      <section id="journey" ref={journeyRef} className="py-20 px-5 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent mb-3">Roadmap</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-3">One circle at a time.</h2>
            <p className="text-muted-foreground">Perfect the community, then expand the graph.</p>
          </div>

          <div className="relative h-px bg-border mb-10">
            <motion.div style={{ scaleX: lineScale }} className="absolute inset-0 origin-left bg-gradient-to-r from-primary via-accent to-primary" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {JOURNEY.map((stop, i) => (
              <motion.div
                key={stop.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-5 glass-panel transition-all ${
                  stop.status === "live" ? "glow-ring" : stop.status === "next" ? "" : "opacity-55"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${stop.status === "live" ? "bg-accent animate-pulse-dot" : stop.status === "next" ? "bg-primary/60" : "bg-muted-foreground/40"}`} />
                  <span className="text-sm font-semibold">{stop.label}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{stop.caption}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="join" className="py-24 px-5">
        <div className="max-w-4xl mx-auto rounded-[2rem] glass-panel glow-ring px-8 py-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-aurora opacity-80 pointer-events-none" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Ready to plug into your <span className="text-gradient-ai">circle</span>?
            </h2>
            <p className="text-muted-foreground mb-8">Verification required. Always free.</p>
            <Button size="lg" onClick={goAuth} className="rounded-full px-9 h-12 text-sm font-semibold gap-2 shadow-glow">
              Enter my community <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/60 py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={cirkLogo} alt="Cirkle logo" className="w-6 h-6 rounded" />
            <span className="font-display text-sm font-bold">Cirkle</span>
          </div>
          <nav className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</a>
            <a href="#engine" className="hover:text-foreground transition-colors">Engine</a>
            <a href="#join" className="hover:text-foreground transition-colors">Join</a>
          </nav>
          <p className="text-[11px] text-muted-foreground/60">© 2026 Cirkle</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
