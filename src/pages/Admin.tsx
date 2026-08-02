import { useState, useRef } from "react";
import { ArrowLeft, Upload, Trash2, Users, FileText, Settings2, Image, Ban, CheckCircle2, Search, BarChart3, Shield, TrendingUp, ToggleLeft, Briefcase, Plus, X, Pencil, Download, Database, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const SUB_FILTERS: Record<string, string[]> = {
  "Full-time": ["0-1 yr", "1-3 yr", "3-5 yr", "5-7 yr", "7+ yr"],
  "Part-time": ["0-1 yr", "1-3 yr", "3-5 yr", "5-7 yr", "7+ yr"],
  "Remote": ["0-1 yr", "1-3 yr", "3-5 yr", "5-7 yr", "7+ yr"],
  "Internship": ["0-1 mo", "1-3 mo", "3-6 mo", "6-12 mo"],
};

const NAV_KEYS = [
  { key: "forum", label: "Cirkle" },
  { key: "home", label: "Home" },
  { key: "network", label: "My Network" },
  { key: "consult", label: "Consult" },
  { key: "jobs", label: "Jobs" },
];

const Admin = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState("");
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [jobForm, setJobForm] = useState({ title: "", company: "", location: "", description: "", job_type: "Full-time", experience_level: "", category: "" });
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<Record<string, { inserted: number; error?: string }> | null>(null);
  const [exportCounts, setExportCounts] = useState<Record<string, number> | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleExportData = async () => {
    setExporting(true);
    setImportResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("data-backup", { body: { action: "export" } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setExportCounts(data.counts || {});
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cirkle-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      const total = Object.values(data.counts as Record<string, number>).reduce((a, b) => a + b, 0);
      toast.success(`Exported ${total} rows across ${Object.keys(data.counts).length} tables`);
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally { setExporting(false); }
  };

  const handleImportData = async (file: File) => {
    setImporting(true);
    setImportResults(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const payload = parsed?.data ?? parsed;
      if (!payload || typeof payload !== "object") throw new Error("Invalid backup file");
      const { data, error } = await supabase.functions.invoke("data-backup", { body: { action: "import", data: payload } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setImportResults(data.results || {});
      const total = Object.values(data.results as Record<string, { inserted: number }>).reduce((a, r) => a + (r.inserted || 0), 0);
      const failed = Object.entries(data.results as Record<string, { error?: string }>).filter(([, r]) => r.error).length;
      toast.success(`Imported ${total} rows${failed ? ` (${failed} tables had errors)` : ""}`);
      queryClient.invalidateQueries();
    } catch (e: any) {
      toast.error(e.message || "Import failed");
    } finally { setImporting(false); if (importFileRef.current) importFileRef.current.value = ""; }
  };


  const { data: navConfig } = useQuery({
    queryKey: ["nav-config-admin"],
    queryFn: async () => {
      const { data } = await supabase.from("nav_config").select("*");
      const map: Record<string, any> = {};
      (data as any[])?.forEach((c: any) => { map[c.tab_key] = c; });
      return map;
    },
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
    enabled: !!isAdmin,
  });

  const { data: posts } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
    enabled: !!isAdmin,
  });

  const { data: reports } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
    enabled: !!isAdmin,
  });

  const { data: jobs } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
    enabled: !!isAdmin,
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [usersRes, postsRes, jobsRes, eventsRes, connectionsRes] = await Promise.all([
        supabase.from("profiles").select("user_id", { count: "exact", head: true }),
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("connections").select("id", { count: "exact", head: true }).eq("status", "accepted"),
      ]);
      return { users: usersRes.count ?? 0, posts: postsRes.count ?? 0, jobs: jobsRes.count ?? 0, events: eventsRes.count ?? 0, connections: connectionsRes.count ?? 0 };
    },
    enabled: !!isAdmin,
  });

  const { data: appSettings } = useQuery({
    queryKey: ["admin-app-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*");
      const map: Record<string, string> = {};
      (data as any[])?.forEach((s: any) => { map[s.key] = s.value; });
      return map;
    },
    enabled: !!isAdmin,
  });

  const updateSetting = async (key: string, value: string) => {
    await supabase.from("app_settings").update({ value, updated_at: new Date().toISOString() } as any).eq("key", key);
    queryClient.invalidateQueries({ queryKey: ["admin-app-settings"] });
    queryClient.invalidateQueries({ queryKey: ["app-setting-test-mode"] });
    toast.success(`${key} updated!`);
  };

  const handleIconUpload = async (tabKey: string, file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${tabKey}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("nav-icons").upload(path, file, { upsert: true });
    if (uploadError) { toast.error(uploadError.message); return; }
    const { data: urlData } = supabase.storage.from("nav-icons").getPublicUrl(path);
    const existing = navConfig?.[tabKey];
    if (existing) { await supabase.from("nav_config").update({ icon_url: urlData.publicUrl } as any).eq("tab_key", tabKey); }
    else { await supabase.from("nav_config").insert({ tab_key: tabKey, label: NAV_KEYS.find(n => n.key === tabKey)?.label || tabKey, icon_url: urlData.publicUrl } as any); }
    queryClient.invalidateQueries({ queryKey: ["nav-config"] });
    queryClient.invalidateQueries({ queryKey: ["nav-config-admin"] });
    toast.success("Icon updated!");
  };

  const handleLabelUpdate = async (tabKey: string, label: string) => {
    const existing = navConfig?.[tabKey];
    if (existing) { await supabase.from("nav_config").update({ label } as any).eq("tab_key", tabKey); }
    else { await supabase.from("nav_config").insert({ tab_key: tabKey, label } as any); }
    queryClient.invalidateQueries({ queryKey: ["nav-config"] });
    queryClient.invalidateQueries({ queryKey: ["nav-config-admin"] });
    toast.success("Label updated!");
  };

  const deletePost = async (postId: string) => {
    await supabase.from("posts").delete().eq("id", postId);
    queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    toast.success("Post deleted");
  };

  const toggleVerify = async (userId: string, current: boolean) => {
    await supabase.from("profiles").update({ is_verified: !current }).eq("user_id", userId);
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    toast.success(current ? "Unverified" : "Verified!");
  };

  const saveJob = useMutation({
    mutationFn: async () => {
      if (!user) return;
      if (editingJob) {
        const { error } = await supabase.from("jobs").update({
          title: jobForm.title, company: jobForm.company, location: jobForm.location,
          description: jobForm.description || null, job_type: jobForm.job_type,
          experience_level: jobForm.experience_level || null, category: jobForm.category || null,
        }).eq("id", editingJob.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("jobs").insert({
          title: jobForm.title, company: jobForm.company, location: jobForm.location,
          description: jobForm.description || null, job_type: jobForm.job_type,
          experience_level: jobForm.experience_level || null, category: jobForm.category || null,
          created_by: user.id, community_id: "default",
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setShowJobForm(false); setEditingJob(null);
      setJobForm({ title: "", company: "", location: "", description: "", job_type: "Full-time", experience_level: "", category: "" });
      toast.success(editingJob ? "Job updated!" : "Job posted!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteJob = async (jobId: string) => {
    await supabase.from("jobs").delete().eq("id", jobId);
    queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    queryClient.invalidateQueries({ queryKey: ["jobs"] });
    toast.success("Job deleted");
  };

  const openEditJob = (job: any) => {
    setJobForm({ title: job.title, company: job.company, location: job.location, description: job.description || "", job_type: job.job_type, experience_level: job.experience_level || "", category: job.category || "" });
    setEditingJob(job);
    setShowJobForm(true);
  };

  const filteredUsers = users?.filter((u: any) =>
    !userSearch || (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.iit_name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.user_id || "").includes(userSearch)
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <Shield className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-bold text-foreground">Admin Access Required</h2>
        <p className="text-sm text-muted-foreground mt-1">You don't have permission to access this page.</p>
        <Button className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Job Form Modal */}
      {showJobForm && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-border p-6 animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">{editingJob ? "Edit Job" : "Post a Job"}</h3>
              <button onClick={() => { setShowJobForm(false); setEditingJob(null); }} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div><Label className="text-sm">Title *</Label><Input placeholder="Frontend Developer" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} className="bg-secondary border-border mt-1" /></div>
              <div><Label className="text-sm">Company *</Label><Input placeholder="Acme Inc" value={jobForm.company} onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} className="bg-secondary border-border mt-1" /></div>
              <div><Label className="text-sm">Location *</Label><Input placeholder="Remote / Bangalore" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} className="bg-secondary border-border mt-1" /></div>
              <div>
                <Label className="text-sm">Job Type</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {["Full-time", "Part-time", "Internship", "Remote"].map((t) => (
                    <button key={t} onClick={() => setJobForm({ ...jobForm, job_type: t, experience_level: "" })}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${jobForm.job_type === t ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground"}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm">Experience Level</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(SUB_FILTERS[jobForm.job_type] || SUB_FILTERS["Full-time"]).map((lvl) => (
                    <button key={lvl} onClick={() => setJobForm({ ...jobForm, experience_level: jobForm.experience_level === lvl ? "" : lvl })}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${jobForm.experience_level === lvl ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground"}`}>{lvl}</button>
                  ))}
                </div>
              </div>
              <div><Label className="text-sm">Description</Label><Textarea placeholder="Job responsibilities, requirements..." value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} className="bg-secondary border-border mt-1" rows={3} /></div>
              <Button className="w-full h-11 rounded-xl" onClick={() => saveJob.mutate()} disabled={saveJob.isPending || !jobForm.title || !jobForm.company || !jobForm.location}>
                {saveJob.isPending ? "Saving..." : editingJob ? "Update Job" : "Post Job"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-4">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="p-1 text-foreground hover-scale"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Super Admin</h1>
            <p className="text-[10px] text-muted-foreground">Manage users, content & settings</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Users", value: stats?.users ?? 0, icon: Users, color: "text-primary" },
            { label: "Posts", value: stats?.posts ?? 0, icon: FileText, color: "text-[hsl(var(--success))]" },
            { label: "Jobs", value: stats?.jobs ?? 0, icon: BarChart3, color: "text-[hsl(var(--warning))]" },
            { label: "Events", value: stats?.events ?? 0, icon: TrendingUp, color: "text-destructive" },
            { label: "Connections", value: stats?.connections ?? 0, icon: Users, color: "text-primary" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
              <div><p className="text-2xl font-bold text-foreground">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList className="w-full bg-secondary rounded-xl h-11 mb-4 flex-wrap">
            <TabsTrigger value="users" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold"><Users className="w-3.5 h-3.5 mr-1" /> Users</TabsTrigger>
            <TabsTrigger value="jobs" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold"><Briefcase className="w-3.5 h-3.5 mr-1" /> Jobs</TabsTrigger>
            <TabsTrigger value="posts" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold"><FileText className="w-3.5 h-3.5 mr-1" /> Posts</TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold"><Ban className="w-3.5 h-3.5 mr-1" /> Reports</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold"><Settings2 className="w-3.5 h-3.5 mr-1" /> Settings</TabsTrigger>
            <TabsTrigger value="data" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold"><Database className="w-3.5 h-3.5 mr-1" /> Data</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-9 h-10 rounded-xl bg-secondary border-0" />
            </div>
            <p className="text-xs text-muted-foreground">{filteredUsers?.length || 0} users found</p>
            <div className="grid gap-2 lg:grid-cols-2">
              {filteredUsers?.map((u: any) => (
                <div key={u.user_id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                  {u.avatar_url ? <img src={u.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                    : <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-sm font-bold text-primary">{(u.name || "?")[0]}</span></div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{u.name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.headline || "No headline"}</p>
                    <p className="text-[10px] text-muted-foreground">{u.iit_name || "No IIT"} · {u.role} · {u.location || "Unknown"}</p>
                  </div>
                  <button onClick={() => toggleVerify(u.user_id, u.is_verified)}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full cursor-pointer transition-colors ${u.is_verified ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}>
                    {u.is_verified ? "✓ Verified" : "Verify"}
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{jobs?.length || 0} jobs</p>
              <Button size="sm" className="gap-1 rounded-full" onClick={() => { setEditingJob(null); setJobForm({ title: "", company: "", location: "", description: "", job_type: "Full-time", experience_level: "", category: "" }); setShowJobForm(true); }}>
                <Plus className="w-3.5 h-3.5" /> Post Job
              </Button>
            </div>
            <div className="grid gap-2 lg:grid-cols-2">
              {jobs?.map((job: any) => (
                <div key={job.id} className="bg-card border border-border rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.company} · {job.location}</p>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{job.job_type}</span>
                        {job.experience_level && <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-foreground">{job.experience_level}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEditJob(job)} className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteJob(job.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">{posts?.length || 0} posts</p>
            <div className="grid gap-2 lg:grid-cols-2">
              {posts?.map((p: any) => (
                <div key={p.id} className="bg-card border border-border rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-foreground line-clamp-3 flex-1">{p.content}</p>
                    <button onClick={() => deletePost(p.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  {p.image_url && <img src={p.image_url} alt="" className="mt-2 rounded-lg h-20 object-cover" />}
                  <div className="flex items-center gap-2 mt-2">
                    {p.is_anonymous && <span className="text-[10px] bg-[hsl(var(--anonymous))]/10 text-[hsl(var(--anonymous))] px-2 py-0.5 rounded-full">Anonymous</span>}
                    <span className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">{reports?.length || 0} reports</p>
            {reports?.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle2 className="w-10 h-10 text-[hsl(var(--success))] mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No reports to review</p>
              </div>
            )}
            {reports?.map((r: any) => (
              <div key={r.id} className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-start gap-3">
                  <Ban className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">Report on {r.entity_type}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.reason || "No reason provided"}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {/* Show Home & Network Toggle */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><ToggleLeft className="w-5 h-5 text-primary" /></div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Show Home & Network</p>
                    <p className="text-xs text-muted-foreground">When OFF, Home feed and Network tabs are hidden for all users</p>
                  </div>
                </div>
                <Switch checked={appSettings?.show_home_network === "true"} onCheckedChange={(checked) => {
                  updateSetting("show_home_network", checked ? "true" : "false");
                  queryClient.invalidateQueries({ queryKey: ["app-settings"] });
                }} />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Shield className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-sm font-semibold text-foreground">Authentication providers</p>
                <p className="text-xs text-muted-foreground">Configure SMS and Google OAuth securely in the Supabase dashboard. Provider credentials are never stored in app tables.</p>
              </div>
            </div>
          </TabsContent>

          {/* Data Tab — Export / Import all tables */}
          <TabsContent value="data" className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Download className="w-5 h-5 text-primary" /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Export All Data</p>
                  <p className="text-xs text-muted-foreground">Download a full JSON backup of every row across all tables.</p>
                </div>
              </div>
              <Button onClick={handleExportData} disabled={exporting} className="w-full h-11 rounded-xl gap-2">
                {exporting ? <><Loader2 className="w-4 h-4 animate-spin" /> Exporting…</> : <><Download className="w-4 h-4" /> Download Backup (.json)</>}
              </Button>
              {exportCounts && (
                <div className="mt-3 max-h-48 overflow-y-auto text-xs text-muted-foreground space-y-0.5 font-mono">
                  {Object.entries(exportCounts).sort().map(([t, n]) => (
                    <div key={t} className="flex justify-between"><span>{t}</span><span className="text-foreground">{n}</span></div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--warning))]/10 flex items-center justify-center flex-shrink-0"><Upload className="w-5 h-5 text-[hsl(var(--warning))]" /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Import Data</p>
                  <p className="text-xs text-muted-foreground">Upload a previously exported JSON to restore or merge rows. Existing rows with the same primary key are updated.</p>
                </div>
              </div>
              <input ref={importFileRef} type="file" accept="application/json,.json" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportData(f); }} />
              <Button variant="outline" onClick={() => importFileRef.current?.click()} disabled={importing} className="w-full h-11 rounded-xl gap-2">
                {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</> : <><Upload className="w-4 h-4" /> Choose Backup File</>}
              </Button>
              {importResults && (
                <div className="mt-3 max-h-48 overflow-y-auto text-xs space-y-0.5 font-mono">
                  {Object.entries(importResults).sort().map(([t, r]) => (
                    <div key={t} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{t}</span>
                      <span className={r.error ? "text-destructive truncate" : "text-foreground"}>{r.error ? `⚠ ${r.error}` : r.inserted}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
