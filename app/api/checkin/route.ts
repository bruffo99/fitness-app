import { redirect } from "next/navigation";
import { getClientSession } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekStartUtc } from "@/lib/utils";

function parseOptionalFloat(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalInt(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function parseOptionalText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: Request) {
  const user = await getClientSession();

  if (!user) {
    redirect("/portal/login");
  }

  const formData = await request.formData();
  const weekOf = getCurrentWeekStartUtc();

  await prisma.checkIn.upsert({
    where: {
      userId_weekOf: {
        userId: user.id,
        weekOf
      }
    },
    update: {
      bodyWeight: parseOptionalFloat(formData.get("bodyWeight")),
      bodyFat: parseOptionalFloat(formData.get("bodyFat")),
      energyLevel: parseOptionalInt(formData.get("energyLevel")),
      sleepQuality: parseOptionalInt(formData.get("sleepQuality")),
      adherence: parseOptionalInt(formData.get("adherence")),
      trainingNotes: parseOptionalText(formData.get("trainingNotes")),
      nutritionNotes: parseOptionalText(formData.get("nutritionNotes")),
      wins: parseOptionalText(formData.get("wins")),
      struggles: parseOptionalText(formData.get("struggles"))
    },
    create: {
      userId: user.id,
      weekOf,
      bodyWeight: parseOptionalFloat(formData.get("bodyWeight")),
      bodyFat: parseOptionalFloat(formData.get("bodyFat")),
      energyLevel: parseOptionalInt(formData.get("energyLevel")),
      sleepQuality: parseOptionalInt(formData.get("sleepQuality")),
      adherence: parseOptionalInt(formData.get("adherence")),
      trainingNotes: parseOptionalText(formData.get("trainingNotes")),
      nutritionNotes: parseOptionalText(formData.get("nutritionNotes")),
      wins: parseOptionalText(formData.get("wins")),
      struggles: parseOptionalText(formData.get("struggles"))
    }
  });

  redirect("/portal/checkin?success=1");
}
