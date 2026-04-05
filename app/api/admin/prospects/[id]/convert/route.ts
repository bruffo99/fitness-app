import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAbsoluteUrl } from "@/lib/urls";

function buildFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(await buildAbsoluteUrl("/admin/login"), 303);
  }

  const { id } = await params;

  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect) {
    return NextResponse.redirect(await buildAbsoluteUrl("/admin/prospects"), 303);
  }

  if (prospect.status === "CLIENT_ACTIVE") {
    return NextResponse.redirect(
      await buildAbsoluteUrl(`/admin/prospects/${id}?error=already_converted`),
      303
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
              where: {
                isActive: true,
                label: prospect.goalSummary
              },
              take: 1
            }
          }
        }
      }
    });

    const user = existingUser
      ? await tx.user.update({
          where: { id: existingUser.id },
          data: {
            firstName: existingUser.firstName ?? prospect.firstName,
            lastName: existingUser.lastName ?? prospect.lastName,
            phone: existingUser.phone ?? prospect.phone,
            isActive: true
          }
        })
      : await tx.user.create({
          data: {
            email: prospect.email,
            role: "CLIENT",
            firstName: prospect.firstName,
            lastName: prospect.lastName,
            phone: prospect.phone,
            isActive: true
          }
        });

    const clientProfile = existingUser?.clientProfile
      ? await tx.clientProfile.update({
          where: { id: existingUser.clientProfile.id },
          data: {
            fullName: existingUser.clientProfile.fullName ?? fullName
          }
        })
      : await tx.clientProfile.create({
          data: {
            userId: user.id,
            fullName,
            onboardingStatus: "intake_received"
          }
        });

    const hasMatchingTarget =
      existingUser?.clientProfile?.targets.some(
        (target: { label: string }) => target.label === prospect.goalSummary
      ) ??
      false;

    if (!hasMatchingTarget) {
      await tx.clientTarget.create({
        data: {
          clientProfileId: clientProfile.id,
          label: prospect.goalSummary,
          type: "OTHER"
        }
      });
    }

    await tx.prospect.update({
      where: { id },
      data: { status: "CLIENT_ACTIVE" }
    });
  });

  return NextResponse.redirect(
    await buildAbsoluteUrl(`/admin/prospects/${id}?converted=1`),
    303
  );
}
