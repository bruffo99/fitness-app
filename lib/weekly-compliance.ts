import type { Prisma, WeeklyComplianceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ComplianceDb = typeof prisma | Prisma.TransactionClient;

function getNextWeekStart(weekStart: Date) {
  const nextWeek = new Date(weekStart);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
  return nextWeek;
}

function getNextAction(input: {
  checkInId: string | null;
  coachReviewedAt: Date | null;
  gymPhotosUploaded: number;
  requiredSessions: number;
  adherence: number | null;
}) {
  if (!input.checkInId) {
    return "Client needs to submit this week's check-in.";
  }

  if (!input.coachReviewedAt) {
    return "Coach needs to review the submitted check-in.";
  }

  if (input.adherence != null && input.adherence <= 2) {
    return "Coach should address low plan adherence.";
  }

  if (input.gymPhotosUploaded < input.requiredSessions) {
    return "Client is behind on gym proof uploads.";
  }

  return null;
}

function getComplianceStatus(input: {
  checkInId: string | null;
  coachReviewedAt: Date | null;
  gymPhotosUploaded: number;
  requiredSessions: number;
  adherence: number | null;
}): WeeklyComplianceStatus {
  if (!input.checkInId) {
    return "MISSED";
  }

  if (!input.coachReviewedAt) {
    return "NEEDS_REVIEW";
  }

  if (
    (input.adherence != null && input.adherence <= 2) ||
    input.gymPhotosUploaded < input.requiredSessions
  ) {
    return "WATCH";
  }

  return "ON_TRACK";
}

export async function syncWeeklyCompliance(
  userId: string,
  weekStart: Date,
  db: ComplianceDb = prisma
) {
  const nextWeekStart = getNextWeekStart(weekStart);

  const [profile, checkIn, gymPhotosUploaded] = await Promise.all([
    db.clientProfile.findUnique({
      where: { userId },
      select: { requiredSessionsPerWeek: true },
    }),
    db.checkIn.findUnique({
      where: {
        userId_weekOf: {
          userId,
          weekOf: weekStart,
        },
      },
      select: {
        id: true,
        adherence: true,
        coachNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    db.gymPhoto.count({
      where: {
        userId,
        createdAt: {
          gte: weekStart,
          lt: nextWeekStart,
        },
      },
    }),
  ]);

  const requiredSessions = profile?.requiredSessionsPerWeek ?? 3;
  const coachReviewedAt = checkIn?.coachNotes?.trim() ? checkIn.updatedAt : null;
  const statusInput = {
    checkInId: checkIn?.id ?? null,
    coachReviewedAt,
    gymPhotosUploaded,
    requiredSessions,
    adherence: checkIn?.adherence ?? null,
  };

  return db.weeklyCompliance.upsert({
    where: {
      userId_weekStart: {
        userId,
        weekStart,
      },
    },
    update: {
      requiredSessions,
      gymPhotosUploaded,
      checkInSubmittedAt: checkIn?.createdAt ?? null,
      checkInId: checkIn?.id ?? null,
      adherence: checkIn?.adherence ?? null,
      coachReviewedAt,
      status: getComplianceStatus(statusInput),
      nextAction: getNextAction(statusInput),
    },
    create: {
      userId,
      weekStart,
      requiredSessions,
      gymPhotosUploaded,
      checkInSubmittedAt: checkIn?.createdAt ?? null,
      checkInId: checkIn?.id ?? null,
      adherence: checkIn?.adherence ?? null,
      coachReviewedAt,
      status: getComplianceStatus(statusInput),
      nextAction: getNextAction(statusInput),
    },
  });
}

export async function syncWeeklyComplianceForUsers(userIds: string[], weekStart: Date) {
  await Promise.all(userIds.map((userId) => syncWeeklyCompliance(userId, weekStart)));
}
