import { FoundRecord, FoundRecordDraftInput, HandoffType, SearchFilters } from "../src/types/found-record";
import { buildExplorerUrl } from "../src/utils/proof";
import { PROOF_CHAIN, PROOF_VERSION } from "../src/constants/foundproof";
import { createImageHashFromBase64, createRecordHash, createServerRecordId } from "./hash";
import { persistBase64Image } from "./images";
import { logEvent } from "./logger";
import { anchorFromEnv } from "./symbolAnchor";
import { getRecordById, saveRecord, searchRecords } from "./storage";

type CreateRecordRequest = Omit<FoundRecordDraftInput, "imageUri"> & {
  imageBase64: string;
  imageMimeType?: string;
  proofVersion?: string;
  proofChain?: "symbol";
};

function isHandoffType(value: string): value is HandoffType {
  return [
    "police_box",
    "station_counter",
    "airport_counter",
    "hotel_front",
    "facility_desk",
    "event_staff",
    "school_office",
    "office_reception",
    "other_authorized_desk"
  ].includes(value);
}

function validateCreateRequest(input: CreateRecordRequest) {
  if (!input.imageBase64) throw new Error("imageBase64 is required.");
  if (!input.category?.trim()) throw new Error("category is required.");
  if (!input.description?.trim()) throw new Error("description is required.");
  if (!input.handoffType || !isHandoffType(input.handoffType)) {
    throw new Error("handoffType is invalid.");
  }
}

export async function createRecord(input: CreateRecordRequest): Promise<FoundRecord> {
  validateCreateRequest(input);

  logEvent({
    event: "record.create.started",
    category: input.category,
    handoffType: input.handoffType
  });

  const id = createServerRecordId();
  const createdAt = new Date().toISOString();
  const capturedAt = input.capturedAt ?? createdAt;
  const imageAsset = await persistBase64Image(id, input.imageBase64, input.imageMimeType);
  const imageHash = createImageHashFromBase64(input.imageBase64);
  const proofVersion = input.proofVersion ?? PROOF_VERSION;
  const proofRecordHash = createRecordHash({
    id,
    imageHash,
    capturedAt,
    category: input.category,
    description: input.description,
    handoffType: input.handoffType,
    locationHash: input.locationHash,
    proofVersion
  });

  logEvent({
    event: "record.hash.generated",
    recordId: id,
    imageHash,
    proofRecordHash
  });

  const saved = await saveRecord({
    id,
    imageUrl: imageAsset.imageUrl,
    thumbnailUrl: imageAsset.thumbnailUrl,
    imageHash,
    capturedAt,
    createdAt,
    latitude: input.latitude,
    longitude: input.longitude,
    locationLabel: input.locationLabel,
    locationHash: input.locationHash,
    category: input.category,
    aiCategory: input.aiCategory,
    description: input.description,
    aiDescription: input.aiDescription,
    handoffType: input.handoffType,
    handoffNote: input.handoffNote,
    status: "recorded",
    proofChain: input.proofChain ?? PROOF_CHAIN,
    proofRecordHash,
    proofVersion,
    proofExplorerUrl: undefined
  });

  logEvent({
    event: "record.create.succeeded",
    recordId: saved.id,
    status: saved.status
  });

  return saved;
}

export async function anchorRecord(id: string) {
  const record = await getRecordById(id);

  if (!record) {
    throw new Error("Record not found.");
  }

  if (record.proofTxHash) {
    return record;
  }

  logEvent({
    event: "anchor.attempt.started",
    recordId: record.id,
    proofRecordHash: record.proofRecordHash
  });

  try {
    const anchor = await anchorFromEnv(record.proofRecordHash);
    const saved = await saveRecord({
      ...record,
      status: "anchored",
      proofTxHash: anchor.txHash,
      proofExplorerUrl: anchor.explorerUrl ?? buildExplorerUrl(anchor.txHash)
    });

    logEvent({
      event: "anchor.attempt.succeeded",
      recordId: saved.id,
      txHash: saved.proofTxHash
    });

    return saved;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Anchor attempt failed.";
    logEvent({
      event: "anchor.attempt.failed",
      level: "error",
      recordId: record.id,
      message
    });
    throw error;
  }
}

export async function getRecordDetail(id: string) {
  const record = await getRecordById(id);

  if (!record) {
    throw new Error("Record not found.");
  }

  return record;
}

export async function searchRecordIndex(filters: SearchFilters) {
  return searchRecords(filters);
}
