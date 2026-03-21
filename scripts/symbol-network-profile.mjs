#!/usr/bin/env node

const rawNodeUrl = process.argv[2] ?? process.env.SYMBOL_NODE_URL ?? "http://127.0.0.1:3000";
const nodeUrl = rawNodeUrl.replace(/\/$/, "");

function parseEpochAdjustmentSeconds(value) {
  if (!value) {
    return "";
  }

  return String(value).replace(/s$/, "");
}

function getNetworkType(identifier) {
  return identifier === "mainnet" ? "MAIN_NET" : "TEST_NET";
}

function getSuggestedExplorerBaseUrl(url, identifier) {
  if (process.env.SYMBOL_EXPLORER_BASE_URL) {
    return process.env.SYMBOL_EXPLORER_BASE_URL;
  }

  if (
    url === "http://127.0.0.1:3000" ||
    url === "http://localhost:3000" ||
    url === "http://127.0.0.1:3001" ||
    url === "http://localhost:3001"
  ) {
    return "http://127.0.0.1:90";
  }

  if (identifier === "testnet") {
    return "https://testnet.symbol.fyi";
  }

  return "";
}

const response = await fetch(`${nodeUrl}/network/properties`);

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Unable to read network properties from ${nodeUrl}: ${response.status} ${body}`);
}

const payload = await response.json();
const identifier = payload.network?.identifier ?? "testnet";
const generationHash = payload.network?.generationHashSeed ?? "";
const epochAdjustmentSeconds = parseEpochAdjustmentSeconds(payload.network?.epochAdjustment);
const explorerBaseUrl = getSuggestedExplorerBaseUrl(nodeUrl, identifier);

console.log("# FoundProof Symbol network profile");
console.log(`SYMBOL_NODE_URL=${nodeUrl}`);
console.log(`SYMBOL_NETWORK_TYPE=${getNetworkType(identifier)}`);
console.log(`SYMBOL_GENERATION_HASH=${generationHash}`);
console.log(`SYMBOL_EPOCH_ADJUSTMENT_SECONDS=${epochAdjustmentSeconds}`);
if (explorerBaseUrl) {
  console.log(`SYMBOL_EXPLORER_BASE_URL=${explorerBaseUrl}`);
  console.log(`EXPO_PUBLIC_SYMBOL_EXPLORER_BASE_URL=${explorerBaseUrl}`);
}
