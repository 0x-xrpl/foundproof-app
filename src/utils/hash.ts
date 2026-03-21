import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";

import { RecordHashPayload } from "@/types/found-record";
import { normalizeRecordPayload } from "@/utils/hash-core";

export async function createSha256(text: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);
}

export async function createImageHash(uri: string) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64
  });

  return createSha256(base64);
}

export async function readImageAsBase64(uri: string) {
  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64
  });
}

export async function createRecordHash(payload: RecordHashPayload) {
  return createSha256(normalizeRecordPayload(payload));
}
