import { Prisma, TargetType } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { onboardingStatusLabel } from "@/lib/onboarding";
import { prisma } from "@/lib/prisma";
import { createStatusChangeNote } from "@/lib/prospect-notes";

function buildFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (prospect.status === "CLIENT_ACTIVE") {
    return NextResponse.json(
      { ok: false, error: "already_converted" },
      { status: 409 }
    );
  }

  const fullName = buildFullName(prospect.firstName, prospect.lastName);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existingUser = await tx.user.findUnique({
      where: { email: prospect.email },
      include: {
        clientProfile: {
          include: {
            targets: {
              where: { isActive: true, label: prospect.goalSummary },
              take: 1,
            },
          },
        },
      },
    });

    const user = existingUser
      ? await tx.user.update({
          where: { id: existingUser.id },
          data: {
            firstName: existingUser.firstName ?? prospect.firstName,
            lastName: existingUser.lastName ?? prospect.lastName,
            phone: existingUser.phone ?? prospect.phone,
            isActive: true,
          },
        })
      : await tx.user.create({
          data: {
            email: prospect.email,
            role: "CLIENT",
            firstName: prospect.firstName,
            lastName: prospect.lastName,
            phone: prospect.phone,
            isActive: true,
          },
        });

    const clientProfile = existingUser?.clientProfile
      ? await tx.clientProfile.update({
          where: { id: existingUser.clientProfile.id },
          data: { fullName: existingUser.clientProfile.fullName ?? fullName },
        })
      : await tx.clientProfile.create({
          data: {
            userId: user.id,
            fullName,
            onboardingStatus: "draft",
          },
        });

    const hasMatchingTarget =
      existingUser?.clientProfile?.targets.some(
        (target: { label: string }) => target.label === prospect.goalSummary
      ) ?? false;

    if (!hasMatchingTarget) {
      const goalTypeMap: Record<string, TargetType> = {
        fat_loss: TargetType.BODY_FAT,
        muscle_gain: TargetType.WEIGHT,
        body_recomp: TargetType.BODY_FAT,
        performance: TargetType.PERFORMANCE,
        general_health: TargetType.HABIT,
      };
      const targetType = prospect.goalType ? (goalTypeMap[prospect.goalType] ?? TargetType.OTHER) : TargetType.OTHER;
      await tx.clientTarget.create({
        data: {
          clientProfileId: clientProfile.id,
          label: prospect.goalSummary,
          type: targetType,
        },
      });
    }

    await tx.prospect.update({
      where: { id },
      data: { status: "CLIENT_ACTIVE" },
    });

    await createStatusChangeNote(tx, id, "CLIENT_ACTIVE");
  });

  const updated = await prisma.prospect.findUnique({
    where: { id },
    include: { notes: { orderBy: { createdAt: "desc" } } },
  });

  const clientUser = updated
    ? await prisma.user.findUnique({
        where: { email: updated.email },
        include: { clientProfile: true },
      })
    : null;

  const onboardingStatus =
    clientUser?.role === "CLIENT" ? clientUser.clientProfile?.onboardingStatus ?? "draft" : null;

  return NextResponse.json({
    ok: true,
    prospect: updated
      ? {
          ...updated,
          clientUserId: clientUser?.role === "CLIENT" ? clientUser.id : null,
          onboardingStatus,
          onboardingStatusLabel: onboardingStatusLabel(onboardingStatus),
        }
      : null,
  });
}
