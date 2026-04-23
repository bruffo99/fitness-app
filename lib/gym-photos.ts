import crypto from "node:crypto";
import path from "node:path";

export const GYM_PHOTO_UPLOAD_ROOT = path.join(
  process.cwd(),
  "public",
  "uploads",
  "gym-photos"
);

const ALLOWED_IMAGE_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export const MAX_GYM_PHOTO_BYTES = 10 * 1024 * 1024;

export function getGymPhotoWeekLabel(weekStart: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(weekStart);
}

export function getGymPhotoStorageDir(userId: string) {
  return path.join(GYM_PHOTO_UPLOAD_ROOT, userId);
}

export function getGymPhotoFileExtension(file: File) {
  const extension = ALLOWED_IMAGE_TYPES.get(file.type);
  return extension ?? null;
}

export function buildGymPhotoFileName(file: File) {
  const extension = getGymPhotoFileExtension(file);

  if (!extension) {
    return null;
  }

  return `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;
}

export function buildGymPhotoPublicPath(userId: string, fileName: string) {
  return `/uploads/gym-photos/${userId}/${fileName}`;
}

export function resolveGymPhotoDiskPath(filePath: string) {
  const normalized = filePath.replace(/^\/+/, "");
  return path.join(process.cwd(), "public", normalized);
}
