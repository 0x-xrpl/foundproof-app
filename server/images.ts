import { writeFile } from "node:fs/promises";
import path from "node:path";

import { getUploadsDir } from "./storage";

function extensionFromMimeType(mimeType?: string) {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

function normalizeBase64(base64: string) {
  const parts = base64.split(",");
  return parts.length > 1 ? parts[parts.length - 1] : base64;
}

export async function persistBase64Image(recordId: string, imageBase64: string, imageMimeType?: string) {
  const uploadsDir = await getUploadsDir();
  const extension = extensionFromMimeType(imageMimeType);
  const filename = `${recordId}.${extension}`;
  const targetPath = path.join(uploadsDir, filename);

  await writeFile(targetPath, Buffer.from(normalizeBase64(imageBase64), "base64"));

  return {
    filename,
    imageUrl: `/uploads/${filename}`,
    thumbnailUrl: `/uploads/${filename}`
  };
}
