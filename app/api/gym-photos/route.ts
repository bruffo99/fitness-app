import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/client-auth";
import {
  buildGymPhotoFileName,
  buildGymPhotoPublicPath,
  getGymPhotoStorageDir,
  isAllowedGymPhotoContent,
  MAX_GYM_PHOTO_BYTES,
  resolveGymPhotoDiskPath,
} from "@/lib/gym-photos";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekStartUtc } from "@/lib/utils";
import { syncWeeklyCompliance } from "@/lib/weekly-compliance";

export const runtime = "nodejs";

function getTrimmedNote(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: Request) {
  const user = await getClientSession();

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const photo = formData.get("photo");

  if (!(photo instanceof File)) {
    return NextResponse.json({ ok: false, error: "photo_required" }, { status: 400 });
  }

  if (photo.size === 0 || photo.size > MAX_GYM_PHOTO_BYTES) {
    return NextResponse.json({ ok: false, error: "invalid_file_size" }, { status: 400 });
  }

  const fileName = buildGymPhotoFileName(photo);

  if (!fileName) {
    return NextResponse.json({ ok: false, error: "invalid_file_type" }, { status: 400 });
  }

  const storageDir = getGymPhotoStorageDir(user.id);
  const publicPath = buildGymPhotoPublicPath(user.id, fileName);
  const diskPath = path.join(storageDir, fileName);
  const buffer = Buffer.from(await photo.arrayBuffer());

  if (!isAllowedGymPhotoContent(photo, buffer)) {
    return NextResponse.json({ ok: false, error: "invalid_file_type" }, { status: 400 });
  }

  await mkdir(storageDir, { recursive: true });
  await writeFile(diskPath, buffer);

  try {
    const createdPhoto = await prisma.gymPhoto.create({
      data: {
        userId: user.id,
        filePath: publicPath,
        note: getTrimmedNote(formData.get("note")),
      },
      select: {
        id: true,
      },
    });
    await syncWeeklyCompliance(user.id, getCurrentWeekStartUtc());

    return NextResponse.json({ ok: true, id: createdPhoto.id });
  } catch (error) {
    await unlink(resolveGymPhotoDiskPath(publicPath)).catch(() => {});
    throw error;
  }
}
