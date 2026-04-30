import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Email Queue",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, nocache: true },
  },
};

const KIND_LABELS = {
  CLIENT_CHECKIN_REMINDER: "Client check-in reminder",
  CLIENT_GYM_PHOTO_REMINDER: "Client gym proof reminder",
  ADMIN_CHECKIN_REVIEW_NOTICE: "Coach review notice",
  CLIENT_COACH_FEEDBACK: "Client coach feedback",
  CLIENT_LOW_ADHERENCE_FOLLOWUP: "Client low-adherence follow-up",
};

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "SENT":
      return "badge--active";
    case "FAILED":
      return "badge--archived";
    case "SKIPPED":
      return "badge--inactive";
    default:
      return "badge--new";
  }
}

function getSearchValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

export default async function AdminEmailsPage(props: { searchParams: SearchParams }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const searchParams = await props.searchParams;
  const emails = await prisma.emailQueue.findMany({
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
    take: 100,
  });

  const enabledCount = emails.filter((email) => email.isEnabled && ["DRAFT", "FAILED"].includes(email.status)).length;
  const draftCount = emails.filter((email) => email.status === "DRAFT").length;
  const failedCount = emails.filter((email) => email.status === "FAILED").length;
  const generated = getSearchValue(searchParams.generated);
  const sent = getSearchValue(searchParams.sent);
  const failed = getSearchValue(searchParams.failed);

  return (
    <section className="page">
      <div className="container">
        <div className="page-header">
          <div className="page-kicker">Admin email controls</div>
          <h1>
            Email <span className="accent">queue</span>
          </h1>
          <p>Generate reminder drafts, turn individual emails on or off, then send only the enabled drafts.</p>
        </div>

        {generated ? (
          <div className="feedback" style={{ marginBottom: "1rem" }}>
            Refreshed weekly drafts. {generated} draft opportunities checked.
          </div>
        ) : null}

        {sent || failed ? (
          <div className={failed && failed !== "0" ? "feedback feedback--error" : "feedback"} style={{ marginBottom: "1rem" }}>
            Send complete. Sent {sent ?? "0"}. Failed {failed ?? "0"}.
          </div>
        ) : null}

        <div className="admin-summary command-summary">
          <div className="metric-card">
            <strong>{draftCount}</strong>
            <span>Draft emails</span>
          </div>
          <div className="metric-card">
            <strong>{enabledCount}</strong>
            <span>Enabled to send</span>
          </div>
          <div className="metric-card">
            <strong>{failedCount}</strong>
            <span>Failed sends</span>
          </div>
        </div>

        <div className="inline-actions" style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
          <form action="/api/admin/emails/generate" method="post">
            <button type="submit" className="button">
              Generate this week&apos;s drafts
            </button>
          </form>
          <form action="/api/admin/emails/send-enabled" method="post">
            <button type="submit" className="button-secondary" disabled={enabledCount === 0}>
              Send enabled emails
            </button>
          </form>
        </div>

        <div className="admin-panel">
          <div className="section__eyebrow">Queue</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Enabled</th>
                  <th>Email</th>
                  <th>Recipient</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {emails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      No email drafts yet. Generate this week&apos;s drafts to start.
                    </td>
                  </tr>
                ) : (
                  emails.map((email) => {
                    const canEdit = email.status === "DRAFT" || email.status === "FAILED";

                    return (
                      <tr key={email.id}>
                        <td>
                          {canEdit ? (
                            <form action={`/api/admin/emails/${email.id}/toggle`} method="post">
                              <input
                                type="checkbox"
                                name="isEnabled"
                                defaultChecked={email.isEnabled}
                                aria-label={`Enable ${email.subject}`}
                              />
                              <button type="submit" className="table-action" style={{ marginLeft: "0.5rem" }}>
                                Save
                              </button>
                            </form>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <strong>{KIND_LABELS[email.kind]}</strong>
                          <p className="muted">{email.subject}</p>
                          <details>
                            <summary className="table-action">Preview</summary>
                            <p style={{ whiteSpace: "pre-wrap", marginTop: "0.75rem" }}>{email.body}</p>
                            {email.lastError ? (
                              <p className="feedback feedback--error" style={{ marginTop: "0.75rem" }}>
                                {email.lastError}
                              </p>
                            ) : null}
                          </details>
                        </td>
                        <td>{email.toEmail}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(email.status)}`}>
                            {email.status}
                          </span>
                        </td>
                        <td>{formatDateTime(email.createdAt)}</td>
                        <td>
                          {canEdit ? (
                            <form action={`/api/admin/emails/${email.id}/skip`} method="post">
                              <button type="submit" className="table-action">
                                Skip
                              </button>
                            </form>
                          ) : email.sentAt ? (
                            formatDateTime(email.sentAt)
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
