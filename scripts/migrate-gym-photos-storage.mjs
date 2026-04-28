import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const legacyRoot = path.resolve(
  process.env.LEGACY_GYM_PHOTO_UPLOAD_ROOT ??
    path.join(process.cwd(), "public", "uploads", "gym-photos")
);

function getDefaultUploadRoot() {
  if (process.env.NODE_ENV === "production") {
    return "/data/gym-photos";
  }

  return path.join(process.cwd(), "storage", "gym-photos");
}

const secureRoot = path.resolve(process.env.GYM_PHOTO_UPLOAD_ROOT ?? getDefaultUploadRoot());

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

if (legacyRoot === secureRoot) {
  throw new Error("Legacy and secure gym photo roots resolve to the same directory.");
}

if (!(await exists(legacyRoot))) {
  console.log(`No legacy gym photo directory found at ${legacyRoot}`);
  process.exit(0);
}

await mkdir(secureRoot, { recursive: true });
await cp(legacyRoot, secureRoot, {
  recursive: true,
  force: false,
  errorOnExist: false,
});
await rm(legacyRoot, {
  recursive: true,
  force: true,
});

console.log(`Moved gym photos from ${legacyRoot} to ${secureRoot}`);
