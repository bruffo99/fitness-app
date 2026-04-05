import { getBaseUrl } from "@/lib/urls";

type ProspectEmailPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  goalSummary: string;
  preferredContact: string | null;
  message: string | null;
};

type BridgeMessage = {
  to: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  replyTo?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getMailConfig() {
  const notificationEmail =
    process.env.PROSPECT_NOTIFICATION_EMAIL?.trim() ??
    process.env.ADMIN_BOOTSTRAP_EMAIL?.trim();
  const bridgeUrl = process.env.GOG_MAIL_BRIDGE_URL?.trim();
  const bridgeToken = process.env.GOG_MAIL_BRIDGE_TOKEN?.trim();

  if (!notificationEmail || !bridgeUrl || !bridgeToken) {
    return null;
  }

  return {
    notificationEmail,
    bridgeUrl,
    bridgeToken,
    ownerName: process.env.OWNER_NAME?.trim() || "Brian Ruffo",
    businessName: process.env.BUSINESS_NAME?.trim() || "Ruffo Fitness",
    replyTo: process.env.GMAIL_USER?.trim() || process.env.ADMIN_BOOTSTRAP_EMAIL?.trim() || undefined,
  };
}

async function buildMessages(payload: ProspectEmailPayload): Promise<BridgeMessage[]> {
  const config = getMailConfig();
  if (!config) {
    return [];
  }

  const safeFirstName = escapeHtml(payload.firstName);
  const safeLastName = escapeHtml(payload.lastName);
  const safeEmail = escapeHtml(payload.email);
  const safePhone = escapeHtml(payload.phone ?? "—");
  const safeGoalSummary = escapeHtml(payload.goalSummary);
  const safePreferredContact = escapeHtml(payload.preferredContact ?? "—");
  const safeMessage = escapeHtml(payload.message ?? "—");
  const safeBusinessName = escapeHtml(config.businessName);
  const safeOwnerName = escapeHtml(config.ownerName);
  const appUrl = escapeHtml(await getBaseUrl());

  return [
    {
      to: payload.email,
      subject: "You're in — let's get to work",
      body: `${payload.firstName}, you're in.\n\nI got your info and I'll be reaching out personally. No automated programs, no generic plans — just a real conversation about where you are and where you want to be.\n\nIn the meantime: stay consistent, stay focused. The work you put in today is the body you have tomorrow.\n\n— ${config.ownerName}\n${appUrl}\n${config.businessName}`,
      bodyHtml: `
        <div style="background:#0d0d0d;color:#fff;font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:40px 32px;">
          <div style="margin-bottom:32px;">
            <span style="font-size:22px;font-weight:900;letter-spacing:-0.5px;">RUFFO</span>
            <span style="font-size:22px;font-weight:900;color:#f59e0b;"> FITNESS</span>
          </div>
          <h1 style="font-size:28px;font-weight:900;line-height:1.1;margin:0 0 16px;">
            ${safeFirstName}, you're in.
          </h1>
          <div style="height:3px;width:48px;background:linear-gradient(90deg,#f59e0b,#b45309);border-radius:2px;margin-bottom:24px;"></div>
          <p style="color:rgba(255,255,255,0.6);line-height:1.7;margin:0 0 20px;">
            I got your info and I&apos;ll be reaching out personally. No automated programs, no generic plans, just a real conversation about where you are and where you want to be.
          </p>
          <p style="color:rgba(255,255,255,0.6);line-height:1.7;margin:0 0 32px;">
            In the meantime: stay consistent, stay focused. The work you put in today is the body you have tomorrow.
          </p>
          <p style="color:rgba(255,255,255,0.4);font-size:13px;border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;margin:0;">
            — ${safeOwnerName}<br>
            <a href="${appUrl}" style="color:#f59e0b;text-decoration:none;">${appUrl}</a><br>
            ${safeBusinessName}
          </p>
        </div>
      `,
      replyTo: config.replyTo,
    },
    {
      to: config.notificationEmail,
      subject: `New lead: ${payload.firstName} ${payload.lastName}`,
      body: `New signup\n\nName: ${payload.firstName} ${payload.lastName}\nEmail: ${payload.email}\nPhone: ${payload.phone ?? "—"}\nGoal: ${payload.goalSummary}\nPreferred contact: ${payload.preferredContact ?? "—"}\nMessage: ${payload.message ?? "—"}`,
      bodyHtml: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;">
          <h2 style="margin:0 0 16px;">New signup</h2>
          <table style="border-collapse:collapse;width:100%;">
            <tr><td style="padding:6px 0;color:#666;">Name</td><td style="padding:6px 0;">${safeFirstName} ${safeLastName}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
            <tr><td style="padding:6px 0;color:#666;">Phone</td><td style="padding:6px 0;">${safePhone}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Goal</td><td style="padding:6px 0;">${safeGoalSummary}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Preferred contact</td><td style="padding:6px 0;">${safePreferredContact}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Message</td><td style="padding:6px 0;">${safeMessage}</td></tr>
          </table>
        </div>
      `,
      replyTo: payload.email,
    },
  ];
}

export async function sendProspectEmails(payload: ProspectEmailPayload) {
  const config = getMailConfig();
  if (!config) {
    return;
  }

  const messages = await buildMessages(payload);
  if (messages.length === 0) {
    return;
  }

  try {
    const response = await fetch(`${config.bridgeUrl.replace(/\/$/, "")}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bridge-token": config.bridgeToken,
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Mail bridge request failed:", response.status, text);
    }
  } catch (error) {
    console.error("Mail bridge request failed:", error);
  }
}
