import { PROOF_CHAIN, PROOF_VERSION } from "@/constants/foundproof";
import { persistRecordImage } from "@/storage/files";
import { getRecordById, saveRecord, searchRecords } from "@/storage/records";
import { FoundRecord, FoundRecordDraftInput, SearchFilters } from "@/types/found-record";
import { createRecordHash, createImageHash, createSha256 } from "@/utils/hash";
import { createRecordId } from "@/utils/id";
import { deriveLocationHash } from "@/utils/location";
import { buildExplorerUrl } from "@/utils/proof";
import { setLastAnchorTxHash } from "@/storage/debug";

function buildSearchKeywords(record: Pick<FoundRecord, "category" | "description" | "locationLabel" | "handoffType">) {
  return Array.from(
    new Set(
      [record.category, record.handoffType, record.locationLabel, ...record.description.toLowerCase().split(/\s+/)]
        .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
        .map((entry) => entry.trim().toLowerCase())
    )
  );
}

export async function createMockRecord(input: FoundRecordDraftInput) {
  console.log(
    JSON.stringify({
      event: "mock.record.create.started",
      level: "info",
      category: input.category,
      handoffType: input.handoffType
    })
  );

  const id = createRecordId();
  const createdAt = new Date().toISOString();
  const capturedAt = input.capturedAt ?? createdAt;
  const imageAsset = await persistRecordImage(id, input.imageUri);
  const imageHash = await createImageHash(imageAsset.imageUrl);
  const locationHash =
    input.locationHash ??
    (input.latitude !== undefined && input.longitude !== undefined
      ? await deriveLocationHash(input.latitude, input.longitude)
      : undefined);

  const proofRecordHash = await createRecordHash({
    id,
    imageHash,
    capturedAt,
    category: input.category,
    description: input.description,
    handoffType: input.handoffType,
    locationHash,
    proofVersion: PROOF_VERSION
  });

  console.log(
    JSON.stringify({
      event: "mock.record.hash.generated",
      level: "info",
      recordId: id,
      imageHash,
      proofRecordHash
    })
  );

  const record: FoundRecord = {
    id,
    imageUrl: imageAsset.imageUrl,
    thumbnailUrl: imageAsset.thumbnailUrl,
    imageHash,
    capturedAt,
    createdAt,
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
    status: "recorded",
    proofChain: PROOF_CHAIN,
    proofRecordHash,
    proofVersion: PROOF_VERSION,
    proofExplorerUrl: undefined,
    searchKeywords: buildSearchKeywords({
      category: input.category,
      description: input.description,
      locationLabel: input.locationLabel,
      handoffType: input.handoffType
    })
  };

  await saveRecord(record);

  console.log(
    JSON.stringify({
      event: "mock.record.create.succeeded",
      level: "info",
      recordId: record.id,
      status: record.status
    })
  );

  return record;
}

export async function anchorMockRecord(id: string) {
  const record = await getRecordById(id);
  if (!record) {
    throw new Error("Record not found.");
  }

  console.log(
    JSON.stringify({
      event: "mock.anchor.attempt.started",
      level: "info",
      recordId: id
    })
  );

  const proofTxHash = await createSha256(`mock-symbol:${record.proofRecordHash}`);
  const anchored: FoundRecord = {
    ...record,
    status: "anchored",
    proofTxHash,
    proofExplorerUrl: buildExplorerUrl(proofTxHash)
  };

  await saveRecord(anchored);
  await setLastAnchorTxHash(proofTxHash);

  console.log(
    JSON.stringify({
      event: "mock.anchor.attempt.succeeded",
      level: "info",
      recordId: id,
      txHash: proofTxHash
    })
  );

  return {
    record: anchored
  };
}

export async function loadMockRecord(id: string) {
  return getRecordById(id);
}

export async function searchMockRecords(filters: SearchFilters) {
  return searchRecords(filters);
}
