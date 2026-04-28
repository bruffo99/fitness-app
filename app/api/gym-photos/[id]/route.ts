import { unlink } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/client-auth";
import { resolveGymPhotoDiskPathCandidates } from "@/lib/gym-photos";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekStartUtc } from "@/lib/utils";
import { syncWeeklyCompliance } from "@/lib/weekly-compliance";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getClientSession();

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const gymPhoto = await prisma.gymPhoto.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      filePath: true,
      createdAt: true,
    },
  });

  if (!gymPhoto) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (gymPhoto.userId !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  await Promise.all(
    resolveGymPhotoDiskPathCandidates(gymPhoto.filePath).map((diskPath) =>
      unlink(diskPath).catch(() => {})
    )
  );
  await prisma.gymPhoto.delete({
    where: { id: gymPhoto.id },
  });
  await syncWeeklyCompliance(gymPhoto.userId, getCurrentWeekStartUtc(gymPhoto.createdAt));

  return NextResponse.json({ ok: true });
}
