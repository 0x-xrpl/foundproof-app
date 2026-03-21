import * as FileSystem from "expo-file-system/legacy";

const documentDirectory = FileSystem.documentDirectory;

function getRecordsDir() {
  if (!documentDirectory) {
    throw new Error("FileSystem.documentDirectory is not available in this environment.");
  }

  return `${documentDirectory}foundproof/records`;
}

async function ensureRecordsDir() {
  const recordsDir = getRecordsDir();
  const info = await FileSystem.getInfoAsync(recordsDir);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(recordsDir, { intermediates: true });
  }

  return recordsDir;
}

function getExtension(uri: string) {
  const parts = uri.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "jpg";
}

export async function persistRecordImage(recordId: string, sourceUri: string) {
  const recordsDir = await ensureRecordsDir();
  const extension = getExtension(sourceUri);
  const targetUri = `${recordsDir}/${recordId}.${extension}`;

  if (sourceUri !== targetUri) {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: targetUri
    });
  }

  return {
    imageUrl: targetUri,
    thumbnailUrl: targetUri
  };
}
