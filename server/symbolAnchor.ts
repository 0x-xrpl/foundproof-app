import { PrivateKey } from "symbol-sdk";
import { Address, descriptors, SymbolFacade } from "symbol-sdk/symbol";

import { SYMBOL_PROOF_MESSAGE_PREFIX, SYMBOL_TESTNET_NODE } from "../src/constants/foundproof";
import { buildProofMessage } from "../src/utils/proof";
import { buildExplorerUrl } from "../src/utils/proof";
import { logEvent } from "./logger";
import {
  parseSymbolNetworkType,
  resolveSymbolNetwork,
  SymbolNetworkType
} from "./symbolNetwork";

type SymbolAnchorConfig = {
  nodeUrl: string;
  networkType: SymbolNetworkType;
  privateKey: string;
  generationHash?: string;
  epochAdjustmentSeconds?: number;
  explorerBaseUrl?: string;
  maxFee?: number;
  messagePrefix?: string;
};

type TransactionStatusResponse = {
  hash?: string;
  code?: string;
  deadline?: string;
  group?: string;
  message?: string;
};

async function announceTransaction(nodeUrl: string, payload: string) {
  let response: Response;

  try {
    response = await fetch(`${nodeUrl.replace(/\/$/, "")}/transactions`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: payload
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed.";
    throw new Error(`Symbol node unreachable: ${message}`);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Symbol announce failed: ${response.status} ${body}`);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTransactionStatus(nodeUrl: string, txHash: string): Promise<TransactionStatusResponse | null> {
  let response: Response;

  try {
    response = await fetch(`${nodeUrl.replace(/\/$/, "")}/transactionStatus/${txHash}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed.";
    throw new Error(`Symbol node unreachable: ${message}`);
  }

  if (!response.ok) {
    const body = await response.text();

    try {
      const payload = JSON.parse(body) as TransactionStatusResponse;

      if (response.status === 404 && payload.code === "ResourceNotFound") {
        return null;
      }
    } catch {
      // Fall through to the generic error below when the body is not JSON.
    }

    throw new Error(`Symbol status check failed: ${response.status} ${body}`);
  }

  return (await response.json()) as TransactionStatusResponse;
}

async function verifyAnnouncedTransaction(nodeUrl: string, txHash: string) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const status = await fetchTransactionStatus(nodeUrl, txHash);

    if (!status) {
      await sleep(1500);
      continue;
    }

    if (status.group === "failed" || status.code?.startsWith("Failure_")) {
      throw new Error(`Symbol transaction failed after announce: ${status.code ?? "UnknownFailure"}`);
    }

    if (status.group === "confirmed" || status.group === "unconfirmed" || status.group === "partial") {
      return status;
    }

    await sleep(1500);
  }

  return null;
}

export async function anchorRecordHashOnSymbol(recordHash: string, config: SymbolAnchorConfig) {
  const resolvedNetwork = await resolveSymbolNetwork({
    nodeUrl: config.nodeUrl,
    networkType: config.networkType,
    generationHash: config.generationHash,
    epochAdjustmentSeconds: config.epochAdjustmentSeconds,
    explorerBaseUrl: config.explorerBaseUrl
  });

  logEvent({
    event: "symbol.anchor.prepare",
    nodeUrl: resolvedNetwork.nodeUrl,
    networkType: resolvedNetwork.networkType,
    networkName: resolvedNetwork.networkName,
    generationHash: resolvedNetwork.generationHash,
    epochAdjustmentSeconds: resolvedNetwork.epochAdjustmentSeconds
  });

  const facade = new SymbolFacade(resolvedNetwork.network);
  const account = facade.createAccount(new PrivateKey(config.privateKey));
  const recipientAddress = new Address(account.address.toString());
  const message =
    config.messagePrefix && config.messagePrefix !== `${SYMBOL_PROOF_MESSAGE_PREFIX}:`
      ? `${config.messagePrefix}${recordHash}`
      : buildProofMessage(recordHash);

  const transaction = facade.createTransactionFromTypedDescriptor(
    new descriptors.TransferTransactionV1Descriptor(
      recipientAddress,
      [],
      message
    ),
    account.publicKey,
    Number(config.maxFee ?? 100),
    2 * 60 * 60
  );

  const signature = account.signTransaction(transaction);
  const payload = facade.transactionFactory.static.attachSignature(transaction, signature);
  const txHash = facade.hashTransaction(transaction).toString();

  await announceTransaction(resolvedNetwork.nodeUrl, payload);
  const transactionStatus = await verifyAnnouncedTransaction(resolvedNetwork.nodeUrl, txHash);

  logEvent({
    event: "symbol.anchor.announced",
    txHash,
    group: transactionStatus?.group ?? "unknown"
  });

  return {
    txHash,
    payload,
    explorerUrl: buildExplorerUrl(txHash, resolvedNetwork.explorerBaseUrl)
  };
}

export async function anchorFromEnv(recordHash: string) {
  const networkType = parseSymbolNetworkType(process.env.SYMBOL_NETWORK_TYPE);
  const privateKey = process.env.SYMBOL_PRIVATE_KEY;
  const nodeUrl = process.env.SYMBOL_NODE_URL ?? SYMBOL_TESTNET_NODE;

  if (!privateKey || !nodeUrl || privateKey === "REPLACE_WITH_TESTNET_PRIVATE_KEY") {
    throw new Error("Missing Symbol configuration in environment variables.");
  }

  return anchorRecordHashOnSymbol(recordHash, {
    nodeUrl,
    networkType,
    privateKey,
    generationHash: process.env.SYMBOL_GENERATION_HASH,
    epochAdjustmentSeconds: process.env.SYMBOL_EPOCH_ADJUSTMENT_SECONDS
      ? Number(process.env.SYMBOL_EPOCH_ADJUSTMENT_SECONDS)
      : undefined,
    explorerBaseUrl: process.env.SYMBOL_EXPLORER_BASE_URL,
    maxFee: Number(process.env.SYMBOL_MAX_FEE ?? 100),
    messagePrefix: process.env.SYMBOL_MESSAGE_PREFIX ?? `${SYMBOL_PROOF_MESSAGE_PREFIX}:`
  });
}
