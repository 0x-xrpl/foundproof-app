import AsyncStorage from "@react-native-async-storage/async-storage";

import { FoundRecord, SearchFilters } from "@/types/found-record";

const RECORDS_STORAGE_KEY = "foundproof:records";

function parseDateFilter(value?: string, mode: "start" | "end" = "start") {
  if (!value) {
    return undefined;
  }

  const normalized = value.length === 10 && mode === "end" ? `${value}T23:59:59.999` : value;
  const timestamp = new Date(normalized).getTime();
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

export async function listRecords() {
  const raw = await AsyncStorage.getItem(RECORDS_STORAGE_KEY);
  if (!raw) {
    return [] as FoundRecord[];
  }

  const parsed = JSON.parse(raw) as FoundRecord[];
  return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function writeRecords(records: FoundRecord[]) {
  await AsyncStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
}

export async function saveRecord(record: FoundRecord) {
  const records = await listRecords();
  const nextRecords = [record, ...records.filter((entry) => entry.id !== record.id)];
  await writeRecords(nextRecords);
  return record;
}

export async function getRecordById(id: string) {
  const records = await listRecords();
  return records.find((record) => record.id === id);
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
