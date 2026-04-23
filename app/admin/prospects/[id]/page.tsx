import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { normalizeEmail } from "@/lib/email";
import { onboardingStatusLabel } from "@/lib/onboarding";
import { prisma } from "@/lib/prisma";
import {
  ProspectDetailClient,
  type ProspectDetailDTO,
} from "@/app/components/ProspectDetailClient";
import type { ProspectStatusValue } from "@/lib/utils";

export default async function ProspectDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await props.params;

  const prospect = await prisma.prospect.findUnique({
    where: { id },
    include: { notes: { orderBy: { createdAt: "desc" } } },
  });
  if (!prospect) redirect("/admin/prospects");

  const normalizedProspectEmail = normalizeEmail(prospect.email);

  const clientUser = await prisma.user.findFirst({
    where: {
      email: normalizedProspectEmail,
    },
    include: { clientProfile: true },
  });

  const onboardingStatus =
    clientUser?.role === "CLIENT" ? clientUser.clientProfile?.onboardingStatus ?? "draft" : null;

  const dto: ProspectDetailDTO = {
    id: prospect.id,
    firstName: prospect.firstName,
    lastName: prospect.lastName,
    email: prospect.email,
    phone: prospect.phone,
    goalSummary: prospect.goalSummary,
    goalType: prospect.goalType,
    fitnessLevel: prospect.fitnessLevel,
    timeline: prospect.timeline,
    injuries: prospect.injuries,
    preferredContact: prospect.preferredContact,
    referralSource: prospect.referralSource,
    message: prospect.message,
    followUpDate: prospect.followUpDate?.toISOString() ?? null,
    status: prospect.status as ProspectStatusValue,
    createdAt: prospect.createdAt.toISOString(),
    clientUserId: clientUser?.role === "CLIENT" ? clientUser.id : null,
    onboardingStatus,
    onboardingStatusLabel: onboardingStatusLabel(onboardingStatus),
    documentsHref:
      prospect.status === "CLIENT_ACTIVE" && clientUser?.role === "CLIENT"
        ? `/admin/clients/${clientUser.id}/documents`
        : null,
    photosHref:
      prospect.status === "CLIENT_ACTIVE" && clientUser?.role === "CLIENT"
        ? `/admin/clients/${clientUser.id}/photos`
        : null,
    notes: prospect.notes.map((n) => ({
      id: n.id,
      body: n.body,
      createdAt: n.createdAt.toISOString(),
    })),
  };

  return <ProspectDetailClient initial={dto} />;
}
