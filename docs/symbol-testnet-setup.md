# Symbol Testnet Setup

## Purpose

This document explains what to put in `.env`, how to prepare a Symbol Testnet wallet, and how to move FoundProof from `mock` mode to `api` mode.

If the public Testnet faucet is blocked or unreliable, use the private-network alternative instead:

- [Symbol Private Network Setup](./symbol-private-network-setup.md)

## Required setup items

Before real anchoring, prepare all of the following:

1. Node.js 20+ and npm
2. Expo Go or a simulator/emulator
3. A local `.env` file copied from [`.env.example`](/Users/mee/projects/FoundProof/.env.example)
4. A dedicated Symbol Testnet wallet for the FoundProof server
5. Testnet `symbol.xym` funding for that wallet
6. A reachable Symbol Testnet REST node

Alternative for auth-free local development:

- a local Symbol Bootstrap private network with demo assembly

If you want a ready-to-edit API template, copy [`.env.api.example`](/Users/mee/projects/FoundProof/.env.api.example) to `.env`.

## `.env` fields

### Required for mock mode

- `EXPO_PUBLIC_DATA_MODE`
  Use `mock` to keep the Expo app usable without API or blockchain setup.

### Required for API mode

- `PORT`
  Local API port. Default is `8787`.
- `EXPO_PUBLIC_DATA_MODE`
  Set to `api`.
- `EXPO_PUBLIC_API_BASE_URL`
  Local API base URL used by the Expo app. Example: `http://127.0.0.1:8787`

### Required for Symbol Testnet anchor

- `SYMBOL_NODE_URL`
  Public Symbol Testnet REST node used by the API. Example: `https://sym-test-01.opening-line.jp:3001`
- `SYMBOL_NETWORK_TYPE`
  Keep this as `TEST_NET`
- `SYMBOL_PRIVATE_KEY`
  Private key of the dedicated FoundProof Testnet server wallet
- `SYMBOL_MAX_FEE`
  Transfer fee multiplier. Default `100` is fine for the MVP
- `SYMBOL_MESSAGE_PREFIX`
  Prefix for the proof payload message. Keep `FOUNDPROOF:`

### Optional

- `SYMBOL_PUBLIC_KEY`
  Operational reference value for your own verification
- `SYMBOL_GENERATION_HASH`
  Leave empty unless your chosen infrastructure requires it explicitly
- `SYMBOL_EPOCH_ADJUSTMENT_SECONDS`
  Leave empty for public Testnet. For local private networks, set this from `/network/properties`
- `SYMBOL_EXPLORER_BASE_URL`
  Optional explicit explorer base. Public Testnet uses `https://testnet.symbol.fyi`

## Recommended `.env` values for real anchor mode

```dotenv
PORT=8787
EXPO_PUBLIC_DATA_MODE=api
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8787
SYMBOL_NODE_URL=https://sym-test-01.opening-line.jp:3001
SYMBOL_NETWORK_TYPE=TEST_NET
SYMBOL_GENERATION_HASH=
SYMBOL_PRIVATE_KEY=YOUR_FOUNDPROOF_TESTNET_PRIVATE_KEY
SYMBOL_PUBLIC_KEY=YOUR_FOUNDPROOF_TESTNET_PUBLIC_KEY
SYMBOL_MAX_FEE=100
SYMBOL_MESSAGE_PREFIX=FOUNDPROOF:
```

Equivalent shortcut:

```bash
cp .env.api.example .env
```

## Wallet preparation

Use a dedicated Symbol Testnet wallet for server-side signing.

Fastest recommended approach:

1. Download and install Symbol Desktop Wallet from the official wallet page.
2. Create a new account using the wallet account-creation flow.
3. Select `TEST_NET` for that account.
4. Copy and store the private key securely.
5. Record the public key and address for operations and verification.
6. Use the official testnet faucet linked from Symbol docs to request `symbol.xym`.
7. Wait for the funding transaction to confirm before trying to anchor records.

Shortest path for FoundProof:

1. create a dedicated Testnet account in Symbol Desktop Wallet
2. copy the private key
3. paste it into `.env` from [`.env.api.example`](/Users/mee/projects/FoundProof/.env.api.example)
4. request faucet funds to that Testnet address
5. start `npm run server`
6. run the API checklist

Important:

- Do not use a mainnet wallet.
- Do not put a personal long-term wallet into `.env`.
- Treat the server private key as sensitive even on testnet.

## API mode migration order

Move from `mock` to `api` in this order:

1. confirm Expo UI works in `mock`
2. prepare Testnet wallet
3. fund the Testnet wallet
4. copy `.env.api.example` to `.env`
5. fill in `SYMBOL_PRIVATE_KEY` and optional `SYMBOL_PUBLIC_KEY`
6. start the API with `npm run server`
7. start Expo with `npm run start`
8. follow [API Mode Checklist](./api-mode-checklist.md)

## Official references

- Symbol Wallets: https://docs.symbol.dev/wallets.html
- Symbol workstation and test currency guide: https://docs.symbol.dev/getting-started/setup-workstation.html
- Symbol transaction concept and announce flow: https://docs.symbol.dev/concepts/transaction.html
- Symbol Bootstrap quickstart: https://docs.symbol.dev/guides/network/quickstart-symbol-bootstrap.html

## Funding shortcut

The Symbol docs point to the testnet faucet from the workstation guide.

Funding flow:

1. open the faucet linked from the Symbol docs
2. paste your dedicated Testnet address
3. request `symbol.xym`
4. wait for confirmation
5. confirm the wallet balance in Symbol Desktop Wallet before anchoring

## Minimal `.env.api.example` usage

Use the dedicated API template:

```bash
cp .env.api.example .env
```

Then fill only these required values first:

- `EXPO_PUBLIC_DATA_MODE=api`
- `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8787`
- `SYMBOL_NODE_URL=https://sym-test-01.opening-line.jp:3001`
- `SYMBOL_NETWORK_TYPE=TEST_NET`
- `SYMBOL_PRIVATE_KEY=...`

Optional later:

- `SYMBOL_PUBLIC_KEY`
- `SYMBOL_GENERATION_HASH`

## Common failure points

- wrong network: account is not `TEST_NET`
- unfunded wallet: no `symbol.xym` to pay transaction fee
- wrong private key in `.env`
- API base URL and server port do not match
- Symbol node URL is unreachable
