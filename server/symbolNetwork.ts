import { Hash256 } from "symbol-sdk";
import { Network } from "symbol-sdk/symbol";

import {
  SYMBOL_LOCAL_BOOTSTRAP_EXPLORER,
  SYMBOL_LOCAL_BOOTSTRAP_NODE,
  SYMBOL_TESTNET_EXPLORER,
  SYMBOL_TESTNET_NODE
} from "../src/constants/foundproof";

export type SymbolNetworkType = "TEST_NET" | "MAIN_NET";

type NetworkPropertiesResponse = {
  network?: {
    identifier?: string;
    generationHashSeed?: string;
    epochAdjustment?: string;
  };
};

export type ResolvedSymbolNetwork = {
  network: Network;
  networkType: SymbolNetworkType;
  networkName: string;
  generationHash: string;
  epochAdjustmentSeconds: number;
  nodeUrl: string;
  explorerBaseUrl?: string;
};

type ResolveSymbolNetworkInput = {
  nodeUrl: string;
  networkType: SymbolNetworkType;
  generationHash?: string;
  epochAdjustmentSeconds?: number;
  explorerBaseUrl?: string;
};

const networkCache = new Map<string, Promise<ResolvedSymbolNetwork>>();

function sanitizeBaseUrl(value?: string) {
  return value?.trim() ? value.replace(/\/$/, "") : undefined;
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Network request failed.";
}

function parseEpochAdjustmentSeconds(value?: number | string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (!value.trim()) {
    return undefined;
  }

  const normalized = value.replace(/s$/, "").trim();
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid epoch adjustment value: ${value}`);
  }

  return parsed;
}

function getDefaultExplorerBaseUrl(nodeUrl: string, networkType: SymbolNetworkType) {
  const sanitizedNodeUrl = sanitizeBaseUrl(nodeUrl);

  if (sanitizedNodeUrl === sanitizeBaseUrl(SYMBOL_LOCAL_BOOTSTRAP_NODE)) {
    return SYMBOL_LOCAL_BOOTSTRAP_EXPLORER;
  }

  if (networkType === "TEST_NET") {
    return SYMBOL_TESTNET_EXPLORER;
  }

  return undefined;
}

function getNetworkIdentifier(networkType: SymbolNetworkType) {
  return networkType === "MAIN_NET" ? 0x68 : 0x98;
}

function getNetworkName(identifier: string | undefined, networkType: SymbolNetworkType) {
  if (identifier === "mainnet") {
    return "mainnet";
  }

  if (identifier === "testnet") {
    return "testnet";
  }

  return networkType === "MAIN_NET" ? "mainnet" : "testnet";
}

export function parseSymbolNetworkType(value?: string) {
  if (!value || value === "TEST_NET") {
    return "TEST_NET" as const;
  }

  if (value === "MAIN_NET") {
    return "MAIN_NET" as const;
  }

  throw new Error(`Unsupported SYMBOL_NETWORK_TYPE value: ${value}`);
}

async function fetchNetworkProperties(nodeUrl: string): Promise<NetworkPropertiesResponse> {
  let response: Response;

  try {
    response = await fetch(`${sanitizeBaseUrl(nodeUrl)}/network/properties`);
  } catch (error) {
    throw new Error(`Symbol node unreachable: ${toErrorMessage(error)}`);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Symbol network properties failed: ${response.status} ${body}`);
  }

  return (await response.json()) as NetworkPropertiesResponse;
}

export async function resolveSymbolNetwork(input: ResolveSymbolNetworkInput): Promise<ResolvedSymbolNetwork> {
  const nodeUrl = sanitizeBaseUrl(input.nodeUrl) ?? SYMBOL_TESTNET_NODE;
  const cacheKey = JSON.stringify({
    nodeUrl,
    networkType: input.networkType,
    generationHash: input.generationHash ?? "",
    epochAdjustmentSeconds: input.epochAdjustmentSeconds ?? "",
    explorerBaseUrl: input.explorerBaseUrl ?? ""
  });

  const cached = networkCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const configuredGenerationHash = input.generationHash?.trim();
    const configuredEpochAdjustment = parseEpochAdjustmentSeconds(input.epochAdjustmentSeconds);
    const explorerBaseUrl = sanitizeBaseUrl(input.explorerBaseUrl) ?? getDefaultExplorerBaseUrl(nodeUrl, input.networkType);

    let identifier: string | undefined;
    let generationHash = configuredGenerationHash;
    let epochAdjustmentSeconds = configuredEpochAdjustment;

    if (!generationHash || epochAdjustmentSeconds === undefined) {
      const properties = await fetchNetworkProperties(nodeUrl);
      identifier = properties.network?.identifier;
      generationHash = generationHash ?? properties.network?.generationHashSeed?.trim();
      epochAdjustmentSeconds =
        epochAdjustmentSeconds ?? parseEpochAdjustmentSeconds(properties.network?.epochAdjustment);
    }

    if (!generationHash) {
      throw new Error("Missing Symbol generation hash. Set SYMBOL_GENERATION_HASH or use a reachable node.");
    }

    if (epochAdjustmentSeconds === undefined) {
      throw new Error(
        "Missing Symbol epoch adjustment. Set SYMBOL_EPOCH_ADJUSTMENT_SECONDS or use a reachable node."
      );
    }

    return {
      nodeUrl,
      networkType: input.networkType,
      networkName: getNetworkName(identifier, input.networkType),
      generationHash,
      epochAdjustmentSeconds,
      explorerBaseUrl,
      network: new Network(
        getNetworkName(identifier, input.networkType),
        getNetworkIdentifier(input.networkType),
        new Date(epochAdjustmentSeconds * 1000),
        new Hash256(generationHash)
      )
    };
  })();

  networkCache.set(cacheKey, promise);

  try {
    return await promise;
  } catch (error) {
    networkCache.delete(cacheKey);
    throw error;
  }
}
