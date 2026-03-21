import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { FoundRecord, SearchFilters } from "../src/types/found-record";

const RUNTIME_DIR = path.join(process.cwd(), "server", "runtime");
const UPLOADS_DIR = path.join(RUNTIME_DIR, "uploads");
const RECORDS_FILE = path.join(RUNTIME_DIR, "records.json");

function parseDateFilter(value?: string, mode: "start" | "end" = "start") {
  if (!value) {
    return undefined;
  }

  const normalized = value.length === 10 && mode === "end" ? `${value}T23:59:59.999` : value;
  const timestamp = new Date(normalized).getTime();
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

function buildSearchKeywords(record: Pick<FoundRecord, "category" | "description" | "locationLabel" | "handoffType">) {
  const entries = [
    record.category,
    record.handoffType,
    record.locationLabel,
    ...record.description.toLowerCase().split(/\s+/)
  ].filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);

  return Array.from(
    new Set(entries.map((entry) => entry.trim().toLowerCase()))
  );
}

export async function ensureRuntimeStorage() {
  await mkdir(UPLOADS_DIR, { recursive: true });

  try {
    await stat(RECORDS_FILE);
  } catch {
    await writeFile(RECORDS_FILE, "[]", "utf8");
  }
}

export async function getUploadsDir() {
  await ensureRuntimeStorage();
  return UPLOADS_DIR;
}

async function readRecords() {
  await ensureRuntimeStorage();
  const raw = await readFile(RECORDS_FILE, "utf8");
  return JSON.parse(raw) as FoundRecord[];
}

async function writeRecords(records: FoundRecord[]) {
  await ensureRuntimeStorage();
  await writeFile(RECORDS_FILE, JSON.stringify(records, null, 2), "utf8");
}

export async function listRecords() {
  const records = await readRecords();
  return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getRecordById(id: string) {
  const records = await readRecords();
  return records.find((record) => record.id === id);
}

export async function saveRecord(record: FoundRecord) {
  const records = await readRecords();
  const enriched: FoundRecord = {
    ...record,
    searchKeywords:
      record.searchKeywords ??
      buildSearchKeywords({
        category: record.category,
        description: record.description,
        locationLabel: record.locationLabel,
        handoffType: record.handoffType
      })
  };
  const next = [enriched, ...records.filter((entry) => entry.id !== record.id)];
  await writeRecords(next);
  return enriched;
}

export async function searchRecords(filters: SearchFilters) {
  const records = await listRecords();
  const keyword = filters.keyword?.trim().toLowerCase();
  const area = filters.area?.trim().toLowerCase();
  const from = parseDateFilter(filters.dateFrom, "start");
  const to = parseDateFilter(filters.dateTo, "end");

  return records.filter((record) => {
    const haystack = [
      record.category,
      record.description,
      record.aiCategory,
      record.aiDescription,
      record.locationLabel,
      ...(record.searchKeywords ?? [])
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const capturedAt = new Date(record.capturedAt).getTime();

    if (keyword && !haystack.includes(keyword)) {
      return false;
    }

    if (filters.category && filters.category !== "all" && record.category !== filters.category) {
      return false;
    }

    if (filters.handoffType && record.handoffType !== filters.handoffType) {
      return false;
    }

    if (area && !(record.locationLabel ?? "").toLowerCase().includes(area)) {
      return false;
    }

    if (from && capturedAt < from) {
      return false;
    }

    if (to && capturedAt > to) {
      return false;
    }

    return true;
  });
}
