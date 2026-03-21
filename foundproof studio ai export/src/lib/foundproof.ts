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

const API_BASE_URL = (import.meta.env.VITE_FOUNDPROOF_API_BASE_URL ?? "").replace(/\/$/, "");
const USE_EMBEDDED_DEMO = !API_BASE_URL;

const DEMO_LATITUDE = 35.6595;
const DEMO_LONGITUDE = 139.7005;

const DEMO_RECORDS: FoundRecord[] = [
  {
    id: "FP-DEMO-001",
    imageUrl: "/uploads/49e03609-1b41-4e4e-b9ec-40fa962c46c2.png",
    thumbnailUrl: "/uploads/49e03609-1b41-4e4e-b9ec-40fa962c46c2.png",
    imageHash: "6d155599f77405e39e310a1871a26a61aea35184be502de6f2308e7609d2c4ce",
    capturedAt: "2026-03-15T13:42:00.000Z",
    createdAt: "2026-03-15T13:42:41.398Z",
    latitude: 35.6595,
    longitude: 139.7005,
    locationLabel: "東京都渋谷区道玄坂2丁目",
    category: "ワイヤレスイヤホン",
    description: "黒色のケースに入っていました。",
    handoffType: "station_counter",
    handoffNote: "渋谷駅窓口",
    status: "anchored",
    proofChain: "symbol",
    proofTxHash: "A5C03240F52B0D425BD982012A17B18F103B7A913BB35C0582CF604BF548DF4F",
    proofRecordHash: "83e7dab754d5820ea9f437f55dcc2412c8e2dc3529a14d53f40d408fd0984e95",
    proofVersion: "1",
    proofExplorerUrl: "http://127.0.0.1:90/transactions/A5C03240F52B0D425BD982012A17B18F103B7A913BB35C0582CF604BF548DF4F"
  },
  {
    id: "FP-DEMO-002",
    imageUrl: "/uploads/d22677f8-7556-4865-a877-534593de11ff.png",
    thumbnailUrl: "/uploads/d22677f8-7556-4865-a877-534593de11ff.png",
    imageHash: "6d155599f77405e39e310a1871a26a61aea35184be502de6f2308e7609d2c4ce",
    capturedAt: "2026-03-15T13:21:00.000Z",
    createdAt: "2026-03-15T13:21:04.981Z",
    latitude: 35.6909,
    longitude: 139.7003,
    locationLabel: "東京都新宿区新宿3丁目",
    category: "折りたたみ傘",
    description: "紺色の折りたたみ傘でした。",
    handoffType: "station_counter",
    handoffNote: "新宿駅窓口",
    status: "anchored",
    proofChain: "symbol",
    proofTxHash: "432D3FABAD95D4C74A11953F2DD6AE82085E5EC5E666123F9BA03296C68DB6A8",
    proofRecordHash: "5a7a876a85abc1c00835efc7f7ee0f5dcecb4dce681f2af97c870656b2d16b4f",
    proofVersion: "1",
    proofExplorerUrl: "http://127.0.0.1:90/transactions/432D3FABAD95D4C74A11953F2DD6AE82085E5EC5E666123F9BA03296C68DB6A8"
  },
  {
    id: "FP-DEMO-003",
    imageUrl: "/uploads/74b24858-d563-4ee4-8f05-85018eb6b396.png",
    thumbnailUrl: "/uploads/74b24858-d563-4ee4-8f05-85018eb6b396.png",
    imageHash: "6d155599f77405e39e310a1871a26a61aea35184be502de6f2308e7609d2c4ce",
    capturedAt: "2026-03-15T13:07:00.000Z",
    createdAt: "2026-03-15T13:07:28.177Z",
    latitude: 35.6812,
    longitude: 139.7671,
    locationLabel: "東京都千代田区丸の内1丁目",
    category: "定期入れ",
    description: "黒いパスケースが改札付近にありました。",
    handoffType: "police_box",
    handoffNote: "東京駅八重洲口交番",
    status: "anchored",
    proofChain: "symbol",
    proofTxHash: "AB6CC40C77FCD406AB5EDBEDEAA409F189A45AE2EF4C0CAF122F54C73C50B751",
    proofRecordHash: "85a85c60699a086ca776a1cd7260bbf465af028e6f4192d6bcd575f0000f1b7e",
    proofVersion: "1",
    proofExplorerUrl: "http://127.0.0.1:90/transactions/AB6CC40C77FCD406AB5EDBEDEAA409F189A45AE2EF4C0CAF122F54C73C50B751"
  },
  {
    id: "FP-DEMO-004",
    imageUrl: "/uploads/8f75be98-7508-435a-9ee0-0cdc78e97416.png",
    thumbnailUrl: "/uploads/8f75be98-7508-435a-9ee0-0cdc78e97416.png",
    imageHash: "6d155599f77405e39e310a1871a26a61aea35184be502de6f2308e7609d2c4ce",
    capturedAt: "2026-03-15T13:05:00.000Z",
    createdAt: "2026-03-15T13:05:18.874Z",
    latitude: 35.7138,
    longitude: 139.7773,
    locationLabel: "東京都台東区上野7丁目",
    category: "キーホルダー",
    description: "銀色のキーリングが落ちていました。",
    handoffType: "facility_desk",
    handoffNote: "上野駅案内所",
    status: "anchored",
    proofChain: "symbol",
    proofTxHash: "058FE977ADDD9EEE9F2880F3973FA814ED6CED4139E82C2CB9047C62DB0EB610",
    proofRecordHash: "ae76b3f33cd0d86c7dabc45f6fbe24d3ae62d624e46586a610c8a94d5912c285",
    proofVersion: "1",
    proofExplorerUrl: "http://127.0.0.1:90/transactions/058FE977ADDD9EEE9F2880F3973FA814ED6CED4139E82C2CB9047C62DB0EB610"
  }
];

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
  if (!API_BASE_URL) {
    throw new Error("API base URL is not configured.");
  }

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
  if (USE_EMBEDDED_DEMO) {
    return {
      status: "ok",
      mode: "mock"
    } satisfies HealthStatus;
  }

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
  if (USE_EMBEDDED_DEMO) {
    const record = DEMO_RECORDS.find((item) => item.id === recordId);
    if (!record) {
      throw new Error(`Record not found: ${recordId}`);
    }
    return record;
  }

  return requestJson<FoundRecord>(`/records/${recordId}`);
}

export async function searchRecords() {
  if (USE_EMBEDDED_DEMO) {
    return DEMO_RECORDS;
  }

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
