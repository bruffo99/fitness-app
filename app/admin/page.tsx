import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, getCurrentWeekStartUtc } from "@/lib/utils";
import { syncWeeklyComplianceForUsers } from "@/lib/weekly-compliance";
import { StatusBadge } from "@/app/components/StatusBadge";

export const metadata: Metadata = {
  title: "Coach Command Center",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, nocache: true },
  },
};

const QUEUE_LIMIT = 8;

type QueuePriority = "critical" | "warning" | "normal";

type ClientQueueItem = {
  id: string;
  name: string;
  email: string;
  href: Route;
  detail: string;
  meta: string;
  priority: QueuePriority;
};

type ProspectQueueItem = {
  id: string;
  name: string;
  email: string;
  href: Route;
  detail: string;
  meta: string;
  status: "NEW_LEAD" | "CONTACTED" | "QUALIFIED" | "CLIENT_ACTIVE" | "INACTIVE" | "ARCHIVED";
};

function clientName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email;
}

function queueBadgeClass(priority: QueuePriority) {
  switch (priority) {
    case "critical":
      return "badge--archived";
    case "warning":
      return "badge--qualified";
    case "normal":
      return "badge--new";
  }
}

function QueueTable({
  title,
  description,
  count,
  empty,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  description: string;
  count: number;
  empty: string;
  actionHref: Route;
  actionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-panel command-panel">
      <div className="command-panel__header">
        <div>
          <div className="section__eyebrow">{title}</div>
          <p className="muted">{description}</p>
        </div>
        <span className={`badge ${count > 0 ? "badge--qualified" : "badge--active"}`}>
          {count}
        </span>
      </div>

      {count === 0 ? (
        <p className="empty-state">{empty}</p>
      ) : (
        <div className="table-wrap command-table">
          <table>
            {children}
          </table>
        </div>
      )}

      <div className="inline-actions" style={{ marginTop: "1rem" }}>
        <Link href={actionHref} className="button-secondary">
          {actionLabel}
        </Link>
      </div>
    </section>
  );
}

function ClientRows({ items }: { items: ClientQueueItem[] }) {
  return (
    <>
      <thead>
        <tr>
          <th>Client</th>
          <th>Issue</th>
          <th>Detail</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>
              <strong>{item.name}</strong>
              <p className="muted">{item.email}</p>
            </td>
            <td>
              <span className={`badge ${queueBadgeClass(item.priority)}`}>
                {item.meta}
              </span>
            </td>
            <td>{item.detail}</td>
            <td>
              <Link href={item.href} className="table-action">
                Open
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );
}

