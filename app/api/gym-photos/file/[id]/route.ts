import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getClientSession } from "@/lib/client-auth";
import { resolveGymPhotoDiskPathCandidates } from "@/lib/gym-photos";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

async function readFirstAvailableFile(filePath: string) {
  for (const diskPath of resolveGymPhotoDiskPathCandidates(filePath)) {
    try {
      return await readFile(diskPath);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;

      if (code !== "ENOENT") {
        throw error;
      }
    }
  }

  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [clientUser, adminSession] = await Promise.all([
    getClientSession(),
    getAdminSession(),
  ]);

  if (!clientUser && !adminSession) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const gymPhoto = await prisma.gymPhoto.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      filePath: true,
    },
  });

  if (!gymPhoto) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (!adminSession && gymPhoto.userId !== clientUser?.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const buffer = await readFirstAvailableFile(gymPhoto.filePath);

  if (!buffer) {
    return NextResponse.json({ ok: false, error: "file_not_found" }, { status: 404 });
  }

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": getContentType(gymPhoto.filePath),
      "Cache-Control": "private, max-age=60",
    },
  });
}
