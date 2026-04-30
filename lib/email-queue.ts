import type { EmailQueueKind, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getMailConfig, sendBridgeMessages } from "@/lib/mail";
import { buildAbsoluteUrl } from "@/lib/urls";
import { syncWeeklyComplianceForUsers } from "@/lib/weekly-compliance";

type QueueDb = typeof prisma | Prisma.TransactionClient;

type EmailDraftInput = {
  kind: EmailQueueKind;
  toEmail: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  dedupeKey: string;
  userId?: string;
  checkInId?: string;
  weeklyComplianceId?: string;
  weekStart?: Date;
};

function clientName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email;
}

async function createOrRefreshDraft(input: EmailDraftInput, db: QueueDb = prisma) {
  const existing = await db.emailQueue.findUnique({
    where: { dedupeKey: input.dedupeKey },
    select: { id: true, status: true },
  });

  if (existing?.status === "SENT" || existing?.status === "SKIPPED") {
    return existing;
  }

  const data = {
    kind: input.kind,
    toEmail: input.toEmail,
    subject: input.subject,
    body: input.body,
    bodyHtml: input.bodyHtml,
    userId: input.userId,
    checkInId: input.checkInId,
    weeklyComplianceId: input.weeklyComplianceId,
    weekStart: input.weekStart,
    status: "DRAFT" as const,
    lastError: null,
  };

  if (existing) {
    return db.emailQueue.update({
      where: { id: existing.id },
      data,
      select: { id: true, status: true },
    });
  }

  return db.emailQueue.create({
    data: {
      ...data,
      dedupeKey: input.dedupeKey,
      isEnabled: false,
    },
    select: { id: true, status: true },
  });
}

