// Admin-only export/import of ALL public tables as JSON
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Every public table we back up. Order matters for import (parents first).
const TABLES = [
  "app_settings",
  "nav_config",
  "profiles",
  "user_roles",
  "education",
  "professional_experience",
  "custom_options",
  "custom_skills",
  "connections",
  "posts",
  "comments",
  "reactions",
  "polls",
  "poll_votes",
  "chat_rooms",
  "chat_members",
  "messages",
  "message_deleted_for_user",
  "pinned_messages",
  "user_pinned_messages",
  "ad_messages",
  "stories",
  "events",
  "rsvps",
  "jobs",
  "applications",
  "consultations",
  "blogs",
  "notifications",
  "reports",
  "saved_views",
  "verifications",
  "verification_codes",
  "verification_audit_log",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    // Auth check — must be admin
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) return json({ error: "Unauthorized" }, 401);

    const asUser = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userRes } = await asUser.auth.getUser();
    const uid = userRes?.user?.id;
    if (!uid) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: role } = await admin
      .from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
    if (!role) return json({ error: "Admin only" }, 403);

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action = body?.action || "export";

    if (action === "export") {
      const dump: Record<string, any[]> = {};
      const counts: Record<string, number> = {};
      for (const t of TABLES) {
        // Page through with range to bypass 1000-row default
        const rows: any[] = [];
        let from = 0;
        const step = 1000;
        while (true) {
          const { data, error } = await admin.from(t).select("*").range(from, from + step - 1);
          if (error) { console.warn(`skip ${t}: ${error.message}`); break; }
          if (!data || data.length === 0) break;
          rows.push(...data);
          if (data.length < step) break;
          from += step;
        }
        dump[t] = rows;
        counts[t] = rows.length;
      }
      return json({ exported_at: new Date().toISOString(), counts, data: dump });
    }

    if (action === "import") {
      const payload = body?.data;
      if (!payload || typeof payload !== "object") return json({ error: "Missing data" }, 400);
      const results: Record<string, { inserted: number; error?: string }> = {};
      for (const t of TABLES) {
        const rows = payload[t];
        if (!Array.isArray(rows) || rows.length === 0) { results[t] = { inserted: 0 }; continue; }
        // Upsert in chunks; supabase-js uses PK for conflict target
        let inserted = 0;
        const chunkSize = 500;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          const { error, count } = await admin.from(t).upsert(chunk, { ignoreDuplicates: false, count: "exact" });
          if (error) { results[t] = { inserted, error: error.message }; break; }
          inserted += count ?? chunk.length;
          results[t] = { inserted };
        }
      }
      return json({ imported_at: new Date().toISOString(), results });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message || e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
