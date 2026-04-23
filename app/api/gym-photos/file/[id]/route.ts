import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/client-auth";
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

export async function GET(
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
    },
  });

  if (!gymPhoto) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (gymPhoto.userId !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const normalized = gymPhoto.filePath.replace(/^\/+/, "");
  const diskPath = path.join(process.cwd(), "public", normalized);
  const buffer = await readFile(diskPath);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": getContentType(gymPhoto.filePath),
      "Cache-Control": "private, max-age=60",
    },
  });
}