export async function queueCoachFeedbackEmail(checkInId: string, db: QueueDb = prisma) {
  const checkIn = await db.checkIn.findUnique({
    where: { id: checkInId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!checkIn?.coachNotes?.trim()) {
    return null;
  }

  const portalUrl = String(await buildAbsoluteUrl("/portal/checkin"));
  const name = clientName(checkIn.user);

  return createOrRefreshDraft(
    {
      kind: "CLIENT_COACH_FEEDBACK",
      toEmail: checkIn.user.email,
      subject: "Your coach reviewed your weekly check-in",
      body:
        `${name},\n\n` +
        "Your coach has reviewed your weekly check-in and added feedback in your portal.\n\n" +
        `View it here:\n${portalUrl}\n\n` +
        "Keep the week moving.",
      dedupeKey: `coach-feedback:${checkIn.id}`,
      userId: checkIn.user.id,
      checkInId: checkIn.id,
      weekStart: checkIn.weekOf,
    },
    db
  );
}

export async function generateWeeklyEmailDrafts(weekStart: Date) {
  const mailConfig = getMailConfig();
  const activeClients = await prisma.user.findMany({
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
      email: true,
      firstName: true,
      lastName: true,
    },
  });

  await syncWeeklyComplianceForUsers(
    activeClients.map((client) => client.id),
    weekStart
  );

  const compliance = await prisma.weeklyCompliance.findMany({
    where: {
      weekStart,
      userId: {
        in: activeClients.map((client) => client.id),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const portalUrl = String(await buildAbsoluteUrl("/portal"));
  const checkInUrl = String(await buildAbsoluteUrl("/portal/checkin"));
  const gymUrl = String(await buildAbsoluteUrl("/portal/gym"));
  const checkInsUrl = String(await buildAbsoluteUrl("/admin/checkins"));
  let generated = 0;

  for (const week of compliance) {
    const name = clientName(week.user);

    if (!week.checkInSubmittedAt) {
      await createOrRefreshDraft({
        kind: "CLIENT_CHECKIN_REMINDER",
        toEmail: week.user.email,
        subject: "Weekly check-in reminder",
        body:
          `${name},\n\n` +
          "Your weekly check-in is still open. Please submit it so your coach can review your progress and adjust anything that needs attention.\n\n" +
          `Submit your check-in here:\n${checkInUrl}\n\n` +
          "Thanks.",
        dedupeKey: `checkin-reminder:${week.userId}:${weekStart.toISOString()}`,
        userId: week.userId,
        weeklyComplianceId: week.id,
        weekStart,
      });
      generated += 1;
    }

    if (week.gymPhotosUploaded < week.requiredSessions) {
      const remaining = week.requiredSessions - week.gymPhotosUploaded;
      await createOrRefreshDraft({
        kind: "CLIENT_GYM_PHOTO_REMINDER",
        toEmail: week.user.email,
        subject: "Gym proof reminder",
        body:
          `${name},\n\n` +
          `You have ${week.gymPhotosUploaded} of ${week.requiredSessions} required gym proof uploads for this week. Please upload ${remaining} more ${remaining === 1 ? "photo" : "photos"} when you can.\n\n` +
          `Upload gym proof here:\n${gymUrl}\n\n` +
          "Thanks.",
        dedupeKey: `gym-photo-reminder:${week.userId}:${weekStart.toISOString()}`,
        userId: week.userId,
        weeklyComplianceId: week.id,
        weekStart,
      });
      generated += 1;
    }

    if (week.checkInId && !week.coachReviewedAt && mailConfig?.notificationEmail) {
      await createOrRefreshDraft({
        kind: "ADMIN_CHECKIN_REVIEW_NOTICE",
        toEmail: mailConfig.notificationEmail,
        subject: `Check-in ready for review: ${name}`,
        body:
          `A client check-in is ready for review.\n\n` +
          `Client: ${name}\n` +
          `Email: ${week.user.email}\n` +
          `Week: ${weekStart.toDateString()}\n\n` +
          `Open check-ins:\n${checkInsUrl}`,
        dedupeKey: `admin-review:${week.checkInId}`,
        userId: week.userId,
        checkInId: week.checkInId,
        weeklyComplianceId: week.id,
        weekStart,
      });
      generated += 1;
    }

    if (week.checkInId && week.adherence != null && week.adherence <= 2) {
      await createOrRefreshDraft({
        kind: "CLIENT_LOW_ADHERENCE_FOLLOWUP",
        toEmail: week.user.email,
        subject: "Quick follow-up on this week's adherence",
        body:
          `${name},\n\n` +
          `I saw your ${week.adherence}/5 adherence rating this week. If something is blocking the plan, reply with what got in the way so we can adjust instead of guessing.\n\n` +
          `Your portal is here:\n${portalUrl}`,
        dedupeKey: `low-adherence:${week.checkInId}`,
        userId: week.userId,
        checkInId: week.checkInId,
        weeklyComplianceId: week.id,
        weekStart,
      });
      generated += 1;
    }
  }

  return { generated };
}

export async function sendEnabledEmailQueue() {
  const drafts = await prisma.emailQueue.findMany({
    where: {
      status: { in: ["DRAFT", "FAILED"] },
      isEnabled: true,
    },
    orderBy: { createdAt: "asc" },
  });

  let sent = 0;
  let failed = 0;

  for (const draft of drafts) {
    try {
      await sendBridgeMessages([
        {
          to: draft.toEmail,
          subject: draft.subject,
          body: draft.body,
          bodyHtml: draft.bodyHtml ?? undefined,
        },
      ]);

      await prisma.emailQueue.update({
        where: { id: draft.id },
        data: {
          status: "SENT",
          isEnabled: false,
          sentAt: new Date(),
          lastError: null,
        },
      });
      sent += 1;
    } catch (error) {
      await prisma.emailQueue.update({
        where: { id: draft.id },
        data: {
          status: "FAILED",
          lastError: error instanceof Error ? error.message : "Unknown email send failure",
        },
      });
      failed += 1;
    }
  }

  return { sent, failed };
}
