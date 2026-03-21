export function describeAnchorError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown anchor error";

  if (message.includes("Symbol node unreachable")) {
    return "Symbol node is unreachable. Check SYMBOL_NODE_URL and network access.";
  }

  if (message.includes("Symbol announce failed")) {
    return "Transaction announce failed on Symbol. Check wallet funding and node status.";
  }

  if (message.includes("Symbol transaction failed after announce")) {
    return "The transaction was announced but failed on Symbol. Check funding and transaction status.";
  }

  if (message.includes("Missing Symbol configuration")) {
    return "Symbol environment variables are incomplete on the API server.";
  }

  if (message.includes("API request failed")) {
    return message;
  }

  return message;
}
