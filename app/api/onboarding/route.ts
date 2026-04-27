import { redirect } from "next/navigation";
import { getClientSession } from "@/lib/client-auth";
import { canAccessOnboardingForm } from "@/lib/onboarding";
import { prisma } from "@/lib/prisma";

function parseRequiredText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseOptionalText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request) {
  const user = await getClientSession();

  if (!user) {
    redirect("/portal/login");
  }

  const profile = await prisma.clientProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile || !canAccessOnboardingForm(profile.onboardingStatus)) {
    redirect("/portal/onboarding");
  }

  const formData = await request.formData();
  const fullName = parseRequiredText(formData.get("fullName"));

  if (!fullName) {
    redirect("/portal/onboarding");
  }

  await prisma.clientProfile.update({
    where: { userId: user.id },
    data: {
      fullName,
      trainingHistory: parseOptionalText(formData.get("trainingHistory")),
      nutritionNotes: parseOptionalText(formData.get("nutritionNotes")),
      injuryNotes: parseOptionalText(formData.get("injuryNotes")),
      primaryGoal: parseOptionalText(formData.get("primaryGoal")),
      motivation: parseOptionalText(formData.get("motivation")),
      onboardingStatus: "intake_complete",
    },
  });

  redirect("/portal/onboarding?complete=1");
}
