# FoundProof

拾った瞬間を、証明に変える。

FoundProof is a proof network for lost-and-found records.

FoundProof is not a peer-to-peer exchange or resale platform.

The app helps document a finding event and supports handoff to the appropriate institution.

Ownership is not determined by the app.

AI assists input and discovery, but does not make legal or moral judgments.

Symbol is used as the proof layer.

## Project overview

FoundProof records the moment someone finds a lost item, preserves the searchable discovery data off-chain, and anchors a verifiable proof of that finding event on Symbol.

The product is designed for:

- recording a finding event
- proving the integrity of that record
- helping lost-item owners discover likely candidates
- supporting handoff to the appropriate institution

The product is explicitly not for:

- peer-to-peer handoff
- resale or exchange
- NFT ownership logic
- legal or ownership judgment

## Why Symbol

FoundProof uses Symbol as the proof layer because the MVP needs:

- tamper-evident record anchoring
- timestamp integrity
- stable transaction references
- a simple proof story for demos and judges

Search does not belong on-chain. Images do not belong on-chain. Only hashes and minimal metadata are anchored.

## MVP scope

Implemented in this repository:

- Expo Router mobile skeleton
- Capture flow for image, time, location, category, description, and handoff type
- Node API for record creation, search, detail, and anchoring
- Off-chain image and record storage abstraction
- Search flow with keyword, category, area, and date filters
- `imageHash` and `recordHash` generation
- Symbol proof anchor with server-side signing
- Record detail and proof detail screens
- Supabase-ready schema proposal
- Demo scripts for 60 seconds and 3 minutes
- Transaction verification notes
- Mock mode for app flows before API and Symbol credentials are ready
- API health endpoint and Expo debug screen for runtime checks
- future gratitude-payment adapter extension points, disabled by default

Explicitly out of scope:

- NFT minting
- token trading
- person-to-person messaging
- direct return matching
- ownership verification
- legal judgment
- gratitude payments in the current MVP

## Architecture

### Layers

- Mobile app: Expo Router screens for capture, search, result list, detail, and proof.
- Discovery layer: off-chain API, storage, and searchable metadata.
- Proof layer: Symbol self-transfer anchor for `recordHash`.

Future-only extension:

- optional gratitude-payment adapters, disabled by default and not connected to the MVP flow

### Runtime choice for this prototype

- Default mode is `mock`, so the Expo app can be used before the local API or Symbol wallet is configured.
- Images are uploaded from the app to the local API as base64 and stored under `server/runtime/uploads`.
- Records are stored in `server/runtime/records.json`.
- Proof creation is performed server-side and announced to Symbol.
- The Symbol anchor implementation is in [`server/symbolAnchor.ts`](./server/symbolAnchor.ts).
- For local development without public faucet dependency, FoundProof can also target a local Symbol Bootstrap private network.

### Folder structure

```text
app/                  Expo Router screens
src/components/       Shared UI blocks
src/constants/        Product copy and theme tokens
src/data/             Categories and handoff types
src/services/gratitude/ Future payment adapter extension points
src/services/         AI stub and mobile API client flows
src/types/            FoundRecord schema
src/utils/            Hashing, IDs, dates, location helpers
server/               API, storage, and Symbol anchor
supabase/             Deployment-ready SQL schema
docs/                 Architecture notes and demo scripts
```

## Core data model

The canonical model lives in [`src/types/found-record.ts`](./src/types/found-record.ts).

Important fields:

- `imageHash`: hash of the stored image payload
- `proofRecordHash`: hash of the normalized record payload
- `proofTxHash`: Symbol transaction hash
- `handoffType`: institution path, not a person-to-person action
- `status`: `draft | recorded | anchored`

## Hashing model

### `imageHash`

`imageHash` is generated from the image payload stored off-chain.

### `recordHash`

`recordHash` is generated from a normalized JSON payload containing:

- `id`
- `imageHash`
- `capturedAt`
- `category`
- `description`
- `handoffType`
- `locationHash`
- `proofVersion`

That `recordHash` is the value sent to the proof layer.

## Symbol proof anchor

The server-side API signs and announces a minimal Symbol self-transfer transaction whose message contains:

```text
FOUNDPROOF:<recordHash>
```

Inputs:

- `recordHash`

Outputs:

- `txHash`

See:

- [`server/symbolAnchor.ts`](./server/symbolAnchor.ts)
- [`server/index.ts`](./server/index.ts)
- [`docs/transaction-verification.md`](./docs/transaction-verification.md)

## Off-chain DB and storage

This prototype uses a lightweight local API so the app can demonstrate the intended separation between mobile, off-chain storage, and blockchain proof.

For deployment, the repository includes a Supabase-ready schema in [`supabase/schema.sql`](./supabase/schema.sql).

Recommended production split:

- Storage bucket: original images and thumbnails
- `found_records` table: searchable metadata and proof references
- indexes on `category`, `captured_at`, `location_label`, `handoff_type`, and `search_keywords`

