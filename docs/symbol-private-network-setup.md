# Symbol Private Network Setup

## Purpose

This guide lets FoundProof run without the public faucet by using a local Symbol private test network created with Symbol Bootstrap.

Use this when:

- public Testnet faucet is blocked by Twitter/X auth
- you want deterministic local development
- you want funded accounts immediately

FoundProof still keeps the same architecture:

- Symbol = proof layer
- off-chain API/storage = discovery layer

## Official references

- Symbol Bootstrap repository: https://github.com/symbol/symbol-bootstrap
- Symbol Bootstrap quickstart: https://docs.symbol.dev/guides/network/quickstart-symbol-bootstrap.html
- Symbol workstation and test currency guide: https://docs.symbol.dev/getting-started/setup-workstation.html

## Prerequisites

Before starting:

1. Docker Desktop or Docker Engine with Compose
2. Node.js 20+
3. `npm install` completed in this repository

Validate Docker first:

```bash
npm run symbol:bootstrap:verify
```

## Start a local Symbol private test network

The official bootstrap repo documents `bootstrap` as the preset for a custom private network, and the `demo` assembly as the variant that also starts Explorer and Faucet.

Run:

```bash
npm run symbol:bootstrap:start
```

This wraps the official command:

```bash
npx --yes symbol-bootstrap start -p bootstrap -a demo
```

Expected local services:

- Symbol REST node: `http://127.0.0.1:3000`
- Explorer: `http://127.0.0.1:90`
- Faucet: `http://127.0.0.1:100`

Important fixed assumptions for FoundProof:

- the bootstrap REST endpoint used by this project is `http://127.0.0.1:3000`
- the local explorer base URL is `http://127.0.0.1:90`
- announce-time `transactionStatus` `404 ResourceNotFound` is treated as pending and retried by the server

Stop the network:

```bash
npm run symbol:bootstrap:stop
```

Clean generated files and containers:

```bash
npm run symbol:bootstrap:clean
```

## Get the network profile for FoundProof

FoundProof can now resolve generation hash and epoch adjustment from the node automatically, but it is useful to print the values once and keep them in `.env`.

Run:

```bash
npm run symbol:network:profile -- http://127.0.0.1:3000
```

Expected output shape:

```dotenv
SYMBOL_NODE_URL=http://127.0.0.1:3000
SYMBOL_NETWORK_TYPE=TEST_NET
SYMBOL_GENERATION_HASH=...
SYMBOL_EPOCH_ADJUSTMENT_SECONDS=...
SYMBOL_EXPLORER_BASE_URL=http://127.0.0.1:90
EXPO_PUBLIC_SYMBOL_EXPLORER_BASE_URL=http://127.0.0.1:90
```

## Get funded local accounts

Bootstrap writes generated accounts and keys to `target/addresses.yml`.

To inspect them:

```bash
npm run symbol:bootstrap:accounts
```

This reads `target/addresses.yml` and prints discovered accounts, with `nemesis` and `faucet` entries sorted first.

Use one funded account as the FoundProof server wallet.

If you prefer a separate account for FoundProof, use the local faucet at `http://127.0.0.1:100` and fund that account from the browser.

## Create `.env` for private-network mode

Start from the dedicated template:

```bash
cp .env.private.example .env
```

Then fill in:

- `SYMBOL_GENERATION_HASH`
- `SYMBOL_EPOCH_ADJUSTMENT_SECONDS`
- `SYMBOL_PRIVATE_KEY`
- `SYMBOL_PUBLIC_KEY`

The intended values are:

```dotenv
PORT=8787
EXPO_PUBLIC_DATA_MODE=api
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8787
SYMBOL_NODE_URL=http://127.0.0.1:3000
SYMBOL_EXPLORER_BASE_URL=http://127.0.0.1:90
EXPO_PUBLIC_SYMBOL_EXPLORER_BASE_URL=http://127.0.0.1:90
SYMBOL_NETWORK_TYPE=TEST_NET
SYMBOL_GENERATION_HASH=...
SYMBOL_EPOCH_ADJUSTMENT_SECONDS=...
SYMBOL_PRIVATE_KEY=...
SYMBOL_PUBLIC_KEY=...
SYMBOL_MAX_FEE=100
SYMBOL_MESSAGE_PREFIX=FOUNDPROOF:
```

## Run FoundProof against the local private network

Start API:

```bash
npm run server
```

Start Expo:

```bash
npm run start
```

Then verify:

1. `GET /health`
2. create record
3. anchor record
4. inspect detail
5. open local explorer
6. confirm proof screen in Expo

For the UI itself, confirm:

- Proof shows `Transaction hash` and `Explorer URL`
- Detail shows `Record hash`, `Transaction hash`, and `Explorer URL`
- the app is clearly operating in the API-backed runtime

For the app/API flow itself, use [API Mode Checklist](./api-mode-checklist.md).

## Why this removes the faucet blocker

The public Testnet path depends on a public faucet and external account rules.

The local private-network path does not:

- bootstrap creates the network locally
- demo assembly includes a local faucet
- bootstrap generates funded accounts in `target/addresses.yml`
- FoundProof can anchor against the local REST node with no public auth dependency

## Common failure points

- Docker is not running
- bootstrap containers are still starting
- `target/addresses.yml` not created yet
- `.env` still points to public Testnet
- `SYMBOL_PRIVATE_KEY` comes from the wrong account
- local REST node is not reachable on `127.0.0.1:3000`
