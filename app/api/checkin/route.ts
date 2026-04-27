import { redirect } from "next/navigation";
import { z } from "zod";
import { getClientSession } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekStartUtc } from "@/lib/utils";

const optionalNumber = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.coerce.number().finite().optional()
);

const optionalScore = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.coerce.number().int().min(1).max(5).optional()
);

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(2000).optional()
);

const checkInSchema = z.object({
  bodyWeight: optionalNumber.pipe(z.number().min(50).max(700).optional()),
  bodyFat: optionalNumber.pipe(z.number().min(1).max(75).optional()),
  energyLevel: optionalScore,
  sleepQuality: optionalScore,
  adherence: optionalScore,
  trainingNotes: optionalText,
  nutritionNotes: optionalText,
  wins: optionalText,
  struggles: optionalText
});

export async function POST(request: Request) {
  const user = await getClientSession();

  if (!user) {
    redirect("/portal/login");
  }

  const formData = await request.formData();
  const parsed = checkInSchema.safeParse({
    bodyWeight: formData.get("bodyWeight"),
    bodyFat: formData.get("bodyFat"),
    energyLevel: formData.get("energyLevel"),
    sleepQuality: formData.get("sleepQuality"),
    adherence: formData.get("adherence"),
    trainingNotes: formData.get("trainingNotes"),
    nutritionNotes: formData.get("nutritionNotes"),
    wins: formData.get("wins"),
    struggles: formData.get("struggles")
  });

  if (!parsed.success) {
    redirect("/portal/checkin?error=1");
  }

  const checkInData = {
    bodyWeight: parsed.data.bodyWeight ?? null,
    bodyFat: parsed.data.bodyFat ?? null,
    energyLevel: parsed.data.energyLevel ?? null,
    sleepQuality: parsed.data.sleepQuality ?? null,
    adherence: parsed.data.adherence ?? null,
    trainingNotes: parsed.data.trainingNotes ?? null,
    nutritionNotes: parsed.data.nutritionNotes ?? null,
    wins: parsed.data.wins ?? null,
    struggles: parsed.data.struggles ?? null
  };
  const weekOf = getCurrentWeekStartUtc();

  await prisma.checkIn.upsert({
    where: {
      userId_weekOf: {
        userId: user.id,
        weekOf
      }
    },
    update: checkInData,
    create: {
      userId: user.id,
      weekOf,
      ...checkInData
    }
  });

  redirect("/portal/checkin?success=1");
}
