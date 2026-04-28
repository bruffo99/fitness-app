import crypto from "node:crypto";
import path from "node:path";

const LEGACY_PUBLIC_UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "gym-photos");

function getDefaultUploadRoot() {
  if (process.env.NODE_ENV === "production") {
    return "/data/gym-photos";
  }

  return path.join(process.cwd(), "storage", "gym-photos");
}

export const GYM_PHOTO_UPLOAD_ROOT = path.resolve(
  process.env.GYM_PHOTO_UPLOAD_ROOT ?? getDefaultUploadRoot()
);

const ALLOWED_IMAGE_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export const MAX_GYM_PHOTO_BYTES = 10 * 1024 * 1024;

const IMAGE_SIGNATURES: Record<string, readonly number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

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

function getRelativeGymPhotoPath(filePath: string) {
  const normalized = filePath.replace(/^\/+/, "");

  if (normalized.startsWith("uploads/gym-photos/")) {
    return normalized.replace(/^uploads\/gym-photos\//, "");
  }

  if (normalized.startsWith("gym-photos/")) {
    return normalized.replace(/^gym-photos\//, "");
  }

  return normalized;
}

export function resolveGymPhotoDiskPath(filePath: string) {
  return path.join(GYM_PHOTO_UPLOAD_ROOT, getRelativeGymPhotoPath(filePath));
}

export function resolveLegacyGymPhotoDiskPath(filePath: string) {
  return path.join(LEGACY_PUBLIC_UPLOAD_ROOT, getRelativeGymPhotoPath(filePath));
}

export function resolveGymPhotoDiskPathCandidates(filePath: string) {
  return [
    resolveGymPhotoDiskPath(filePath),
    resolveLegacyGymPhotoDiskPath(filePath),
  ];
}

export function isAllowedGymPhotoContent(file: File, buffer: Buffer) {
  const signature = IMAGE_SIGNATURES[file.type];

  if (!signature) {
    return false;
  }

  if (file.type === "image/webp") {
    return (
      buffer.length >= 12 &&
      signature.every((byte, index) => buffer[index] === byte) &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return signature.every((byte, index) => buffer[index] === byte);
}
