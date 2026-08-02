import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SESv2Client, SendEmailCommand } from "npm:@aws-sdk/client-sesv2@3.1101.0";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const awsAccessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
    const awsSecretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const awsSessionToken = Deno.env.get("AWS_SESSION_TOKEN");
    const awsRegion = Deno.env.get("AWS_REGION");
    const fromEmail = Deno.env.get("AWS_SES_FROM_EMAIL");
    const codeSecret = Deno.env.get("VERIFICATION_CODE_SECRET");
    const testMode = Deno.env.get("EMAIL_OTP_TEST_MODE") === "true";
    if (
      !supabaseUrl || !anonKey || !serviceKey || !codeSecret ||
      (!testMode && (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion || !fromEmail))
    ) {
      return json(req, { error: "Email verification is not configured" }, 503);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json(req, { error: "Unauthorized" }, 401);

    const { email, iit_name, student_status } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const domain = normalizedEmail.split("@")[1] ?? "";
    const instituteDomains = IIT_DOMAINS[iit_name];
    const allowedDomains = student_status === "current_student"
      ? instituteDomains?.slice(0, 1)
      : student_status === "alumni" ? instituteDomains : undefined;
    if (!normalizedEmail || !allowedDomains?.includes(domain)) {
      return json(req, { error: "Use a valid email for the selected IIT" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: existing } = await admin
      .from("verifications")
      .select("user_id, iit_email_normalized, verified_status")
      .eq("iit_email_normalized", normalizedEmail)
      .eq("verified_status", "VERIFIED")
      .maybeSingle();
    if (existing && existing.user_id !== user.id) {
      return json(req, { error: "This IIT email is already linked to another account", code: "EMAIL_ALREADY_LINKED" }, 409);
    }
    if (existing?.user_id === user.id) {
      return json(req, { success: true, already_verified: true });
    }

    const { data: currentUserVerification } = await admin
      .from("verifications")
      .select("iit_email_normalized, verified_status")
      .eq("user_id", user.id)
      .eq("verified_status", "VERIFIED")
      .maybeSingle();
    if (
      currentUserVerification &&
      currentUserVerification.iit_email_normalized !== normalizedEmail
    ) {
      return json(req, {
        error: "Your account is already linked to a different verified IIT email",
        code: "USER_ALREADY_VERIFIED",
      }, 409);
    }

    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { data: recent } = await admin
      .from("verification_codes")
      .select("id")
      .eq("email", normalizedEmail)
      .eq("used", false)
      .gte("created_at", oneMinuteAgo)
      .limit(1);
    if (recent?.length) return json(req, { error: "Please wait before requesting another code" }, 429);

    const oneHourAgo = new Date(Date.now() - 60 * 60_000).toISOString();
    const { count: hourlyCount } = await admin
      .from("verification_codes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);
    if ((hourlyCount ?? 0) >= 5) {
      return json(req, { error: "Too many codes requested. Please try again later" }, 429);
    }

    const random = new Uint32Array(1);
    crypto.getRandomValues(random);
    const code = testMode ? "123456" : String(100000 + (random[0] % 900000));
    const codeHash = await hashCode(normalizedEmail, code, codeSecret);
    const { data: codeRow, error: insertError } = await admin
      .from("verification_codes")
      .insert({
        user_id: user.id,
        email: normalizedEmail,
        code: null,
        code_hash: codeHash,
        expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
      })
      .select("id")
      .single();
    if (insertError) throw insertError;

    if (!testMode) {
      const ses = new SESv2Client({
        region: awsRegion!,
        credentials: {
          accessKeyId: awsAccessKeyId!,
          secretAccessKey: awsSecretAccessKey!,
          ...(awsSessionToken ? { sessionToken: awsSessionToken } : {}),
        },
      });
      try {
        await ses.send(new SendEmailCommand({
          FromEmailAddress: fromEmail!,
          Destination: { ToAddresses: [normalizedEmail] },
          Content: {
            Simple: {
              Subject: { Data: "Your Cirkle verification code", Charset: "UTF-8" },
              Body: {
                Text: {
                  Data: `Your Cirkle verification code is ${code}. It expires in 10 minutes.`,
                  Charset: "UTF-8",
                },
                Html: {
                  Data: `<p>Your Cirkle verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>This code expires in 10 minutes.</p>`,
                  Charset: "UTF-8",
                },
              },
            },
          },
        }));
      } catch (emailError) {
        await admin.from("verification_codes").delete().eq("id", codeRow.id);
        console.error("Amazon SES rejected verification email", emailError);
        return json(req, { error: "Verification email could not be sent" }, 502);
      }
    }

    return json(req, { success: true, test_mode: testMode });
  } catch (error) {
    console.error("send-verification-email failed", error);
    return json(req, { error: "Unable to send verification email" }, 500);
  }
});
