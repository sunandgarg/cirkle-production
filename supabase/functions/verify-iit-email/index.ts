import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const IIT_DOMAINS: Record<string, string[]> = {
  "IIT Bombay": ["iitb.ac.in", "alumni.iitb.ac.in"],
  "IIT Delhi": ["iitd.ac.in", "alumni.iitd.ac.in"],
  "IIT Madras": ["iitm.ac.in", "alumni.iitm.ac.in"],
  "IIT Kanpur": ["iitk.ac.in", "alumni.iitk.ac.in"],
  "IIT Kharagpur": ["iitkgp.ac.in", "alumni.iitkgp.ac.in"],
  "IIT Roorkee": ["iitr.ac.in", "alumni.iitr.ac.in"],
  "IIT Guwahati": ["iitg.ac.in", "alumni.iitg.ac.in"],
  "IIT Hyderabad": ["iith.ac.in", "alumni.iith.ac.in"],
  "IIT BHU": ["iitbhu.ac.in", "alumni.iitbhu.ac.in"],
  "IIT Indore": ["iiti.ac.in", "alumni.iiti.ac.in"],
  "IIT Ropar": ["iitrpr.ac.in", "alumni.iitrpr.ac.in"],
  "IIT Patna": ["iitp.ac.in", "alumni.iitp.ac.in"],
  "IIT Bhubaneswar": ["iitbbs.ac.in", "alumni.iitbbs.ac.in"],
  "IIT Gandhinagar": ["iitgn.ac.in", "alumni.iitgn.ac.in"],
  "IIT Jodhpur": ["iitj.ac.in", "alumni.iitj.ac.in"],
  "IIT Mandi": ["iitmandi.ac.in", "alumni.iitmandi.ac.in"],
  "IIT Tirupati": ["iittp.ac.in", "alumni.iittp.ac.in"],
  "IIT Palakkad": ["iitpkd.ac.in", "alumni.iitpkd.ac.in"],
  "IIT Dharwad": ["iitdh.ac.in", "alumni.iitdh.ac.in"],
  "IIT Bhilai": ["iitbhilai.ac.in", "alumni.iitbhilai.ac.in"],
  "IIT Goa": ["iitgoa.ac.in", "alumni.iitgoa.ac.in"],
  "IIT Jammu": ["iitjammu.ac.in", "alumni.iitjammu.ac.in"],
  "IIT Dhanbad (ISM)": ["iitism.ac.in", "alumni.iitism.ac.in"],
};

function corsHeaders(req: Request): Record<string, string> {
  const configured = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const requestOrigin = req.headers.get("Origin") ?? "";
  const allowedOrigin = configured.length === 0
    ? "*"
    : configured.includes(requestOrigin) ? requestOrigin : configured[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

async function hashCode(email: string, code: string, secret: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${email}:${code}:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const codeSecret = Deno.env.get("VERIFICATION_CODE_SECRET");
    if (!supabaseUrl || !anonKey || !serviceKey || !codeSecret) {
      return json(req, { error: "Email verification is not configured" }, 503);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json(req, { error: "Unauthorized" }, 401);

    const { email, code, iit_name, student_status } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedCode = typeof code === "string" ? code.trim() : "";
    const domain = normalizedEmail.split("@")[1] ?? "";
    const instituteDomains = IIT_DOMAINS[iit_name];
    const allowedDomains = student_status === "current_student"
      ? instituteDomains?.slice(0, 1)
      : student_status === "alumni" ? instituteDomains : undefined;
    if (!/^\d{6}$/.test(normalizedCode) || !allowedDomains?.includes(domain)) {
      return json(req, { error: "Invalid verification request" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: codeRow, error: codeError } = await admin
      .from("verification_codes")
      .select("id, code_hash, attempts")
      .eq("user_id", user.id)
      .eq("email", normalizedEmail)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (codeError) throw codeError;

    const expectedHash = await hashCode(normalizedEmail, normalizedCode, codeSecret);
    if (!codeRow || codeRow.attempts >= 5) {
      return json(req, { error: "Invalid or expired code" }, 400);
    }
    if (!codeRow.code_hash || !safeEqual(codeRow.code_hash, expectedHash)) {
      await admin
        .from("verification_codes")
        .update({ attempts: codeRow.attempts + 1 })
        .eq("id", codeRow.id);
      return json(req, { error: "Invalid or expired code" }, 400);
    }

    const { data: consumedCode, error: consumeError } = await admin
      .from("verification_codes")
      .update({ used: true })
      .eq("id", codeRow.id)
      .eq("used", false)
      .select("id")
      .maybeSingle();
    if (consumeError) throw consumeError;
    if (!consumedCode) return json(req, { error: "Invalid or expired code" }, 400);

    const now = new Date().toISOString();
    const { error: verificationError } = await admin.from("verifications").upsert({
      user_id: user.id,
      iit_email: normalizedEmail,
      iit_email_normalized: normalizedEmail,
      iit_domain: domain,
      email_verified_at: now,
      verified_status: "VERIFIED",
      locked_to_phone: user.phone ?? user.user_metadata?.phone ?? null,
      updated_at: now,
    }, { onConflict: "user_id" });
    if (verificationError) throw verificationError;

    const { error: profileError } = await admin
      .from("profiles")
      .update({
        iit_name,
        student_status,
        iit_email: normalizedEmail,
        is_verified: true,
      })
      .eq("user_id", user.id);
    if (profileError) throw profileError;

    return json(req, { success: true });
  } catch (error) {
    console.error("verify-iit-email failed", error);
    return json(req, { error: "Unable to verify this email" }, 500);
  }
});