## AI role

AI is intentionally limited to:

- category suggestion
- short neutral description assistance
- search assistance

AI must not:

- determine ownership
- determine theft
- make legal judgments
- declare final truth

## Future gratitude payments

The current MVP does not implement any payment flow.

Only extension points are prepared, and they are disabled by default.

Rules:

- no person-to-person messaging
- no direct contact flow
- only optional post-return gratitude in the future
- no wallet integration yet
- no token transfer yet

Candidate future adapters:

- Soneium
- Astar

JPYC note:

- Do not assume JPYC compatibility on Soneium unless officially verified.
- If JPYC is considered later, keep Astar available as a separate possible route.

See:

- [`future-gratitude-payments.md`](./docs/future-gratitude-payments.md)

## Demo method

### Fast path

1. Open the Capture tab.
2. Take or choose a photo of a found item.
3. Capture location and run AI assist.
4. Select an institution handoff type.
5. Save the record.
6. Open the Proof screen and anchor it.
7. Switch to Search and query for the item.
8. Open the detail page to inspect the record hash, transaction hash, and explorer link.

### Recommended demo story

Use the station-earbuds scenario defined in [`docs/demo-script.md`](./docs/demo-script.md).

## Local setup

### Required setup items

Before real Symbol anchoring, prepare these items:

1. Node.js 20+ and npm
2. Expo Go or iOS/Android simulator
3. A local `.env` file copied from `.env.example`
4. A funded Symbol account private key for server-side signing
5. A reachable Symbol node

You do not need items 4-6 to use mock mode.

Detailed preparation guides:

- [Symbol Testnet Setup](./docs/symbol-testnet-setup.md)
- [Symbol Private Network Setup](./docs/symbol-private-network-setup.md)
- [API Mode Checklist](./docs/api-mode-checklist.md)
- [MVP Flow Checklist](./docs/mvp-flow-checklist.md)

### Install

```bash
npm install
cp .env.example .env
npm run typecheck
```

### Run in mock mode

This is the recommended starting point until the API and Symbol wallet are ready.

Minimal `.env`

```dotenv
EXPO_PUBLIC_DATA_MODE=mock
```

Run:

```bash
npm run start
```

In `mock` mode, the Expo app uses local device storage for:

- record creation
- search
- local proof hash generation
- mock proof anchoring

The API does not need to be reachable for these flows.

Mock mode verification order:

1. open Capture
2. create a record
3. open Proof
4. run anchor in mock mode
5. open Detail
6. open Search
7. open Debug

Mock mode checklist:

- Capture saves a record successfully
- Proof screen shows `Record hash`
- Anchor completes without API
- Detail screen shows `Transaction hash`
- Search finds the record
- Debug tab shows:
  - `Current mode = mock`
  - API endpoint value
  - health status
  - last anchor txHash

### Run with local API + Symbol Testnet

When your Symbol Testnet wallet and funding are ready, switch `.env` to:

```dotenv
EXPO_PUBLIC_DATA_MODE=api
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8787
SYMBOL_NODE_URL=https://sym-test-01.opening-line.jp:3001
SYMBOL_NETWORK_TYPE=TEST_NET
SYMBOL_PRIVATE_KEY=YOUR_TESTNET_PRIVATE_KEY
SYMBOL_PUBLIC_KEY=YOUR_TESTNET_PUBLIC_KEY
SYMBOL_MAX_FEE=100
SYMBOL_MESSAGE_PREFIX=FOUNDPROOF:
```

Or start from the dedicated API template:

```bash
cp .env.api.example .env
```

Minimum values to fill before first real connection:

- `EXPO_PUBLIC_DATA_MODE=api`
- `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8787`
- `SYMBOL_NODE_URL=https://sym-test-01.opening-line.jp:3001`
- `SYMBOL_NETWORK_TYPE=TEST_NET`
- `SYMBOL_PRIVATE_KEY=YOUR_FOUNDPROOF_TESTNET_PRIVATE_KEY`

Then run:

```bash
npm run server
npm run start
```

Then verify in order with the checklist:

1. `GET /health`
2. `POST /records`
3. `POST /records/:id/anchor`
4. `GET /records/:id`
5. Expo proof/detail UI

API mode migration order:

1. confirm mock mode UI first
2. prepare Testnet wallet and funding
3. copy `.env.api.example` to `.env`
4. fill in `SYMBOL_PRIVATE_KEY`
5. run `npm run server`
6. run `npm run start`
7. follow [API Mode Checklist](./docs/api-mode-checklist.md)

### Run with local API + Symbol Bootstrap private network

Use this path when you want to remove the public faucet dependency entirely.

Start the local private network:

```bash
npm run symbol:bootstrap:verify
npm run symbol:bootstrap:start
```

Inspect the local network profile:

```bash
npm run symbol:network:profile -- http://127.0.0.1:3000
```

Inspect generated funded accounts:

