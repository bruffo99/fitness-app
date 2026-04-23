import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseCoachNotes(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const formData = await request.formData();

  await prisma.checkIn.update({
    where: { id },
    data: {
      coachNotes: parseCoachNotes(formData.get("coachNotes"))
    }
  });

  redirect(`/admin/checkins/${id}`);
}
