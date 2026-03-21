import { PROOF_CHAIN, PROOF_VERSION } from "@/constants/foundproof";
import {
  anchorMockRecord,
  createMockRecord,
  loadMockRecord,
  searchMockRecords
} from "@/services/mock-records";
import { setLastAnchorTxHash } from "@/storage/debug";
import { FoundRecord, FoundRecordDraftInput, SearchFilters } from "@/types/found-record";
import { describeAnchorError } from "@/utils/errors";
import { readImageAsBase64 } from "@/utils/hash";
import { captureCurrentLocation, deriveLocationHash } from "@/utils/location";

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8787").replace(/\/$/, "");
const DATA_MODE = process.env.EXPO_PUBLIC_DATA_MODE ?? "mock";

export type HealthStatus = {
  status: string;
  mode: "mock" | "api";
  detail?: string;
};

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API request failed: ${response.status} ${body}`);
  }

  return response.json();
}

function withAbsoluteAssetUrls(record: FoundRecord): FoundRecord {
  const normalize = (value?: string) => {
    if (!value) {
      return value;
    }

    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("file://")) {
      return value;
    }

    return `${API_BASE_URL}${value}`;
  };

  return {
    ...record,
    imageUrl: normalize(record.imageUrl) ?? record.imageUrl,
    thumbnailUrl: normalize(record.thumbnailUrl)
  };
}

export async function fetchCurrentLocation() {
  return captureCurrentLocation();
}

export function getCurrentMode() {
  return DATA_MODE === "api" ? "api" : "mock";
}

export function getCurrentApiEndpoint() {
  return API_BASE_URL;
}

export async function getHealthStatus(): Promise<HealthStatus> {
  if (DATA_MODE === "mock") {
    return {
      status: "ok",
      mode: "mock" as const
    };
  }

  try {
    return await apiRequest<{ status: string; mode: "mock" | "api" }>("/health");
  } catch (error) {
    return {
      status: "unreachable",
      mode: "api" as const,
      detail: error instanceof Error ? error.message : "Health request failed"
    };
  }
}

export async function createDraftRecord(input: FoundRecordDraftInput) {
  if (DATA_MODE === "mock") {
    return createMockRecord(input);
  }

  const locationHash =
    input.locationHash ??
    (input.latitude !== undefined && input.longitude !== undefined
      ? await deriveLocationHash(input.latitude, input.longitude)
      : undefined);
  const imageBase64 = await readImageAsBase64(input.imageUri);

  const record = await apiRequest<FoundRecord>("/records", {
    method: "POST",
    body: JSON.stringify({
      imageBase64,
      imageMimeType: "image/jpeg",
      capturedAt: input.capturedAt ?? new Date().toISOString(),
      latitude: input.latitude,
      longitude: input.longitude,
      locationLabel: input.locationLabel,
      locationHash,
      category: input.category,
      aiCategory: input.aiCategory,
      description: input.description,
      aiDescription: input.aiDescription,
      handoffType: input.handoffType,
      handoffNote: input.handoffNote,
      proofChain: PROOF_CHAIN,
      proofVersion: PROOF_VERSION
    })
  });

  return withAbsoluteAssetUrls(record);
}

export async function anchorRecord(id: string) {
  if (DATA_MODE === "mock") {
    return anchorMockRecord(id);
  }

  try {
    const anchored = await apiRequest<FoundRecord>(`/records/${id}/anchor`, {
      method: "POST"
    });
    await setLastAnchorTxHash(anchored.proofTxHash);
    return {
      record: withAbsoluteAssetUrls(anchored)
    };
  } catch (error) {
    throw new Error(describeAnchorError(error));
  }
}

export async function loadRecord(id: string) {
  if (DATA_MODE === "mock") {
    return loadMockRecord(id);
  }

  const record = await apiRequest<FoundRecord>(`/records/${id}`);
  return withAbsoluteAssetUrls(record);
}

export async function runRecordSearch(filters: SearchFilters) {
  if (DATA_MODE === "mock") {
    return searchMockRecords(filters);
  }

  const params = new URLSearchParams();

  if (filters.keyword) params.set("keyword", filters.keyword);
  if (filters.category) params.set("category", filters.category);
  if (filters.area) params.set("location", filters.area);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.handoffType) params.set("handoffType", filters.handoffType);

  const records = await apiRequest<FoundRecord[]>(`/records/search?${params.toString()}`);
  return records.map(withAbsoluteAssetUrls);
}
