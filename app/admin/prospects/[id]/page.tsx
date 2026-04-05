import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, statusLabel, statusClass } from "@/lib/utils";

const ALL_STATUSES = [
  "NEW_LEAD",
  "CONTACTED",
  "QUALIFIED",
  "CLIENT_ACTIVE",
  "INACTIVE",
  "ARCHIVED"
] as const;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProspectDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await props.params;
  const searchParams = await props.searchParams;

  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect) redirect("/admin/prospects");

  const converted = searchParams.converted === "1";
  const error = typeof searchParams.error === "string" ? searchParams.error : "";

  return (
    <section className="page">
      <div className="container" style={{ maxWidth: "920px" }}>
        <div className="page-header">
          <div className="page-kicker">Prospect detail</div>
          <h1>
            {prospect.firstName} {prospect.lastName}
          </h1>
          <div className="page-meta">
            <span className={`badge badge--${statusClass(prospect.status)}`}>
              {statusLabel(prospect.status)}
            </span>
          </div>
        </div>

        {converted && (
          <div className="feedback" style={{ marginBottom: "1.5rem" }}>
            Converted to client. Account, client profile, and starting goal record are ready for {prospect.email}.
          </div>
        )}

        {error === "already_converted" && (
          <div className="feedback feedback--error" style={{ marginBottom: "1.5rem" }}>
            This prospect is already an active client.
          </div>
        )}

        {error === "invalid_status" && (
          <div className="feedback feedback--error" style={{ marginBottom: "1.5rem" }}>
            Invalid status value submitted.
          </div>
        )}

        {/* Lead info */}
        <div className="admin-panel" style={{ marginBottom: "1.25rem" }}>
          <div className="section__eyebrow">Lead info</div>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span>{prospect.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone</span>
              <span>{prospect.phone ?? "—"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Preferred contact</span>
              <span>{prospect.preferredContact ?? "—"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Submitted</span>
              <span>{formatDate(prospect.createdAt)}</span>
            </div>
            <div className="detail-item detail-item--full">
              <span className="detail-label">Primary goal</span>
              <span>{prospect.goalSummary}</span>
            </div>
            {prospect.message && (
              <div className="detail-item detail-item--full">
                <span className="detail-label">Message</span>
                <span style={{ whiteSpace: "pre-wrap" }}>{prospect.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="admin-panel" style={{ marginBottom: "1.25rem" }}>
          <div className="section__eyebrow">Status</div>
          <form action={`/api/admin/prospects/${id}`} method="post" className="form form--inline">
            <input type="hidden" name="_action" value="update_status" />
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="status">Pipeline status</label>
              <select id="status" name="status" defaultValue={prospect.status}>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{statusLabel(s)}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="button form--inline__submit">
              Update status
            </button>
          </form>
        </div>

        {/* Notes */}
        <div className="admin-panel" style={{ marginBottom: "1.25rem" }}>
          <div className="section__eyebrow">Coach notes</div>
          <form action={`/api/admin/prospects/${id}`} method="post" className="form">
            <input type="hidden" name="_action" value="update_notes" />
            <div className="field">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Follow-up reminders, observations, next steps…"
                defaultValue={prospect.notes ?? ""}
              />
            </div>
            <div className="inline-actions">
              <button type="submit" className="button">Save notes</button>
            </div>
          </form>
        </div>

        {/* Convert to client */}
        {prospect.status !== "CLIENT_ACTIVE" && (
          <div className="admin-panel" style={{ marginBottom: "1.25rem" }}>
            <div className="section__eyebrow">Convert to client</div>
            <p className="muted">
              Creates or updates the account for {prospect.email}, builds the client
              profile, adds the current goal as a starter target, and marks this lead
              as active.
            </p>
            <form action={`/api/admin/prospects/${id}/convert`} method="post">
              <button type="submit" className="button">
                Convert to client
              </button>
            </form>
          </div>
        )}

        <div className="inline-actions">
          <Link href="/admin/prospects" className="button-secondary">
            Back to pipeline
          </Link>
        </div>
      </div>
    </section>
  );
}