function ProspectRows({ items }: { items: ProspectQueueItem[] }) {
  return (
    <>
      <thead>
        <tr>
          <th>Prospect</th>
          <th>Need</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>
              <strong>{item.name}</strong>
              <p className="muted">{item.email}</p>
            </td>
            <td>
              <strong>{item.detail}</strong>
              <p className="muted">{item.meta}</p>
            </td>
            <td>
              <StatusBadge status={item.status} />
            </td>
            <td>
              <Link href={item.href} className="table-action">
                Manage
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );
}

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const now = new Date();
  const weekStart = getCurrentWeekStartUtc(now);
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );
  const activeClientIds = await prisma.user.findMany({
    where: {
      role: "CLIENT",
      isActive: true,
      clientProfile: {
        is: {
          onboardingStatus: "active",
        },
      },
    },
    select: {
      id: true,
    },
  });

  await syncWeeklyComplianceForUsers(
    activeClientIds.map((client) => client.id),
    weekStart
  );

  const [
    prospects,
    weeklyCompliance,
    totalProspects,
    totalCheckInsThisWeek,
  ] = await Promise.all([
    prisma.prospect.findMany({
      where: {
        OR: [
          { status: "NEW_LEAD" },
          { followUpDate: { not: null, lte: endOfToday } },
        ],
      },
      orderBy: [
        { followUpDate: "asc" },
        { createdAt: "desc" },
      ],
      take: 50,
    }),
    prisma.weeklyCompliance.findMany({
      where: {
        weekStart,
        userId: {
          in: activeClientIds.map((client) => client.id),
        },
      },
      select: {
        id: true,
        userId: true,
        requiredSessions: true,
        gymPhotosUploaded: true,
        checkInSubmittedAt: true,
        checkInId: true,
        adherence: true,
        coachReviewedAt: true,
        status: true,
        nextAction: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { updatedAt: "desc" },
      ],
    }),
    prisma.prospect.count(),
    prisma.checkIn.count({
      where: {
        weekOf: weekStart,
      },
    }),
  ]);

  const newLeadItems: ProspectQueueItem[] = prospects
    .filter((prospect) => prospect.status === "NEW_LEAD")
    .map((prospect) => ({
      id: prospect.id,
      name: `${prospect.firstName} ${prospect.lastName}`,
      email: prospect.email,
      href: `/admin/prospects/${prospect.id}` as Route,
      detail: "Needs first contact",
      meta: `Added ${formatDate(prospect.createdAt)}`,
      status: prospect.status,
    }));

  const followUpItems: ProspectQueueItem[] = prospects
    .filter((prospect) => prospect.followUpDate && prospect.followUpDate <= endOfToday)
    .map((prospect) => ({
      id: prospect.id,
      name: `${prospect.firstName} ${prospect.lastName}`,
      email: prospect.email,
      href: `/admin/prospects/${prospect.id}` as Route,
      detail: "Follow-up due",
      meta: prospect.followUpDate ? formatDate(prospect.followUpDate) : "No date",
      status: prospect.status,
    }));

  const missedCheckIns: ClientQueueItem[] = weeklyCompliance
    .filter((week) => !week.checkInSubmittedAt || week.status === "MISSED")
    .map((week) => ({
      id: week.id,
      name: clientName(week.user),
      email: week.user.email,
      href: `/admin/clients/${week.userId}/photos` as Route,
      detail: `No check-in submitted for week of ${formatDate(weekStart)}.`,
      meta: "Missed",
      priority: "critical",
    }));

  const checkInsNeedingReview: ClientQueueItem[] = weeklyCompliance
    .flatMap((week) => {
      if (!week.checkInId || week.coachReviewedAt) {
        return [];
      }

      return [{
        id: week.id,
        name: clientName(week.user),
        email: week.user.email,
        href: `/admin/checkins/${week.checkInId}` as Route,
        detail: week.checkInSubmittedAt
          ? `Submitted ${formatDate(week.checkInSubmittedAt)}.`
          : "Submitted this week.",
        meta: "Review",
        priority: "warning" as const,
      }];
    });

  const lowAdherence: ClientQueueItem[] = weeklyCompliance
    .flatMap((week) => {
      if (!week.checkInId || week.adherence == null || week.adherence > 2) {
        return [];
      }

      return [{
        id: `${week.id}-adherence`,
        name: clientName(week.user),
        email: week.user.email,
        href: `/admin/checkins/${week.checkInId}` as Route,
        detail: `Reported ${week.adherence}/5 plan adherence this week.`,
        meta: "Low",
        priority: "critical" as const,
      }];
    });

  const photoDeficits: ClientQueueItem[] = weeklyCompliance
    .filter((week) => week.gymPhotosUploaded < week.requiredSessions)
    .map((week) => ({
      id: `${week.id}-photos`,
      name: clientName(week.user),
      email: week.user.email,
      href: `/admin/clients/${week.userId}/photos` as Route,
      detail: `${week.gymPhotosUploaded} of ${week.requiredSessions} required gym photos uploaded this week.`,
      meta: week.gymPhotosUploaded === 0 ? "None" : "Behind",
      priority: week.gymPhotosUploaded === 0 ? "critical" : "warning",
    }));

  const attentionCount =
    newLeadItems.length +
    followUpItems.length +
    missedCheckIns.length +
    checkInsNeedingReview.length +
    lowAdherence.length +
    photoDeficits.length;

  return (
    <section className="page">
      <div className="container">
        <div className="page-header">
          <div className="page-kicker">Coach command center</div>
          <h1>
            Today&apos;s <span className="accent">attention list</span>
          </h1>
          <p>
            Signed in as {session.email}. Week of {formatDate(weekStart)}.
          </p>
        </div>

        <div className="admin-summary command-summary">
          <div className="metric-card">
            <strong>{attentionCount}</strong>
            <span>Open attention items</span>
          </div>
          <div className="metric-card">
            <strong>{activeClientIds.length}</strong>
            <span>Active clients</span>
          </div>
          <div className="metric-card">
            <strong>{totalCheckInsThisWeek}</strong>
            <span>Check-ins this week</span>
          </div>
          <div className="metric-card">
            <strong>{totalProspects}</strong>
            <span>Total prospects</span>
          </div>
        </div>

        <div className="inline-actions" style={{ marginTop: "1.5rem" }}>
          <Link href="/admin/prospects" className="button">
            Manage pipeline
          </Link>
          <Link href="/admin/checkins" className="button-secondary">
            Review all check-ins
          </Link>
          <Link href="/admin/followups" className="button-secondary">
            Follow-up calendar
          </Link>
        </div>

        <div className="command-grid">
          <QueueTable
            title="Check-ins needing review"
            description="Submitted this week and waiting for coach feedback."
            count={checkInsNeedingReview.length}
            empty="No submitted check-ins need review."
            actionHref="/admin/checkins"
            actionLabel="Open check-ins"
          >
            <ClientRows items={checkInsNeedingReview.slice(0, QUEUE_LIMIT)} />
          </QueueTable>

          <QueueTable
            title="Missed check-ins"
            description="Active clients without a check-in for the current week."
            count={missedCheckIns.length}
            empty="Every active client has submitted this week."
            actionHref="/admin/checkins"
            actionLabel="Open check-ins"
          >
            <ClientRows items={missedCheckIns.slice(0, QUEUE_LIMIT)} />
          </QueueTable>

          <QueueTable
            title="Gym photo deficits"
            description="Clients under their required weekly proof target."
            count={photoDeficits.length}
            empty="All active clients are at or above their photo target."
            actionHref="/admin/prospects?status=CLIENT_ACTIVE"
            actionLabel="Open active clients"
          >
            <ClientRows items={photoDeficits.slice(0, QUEUE_LIMIT)} />
          </QueueTable>

          <QueueTable
            title="Low adherence"
            description="Current-week check-ins reporting 1 or 2 out of 5 adherence."
            count={lowAdherence.length}
            empty="No low-adherence check-ins this week."
            actionHref="/admin/checkins"
            actionLabel="Open check-ins"
          >
            <ClientRows items={lowAdherence.slice(0, QUEUE_LIMIT)} />
          </QueueTable>

          <QueueTable
            title="Lead first contact"
            description="New prospects who have not been moved forward yet."
            count={newLeadItems.length}
            empty="No new leads are waiting for first contact."
            actionHref="/admin/prospects?status=NEW_LEAD"
            actionLabel="Open new leads"
          >
            <ProspectRows items={newLeadItems.slice(0, QUEUE_LIMIT)} />
          </QueueTable>

          <QueueTable
            title="Prospect follow-ups"
            description="Follow-up dates due today or overdue."
            count={followUpItems.length}
            empty="No follow-ups are due today."
            actionHref="/admin/followups"
            actionLabel="Open follow-ups"
          >
            <ProspectRows items={followUpItems.slice(0, QUEUE_LIMIT)} />
          </QueueTable>
        </div>
      </div>
    </section>
  );
}
