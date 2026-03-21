import { RecordHashPayload } from "../types/found-record";

function sortObject<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => sortObject(entry)) as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    return Object.fromEntries(entries.map(([key, nested]) => [key, sortObject(nested)])) as T;
  }

  return value;
}

export function normalizeRecordPayload(payload: RecordHashPayload) {
  return JSON.stringify(sortObject(payload));
}
