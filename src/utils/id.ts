import * as Crypto from "expo-crypto";

export function createRecordId() {
  return Crypto.randomUUID();
}
