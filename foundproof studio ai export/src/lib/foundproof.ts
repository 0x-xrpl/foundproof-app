export type FoundRecord = {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  imageHash: string;
  capturedAt: string;
  createdAt: string;
  latitude?: number;
  longitude?: number;
  locationLabel?: string;
  locationHash?: string;
  category: string;
  aiCategory?: string;
  description: string;
  aiDescription?: string;
  handoffType: string;
  handoffNote?: string;
  status: "draft" | "recorded" | "anchored" | "handed_over";
  proofChain: "symbol";
  proofTxHash?: string;
  proofRecordHash: string;
  proofVersion: string;
  proofExplorerUrl?: string;
};

export type HistoryItem = {
  id: string;
  category: string;
  time: string;
  location: string;
  handoff: string;
  memo: string;
  recordHash: string;
  txHash?: string;
  explorerUrl?: string;
  imageHash: string;
  status: FoundRecord["status"];
  lat: number;
  lng: number;
};

export type CreateRecordPayload = {
  imageBase64: string;
  imageMimeType: string;
  capturedAt: string;
  locationLabel?: string;
  locationHash?: string;
  category: string;
  description: string;
  handoffType: string;
  handoffNote?: string;
  proofVersion: string;
  proofChain: "symbol";
  latitude?: number;
  longitude?: number;
};

type HealthStatus = {
  status: string;
  mode: "mock" | "api";
};

const API_BASE_URL = (import.meta.env.VITE_FOUNDPROOF_API_BASE_URL ?? "http://127.0.0.1:8787").replace(/\/$/, "");

const DEMO_LATITUDE = 35.6595;
const DEMO_LONGITUDE = 139.7005;

const HANDOFF_LABELS: Record<string, string> = {
  police_box: "交番・警察署",
  station_counter: "駅の窓口",
  airport_counter: "空港窓口",
  hotel_front: "ホテル受付",
  facility_desk: "商業施設の受付",
  event_staff: "イベント運営",
  school_office: "学校・オフィスの窓口",
  office_reception: "学校・オフィスの窓口",
  other_authorized_desk: "その他"
};

export function getApiBaseUrl() {
  return API_BASE_URL;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
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

  return response.json() as Promise<T>;
}

export async function getHealthStatus() {
  return requestJson<HealthStatus>("/health");
}

export async function createRecord(payload: CreateRecordPayload) {
  return requestJson<FoundRecord>("/records", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function anchorRecord(recordId: string) {
  return requestJson<FoundRecord>(`/records/${recordId}/anchor`, {
    method: "POST"
  });
}

export async function loadRecord(recordId: string) {
  return requestJson<FoundRecord>(`/records/${recordId}`);
}

export async function searchRecords() {
  return requestJson<FoundRecord[]>("/records/search");
}

function formatCapturedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function toHistoryItem(record: FoundRecord): HistoryItem {
  const handoffLabel = HANDOFF_LABELS[record.handoffType] ?? record.handoffType;
  const handoff =
    record.handoffNote && record.handoffNote.trim()
      ? `${handoffLabel}（${record.handoffNote.trim()}）`
      : handoffLabel;

  return {
    id: record.id,
    category: record.category,
    time: formatCapturedAt(record.capturedAt),
    location: record.locationLabel ?? "安全な範囲で非表示",
    handoff,
    memo: record.description,
    recordHash: record.proofRecordHash,
    txHash: record.proofTxHash,
    explorerUrl: record.proofExplorerUrl,
    imageHash: record.imageHash,
    status: record.status,
    lat: record.latitude ?? DEMO_LATITUDE,
    lng: record.longitude ?? DEMO_LONGITUDE
  };
}
