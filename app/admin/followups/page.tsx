import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { StatusBadge } from "@/app/components/StatusBadge";
import { prisma } from "@/lib/prisma";
import { formatDate, type ProspectStatusValue } from "@/lib/utils";

type FollowUpProspect = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  goalType: string | null;
  goalSummary: string;
  status: ProspectStatusValue;
  followUpDate: Date;
};

const GOAL_TYPE_LABELS: Record<string, string> = {
  fat_loss: "Fat loss",
  muscle_gain: "Muscle gain",
  body_recomp: "Body recomposition",
  performance: "Athletic performance",
  general_health: "General health & fitness",
};

function getEndOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
}

function getUpcomingLimit() {
  const endOfToday = getEndOfToday();
  return new Date(endOfToday.getTime() + 14 * 24 * 60 * 60 * 1000);
}

function goalLabel(prospect: FollowUpProspect) {
  if (prospect.goalType) {
    return GOAL_TYPE_LABELS[prospect.goalType] ?? prospect.goalType;
  }

  return prospect.goalSummary;
}

function FollowUpSection({
  eyebrow,
  prospects,
}: {
  eyebrow: string;
  prospects: FollowUpProspect[];
}) {
  return (
    <div className="admin-panel" style={{ marginTop: "1.5rem" }}>
      <div className="section__eyebrow">{eyebrow}</div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Goal</th>
              <th>Status</th>
              <th>Follow-up</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {prospects.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  No prospects in this window.
                </td>
              </tr>
            ) : (
              prospects.map((prospect) => (
                <tr key={prospect.id}>
                  <td>
                    {prospect.firstName} {prospect.lastName}
                  </td>
                  <td>{prospect.email}</td>
                  <td>{goalLabel(prospect)}</td>
                  <td>
                    <StatusBadge status={prospect.status} />
                  </td>
                  <td>{formatDate(prospect.followUpDate)}</td>
                  <td>
                    <Link href={`/admin/prospects/${prospect.id}`} className="table-action">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function AdminFollowUpsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const prospects = await prisma.prospect.findMany({
    where: { followUpDate: { not: null } },
    orderBy: { followUpDate: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      goalType: true,
      goalSummary: true,
      status: true,
      followUpDate: true,
    },
  });

  const scheduledProspects = prospects.filter(
    (prospect): prospect is FollowUpProspect => prospect.followUpDate !== null
  );
  const endOfToday = getEndOfToday();
  const upcomingLimit = getUpcomingLimit();
  const overdueAndToday = scheduledProspects.filter(
    (prospect) => prospect.followUpDate <= endOfToday
  );
  const upcoming = scheduledProspects.filter(
    (prospect) =>
      prospect.followUpDate > endOfToday && prospect.followUpDate <= upcomingLimit
  );

  return (
    <section className="page">
      <div className="container">
        <div className="page-header">
          <div className="page-kicker">Admin follow-ups</div>
          <h1>
            Follow-up <span className="accent">queue</span>
          </h1>
          <p>Track scheduled prospect outreach and keep the pipeline moving.</p>
        </div>

        {scheduledProspects.length === 0 ? (
          <div className="admin-panel">
            <div className="empty-state">No follow-ups scheduled.</div>
          </div>
        ) : (
          <>
            <FollowUpSection eyebrow="Overdue & Today" prospects={overdueAndToday} />
            <FollowUpSection eyebrow="Upcoming" prospects={upcoming} />
          </>
        )}

        <div className="inline-actions" style={{ marginTop: "1.5rem" }}>
          <Link href="/admin" className="button-secondary">
            Back to dashboard
          </Link>
          <Link href="/admin/prospects" className="button-secondary">
            Manage prospect pipeline
          </Link>
        </div>
      </div>
    </section>
  );
}
