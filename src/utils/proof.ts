import {
  SYMBOL_PROOF_MESSAGE_PREFIX,
  SYMBOL_TESTNET_EXPLORER
} from "../constants/foundproof";

export function buildProofMessage(recordHash: string) {
  return `${SYMBOL_PROOF_MESSAGE_PREFIX}:${recordHash}`;
}

function sanitizeBaseUrl(value?: string) {
  return value?.trim() ? value.replace(/\/$/, "") : undefined;
}

function getConfiguredExplorerBaseUrl() {
  return sanitizeBaseUrl(
    process.env.EXPO_PUBLIC_SYMBOL_EXPLORER_BASE_URL ??
      process.env.SYMBOL_EXPLORER_BASE_URL ??
      SYMBOL_TESTNET_EXPLORER
  );
}

export function buildExplorerUrl(txHash?: string, explorerBaseUrl?: string) {
  const baseUrl = sanitizeBaseUrl(explorerBaseUrl) ?? getConfiguredExplorerBaseUrl();
  return txHash && baseUrl ? `${baseUrl}/transactions/${txHash}` : undefined;
}
