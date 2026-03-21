export type HandoffType =
  | "police_box"
  | "station_counter"
  | "airport_counter"
  | "hotel_front"
  | "facility_desk"
  | "event_staff"
  | "school_office"
  | "office_reception"
  | "other_authorized_desk";

export type RecordStatus = "draft" | "recorded" | "anchored";

export type FoundRecord = {
  id: string;
  imageUrl: string;
  imageHash: string;
  thumbnailUrl?: string;
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
  handoffType: HandoffType;
  handoffNote?: string;
  status: RecordStatus;
  proofChain: "symbol";
  proofTxHash?: string;
  proofRecordHash: string;
  proofVersion: string;
  proofExplorerUrl?: string;
  searchKeywords?: string[];
};

export type FoundRecordDraftInput = {
  imageUri: string;
  capturedAt?: string;
  latitude?: number;
  longitude?: number;
  locationLabel?: string;
  locationHash?: string;
  category: string;
  aiCategory?: string;
  description: string;
  aiDescription?: string;
  handoffType: HandoffType;
  handoffNote?: string;
};

export type SearchFilters = {
  keyword?: string;
  category?: string;
  area?: string;
  dateFrom?: string;
  dateTo?: string;
  handoffType?: HandoffType;
};

export type RecordHashPayload = Pick<
  FoundRecord,
  | "id"
  | "imageHash"
  | "capturedAt"
  | "category"
  | "description"
  | "handoffType"
  | "locationHash"
  | "proofVersion"
>;