```bash
npm run symbol:bootstrap:accounts
```

Then:

```bash
cp .env.private.example .env
npm run server
npm run start
```

Expected local services from the official `bootstrap + demo` assembly:

- REST: `http://127.0.0.1:3000`
- Explorer: `http://127.0.0.1:90`
- Faucet: `http://127.0.0.1:100`

Private-network migration order:

1. confirm mock mode UI first
2. start the local bootstrap network
3. run `npm run symbol:network:profile -- http://127.0.0.1:3000`
4. run `npm run symbol:bootstrap:accounts`
5. copy `.env.private.example` to `.env`
6. fill in `SYMBOL_PRIVATE_KEY`, `SYMBOL_PUBLIC_KEY`, `SYMBOL_GENERATION_HASH`, and `SYMBOL_EPOCH_ADJUSTMENT_SECONDS`
7. run `npm run server`
8. run `npm run start`
9. follow [API Mode Checklist](./docs/api-mode-checklist.md)

API mode checklist summary:

- health endpoint returns `status=ok`
- record creation returns `id` and `proofRecordHash`
- anchor returns `proofTxHash`
- detail returns explorer link
- proof screen displays Symbol proof info
- debug tab shows:
  - `Current mode = api`
  - correct API endpoint
  - API health status
  - last anchor txHash

Fixed implementation assumptions for local Symbol Bootstrap:

- private net REST endpoint is `http://127.0.0.1:3000`
- private net explorer is `http://127.0.0.1:90`
- announce-time `transactionStatus` `404 ResourceNotFound` is treated as pending and retried

### Fastest private-net demo flow

Use this sequence for the shortest repeatable demo:

1. `npm run symbol:bootstrap:start`
2. `npm run symbol:network:profile -- http://127.0.0.1:3000`
3. `npm run symbol:bootstrap:accounts`
4. `cp .env.private.example .env`
5. fill in `SYMBOL_PRIVATE_KEY`, `SYMBOL_PUBLIC_KEY`, `SYMBOL_GENERATION_HASH`, and `SYMBOL_EPOCH_ADJUSTMENT_SECONDS`
6. `npm run server`
7. `npm run start`
8. create a record from Capture
9. open Proof and run anchor
10. open the explorer link
11. open Detail and Debug

UI values to confirm in the demo:

- Proof screen shows `Transaction hash` and `Explorer URL`
- Detail screen shows `Record hash`, `Transaction hash`, and `Explorer URL`
- Debug screen shows `Current mode = api`, the API endpoint, health status, and the last anchor txHash

Shortest real-connection path:

1. create a dedicated Symbol Testnet wallet
2. fund it from the testnet faucet linked in Symbol docs
3. `cp .env.api.example .env`
4. paste the Testnet private key into `.env`
5. `npm run server`
6. `npm run start`
7. follow [API Mode Checklist](./docs/api-mode-checklist.md)

### Install and run commands

Exact commands:

```bash
npm install
cp .env.example .env
npm run typecheck
npm run server
npm run start
```

### Environment

Copy `.env.example` and configure as needed.

- `EXPO_PUBLIC_DATA_MODE=mock` keeps the Expo app usable without the API.
- `EXPO_PUBLIC_DATA_MODE=api` makes the Expo app call the local API.
- `EXPO_PUBLIC_API_BASE_URL` is used by the mobile app.
- `SYMBOL_*` variables are used by the server-side anchor flow.
- `SYMBOL_PRIVATE_KEY` must be a funded Symbol account for real anchoring.
- `SYMBOL_GENERATION_HASH` and `SYMBOL_EPOCH_ADJUSTMENT_SECONDS` are optional on public Testnet but important for private bootstrap networks.
- `SYMBOL_EXPLORER_BASE_URL` lets proof screens link to either public Testnet explorer or local bootstrap explorer.

See also:

- [Symbol Testnet Setup](./docs/symbol-testnet-setup.md)
- [Symbol Private Network Setup](./docs/symbol-private-network-setup.md)
- [API Mode Checklist](./docs/api-mode-checklist.md)
- [MVP Flow Checklist](./docs/mvp-flow-checklist.md)

### Debug tab

The Expo `Debug` tab shows:

- current mode: `mock` or `api`
- configured API endpoint
- current health status
- last anchor `txHash` seen by the app

Use it as the first sanity check after changing `.env` or switching from `mock` to `api`.

### What works before Symbol setup

Without a funded Symbol account, you can still validate:

- capture UI
- image selection
- location capture
- AI suggestion flow
- local record creation
- local search
- proof screen rendering in mock mode

What requires real setup:

- local API runtime
- Symbol announce
- real transaction hash
- explorer verification

## Notes

- FoundProof does not expose direct contact between strangers.
- FoundProof does not prove ownership.
- FoundProof proves that a finding event was documented and can be verified later.
- This Codex run prepared both public Testnet and local private-network paths, but did not bootstrap Docker services or announce a real transaction in this environment.
