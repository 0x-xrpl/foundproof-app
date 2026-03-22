# Symbol Testnet Setup

## Purpose

This document explains the optional real-network path for FoundProof.

Use it when you want the local API to anchor proof records on Symbol Testnet through server-side signing.

If you want to validate the product flow before connecting a funded account, start with `mock` mode first.

If you prefer a local proof environment without public faucet dependency, use the private-network alternative instead:

- [Symbol Private Network Setup](./symbol-private-network-setup.md)

## Runtime role

Symbol Testnet is not required to understand the MVP.

The current prototype is intentionally structured so that:

- `mock` mode covers the core product walkthrough
- Symbol Testnet is an optional real proof path
- real anchoring becomes available when the API and Symbol account configuration are ready

## Required setup items for real anchoring

Prepare the following only when enabling the real Testnet path:

1. Node.js 20+ and npm
2. Expo Go or a simulator/emulator
3. A local `.env` file copied from `.env.example` or `.env.api.example`
4. A dedicated Symbol Testnet account for server-side signing
5. Testnet `symbol.xym` funding for that account
6. A reachable Symbol Testnet REST node

## `.env` fields

### Mock-mode minimum

- `EXPO_PUBLIC_DATA_MODE=mock`

This keeps the prototype ready for immediate validation without API or blockchain setup.

### API-mode minimum

- `PORT`
- `EXPO_PUBLIC_DATA_MODE=api`
- `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8787`

### Real Symbol Testnet anchoring

- `SYMBOL_NODE_URL`
- `SYMBOL_NETWORK_TYPE=TEST_NET`
- `SYMBOL_PRIVATE_KEY`
- `SYMBOL_MAX_FEE`
- `SYMBOL_MESSAGE_PREFIX`

### Optional operational values

- `SYMBOL_PUBLIC_KEY`
- `SYMBOL_GENERATION_HASH`
- `SYMBOL_EPOCH_ADJUSTMENT_SECONDS`
- `SYMBOL_EXPLORER_BASE_URL`

## Recommended `.env` pattern for real Testnet anchoring

```dotenv
PORT=8787
EXPO_PUBLIC_DATA_MODE=api
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8787
SYMBOL_NODE_URL=https://sym-test-01.opening-line.jp:3001
SYMBOL_NETWORK_TYPE=TEST_NET
SYMBOL_GENERATION_HASH=
SYMBOL_PRIVATE_KEY=PASTE_DEDICATED_TESTNET_SERVER_PRIVATE_KEY
SYMBOL_PUBLIC_KEY=OPTIONAL_SERVER_PUBLIC_KEY
SYMBOL_MAX_FEE=100
SYMBOL_MESSAGE_PREFIX=FOUNDPROOF:
```

Shortcut:

```bash
cp .env.api.example .env
```

## Account preparation

Use a dedicated Symbol Testnet account for server-side signing.

Recommended flow:

1. create a dedicated Testnet account in Symbol Desktop Wallet
2. keep the private key securely
3. note the public key and address for operational reference
4. fund the Testnet account with `symbol.xym`
5. place the server-side key into `.env`
6. start the local API and use the API checklist

Important:

- use a dedicated Testnet account, not a personal long-term wallet
- treat the server-side private key as sensitive, even on Testnet
- use funding only when you are enabling the real proof path

## API mode migration order

Recommended order:

1. confirm the product flow in `mock` mode
2. copy `.env.api.example` to `.env`
3. fill the required API and Symbol values
4. confirm the dedicated Testnet account is funded
5. start the API with `npm run server`
6. start the app with `npm run start`
7. follow [API Mode Checklist](./api-mode-checklist.md)

## Minimal values before first real connection

These are the minimum values to fill first:

- `EXPO_PUBLIC_DATA_MODE=api`
- `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8787`
- `SYMBOL_NODE_URL=https://sym-test-01.opening-line.jp:3001`
- `SYMBOL_NETWORK_TYPE=TEST_NET`
- `SYMBOL_PRIVATE_KEY=...`

Add `SYMBOL_PUBLIC_KEY` as an optional reference if useful for operations or manual verification.

## Real-connection notes

Real proof anchoring is enabled when:

- the local API is running
- the Symbol node is reachable
- the dedicated server-side Testnet account is funded
- the required `.env` values are present

This is a supported runtime path, not the only way to evaluate the prototype.

## Common operational checks

- confirm the account is `TEST_NET`
- confirm the account has enough `symbol.xym`
- confirm the node URL is reachable
- confirm `EXPO_PUBLIC_API_BASE_URL` matches the local API port
- confirm `.env` is in `api` mode when testing the real path

## Official references

- Symbol Wallets: https://docs.symbol.dev/wallets.html
- Symbol workstation and test currency guide: https://docs.symbol.dev/getting-started/setup-workstation.html
- Symbol transaction concept and announce flow: https://docs.symbol.dev/concepts/transaction.html
- Symbol Bootstrap quickstart: https://docs.symbol.dev/guides/network/quickstart-symbol-bootstrap.html
