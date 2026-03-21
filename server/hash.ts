import { createHash, randomUUID } from "node:crypto";

import { RecordHashPayload } from "../src/types/found-record";
import { normalizeRecordPayload } from "../src/utils/hash-core";

export function createServerRecordId() {
  return randomUUID();
}

function normalizeBase64(base64: string) {
  const parts = base64.split(",");
  return parts.length > 1 ? parts[parts.length - 1] : base64;
}

export function createSha256(text: string) {
  return createHash("sha256").update(text).digest("hex");
}

export function createSha256Buffer(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export function createImageHashFromBase64(base64: string) {
  return createSha256Buffer(Buffer.from(normalizeBase64(base64), "base64"));
}

export function createRecordHash(payload: RecordHashPayload) {
  return createSha256(normalizeRecordPayload(payload));
}
