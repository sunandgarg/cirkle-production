import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const FAST2SMS_ENDPOINT = "https://www.fast2sms.com/dev/otp/send";
const DEFAULT_OTP_ID = "9318bdac9f";

type SendSmsPayload = {
  user?: { phone?: string };
  sms?: { otp?: string };
};

function hookError(httpCode: number, message: string) {
  return Response.json({ error: { http_code: httpCode, message } });
}

function verifyHook(body: string, headers: Headers, secret: string): SendSmsPayload {
  const signingSecret = secret.replace(/^v1,whsec_/, "");
  const webhook = new Webhook(signingSecret);
  return webhook.verify(body, Object.fromEntries(headers.entries())) as SendSmsPayload;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const hookSecret = Deno.env.get("SEND_SMS_HOOK_SECRET");
  const apiKey = Deno.env.get("FAST2SMS_API_KEY");
  const otpId = Deno.env.get("FAST2SMS_OTP_ID") ?? DEFAULT_OTP_ID;
  if (!hookSecret || !apiKey) {
    console.error("Fast2SMS hook secrets are not configured");
    return hookError(503, "SMS delivery is temporarily unavailable");
  }

  const rawBody = await req.text();
  let payload: SendSmsPayload;
  try {
    payload = verifyHook(rawBody, req.headers, hookSecret);
  } catch (error) {
    console.error("Rejected invalid Send SMS hook signature", error);
    return new Response("Invalid webhook signature", { status: 401 });
  }

  const phone = payload.user?.phone ?? "";
  const otp = payload.sms?.otp ?? "";
  const indianMobile = phone.match(/^\+91([6-9]\d{9})$/)?.[1];
  if (!indianMobile || !/^\d{6}$/.test(otp)) {
    return hookError(400, "A valid Indian mobile number and 6-digit OTP are required");
  }

  try {
    const providerResponse = await fetch(FAST2SMS_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile: indianMobile,
        otp_id: otpId,
        otp_expiry: 10,
        otp_length: 6,
        otp,
      }),
      signal: AbortSignal.timeout(4_000),
    });

    const providerBody = await providerResponse.json().catch(() => null) as
      | { return?: boolean; message?: string }
      | null;
    if (!providerResponse.ok || providerBody?.return === false) {
      console.error("Fast2SMS rejected OTP request", {
        status: providerResponse.status,
        message: providerBody?.message,
      });
      return hookError(502, "The verification SMS could not be sent");
    }

    return Response.json({});
  } catch (error) {
    console.error("Fast2SMS request failed", error);
    return hookError(502, "The verification SMS could not be sent");
  }
});
