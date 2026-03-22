# FoundProof

### 拾った瞬間を、証明に

## Presentation:  
https://www.canva.com/design/DAHEoX5Th6U/zs0F3iIJBJpt81pizmv2rQ/edit?utm_content=DAHEoX5Th6U&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton


## Demo Movie:  
https://vimeo.com/1175836930



FoundProof is a proof network for lost-and-found records.

FoundProof documents a finding event, keeps discovery data searchable off-chain, and anchors a verifiable proof of that event on Symbol.

It is not a peer-to-peer exchange or resale platform.
It does not determine ownership.
It supports handoff to the appropriate institution.

## Project overview

FoundProof is designed around four deliberate responsibilities:

- record a finding event
- preserve a verifiable proof of that record
- keep lost-item discovery searchable across records
- support handoff to the appropriate institution

The product is intentionally not for:

- direct person-to-person return matching
- resale or exchange
- NFT ownership logic
- legal or ownership judgment

## Why Symbol

FoundProof uses Symbol only as the proof layer.

The current MVP focuses on:

- tamper-evident proof anchoring
- stable transaction references
- timestamp integrity
- a clear proof-verification flow

Search and image data remain off-chain.
Only hashes and minimal metadata are anchored.

## MVP positioning

This repository presents FoundProof as a scoped MVP with two runtime choices:

- `mock` mode first, for validating the complete product flow without external chain setup
- optional real connection paths, for server-side Symbol anchoring when the API and Symbol account configuration are ready

This keeps the MVP clear by default while preserving a real proof path through configuration.

## Current prototype

Included in this repository:

- Expo Router mobile skeleton
- Vite web demo in [`web/`](./web)
- Capture flow for image, time, location, category, description, and handoff type
- Node API structure for record creation, search, detail, and proof flows
- Off-chain image and record storage abstraction
- Search flow with keyword, category, area, and date filters
- `imageHash` and `recordHash` generation
- Symbol proof path through server-side signing
- Record detail and proof detail screens
- Supabase-ready schema proposal
- Demo scripts and verification notes
- mock-mode-first runtime flow
- optional Testnet and private-network runtime paths
- future gratitude-payment adapter extension points, disabled by default

Explicitly out of current MVP scope:

- NFT minting
- token trading
- person-to-person messaging
- direct return matching
- ownership verification
- legal judgment
- gratitude payments in the current MVP flow

## Architecture

### Layer split

- Mobile app: Expo Router screens for capture, search, result list, detail, and proof
- Web demo: Vite frontend in [`web/`](./web)
- Discovery layer: off-chain API, storage, and searchable metadata
- Proof layer: Symbol self-transfer anchor for `recordHash`

Future-only extension:

- optional gratitude-payment adapters, disabled by default and not connected to the MVP flow

### Runtime choice for this prototype

The repository is organized so the product can be understood before any funded chain account is connected.

- Default mode is `mock`
- The mobile app remains usable before the local API or Symbol account is configured
- The web demo can also run with embedded demo records when no external API is configured
- Real proof anchoring is available when the local API and Symbol server-side environment are ready
- For local proof verification without public faucet dependency, the same architecture can point to a Symbol Bootstrap private network

This keeps the MVP easy to evaluate before any real network path is enabled.

### Folder structure

```text
app/                  Expo Router screens
web/                  Vite demo frontend
src/components/       Shared UI blocks
src/constants/        Product copy and theme tokens
src/data/             Categories and handoff types
src/services/         AI stub and mobile API client flows
src/services/gratitude/ Future payment adapter extension points
src/types/            FoundRecord schema
src/utils/            Hashing, IDs, dates, location helpers
server/               API, storage, and Symbol anchor
supabase/             Deployment-ready SQL schema
docs/                 Setup notes, architecture notes, and demo scripts
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

Reference files:

- [`server/symbolAnchor.ts`](./server/symbolAnchor.ts)
- [`server/index.ts`](./server/index.ts)
- [`docs/transaction-verification.md`](./docs/transaction-verification.md)

## Off-chain discovery and storage

This prototype uses a lightweight local API to demonstrate the intended split between UI, searchable data, and blockchain proof.

For deployment, the repository includes a Supabase-ready schema in [`supabase/schema.sql`](./supabase/schema.sql).

Recommended production split:

- storage bucket: original images and thumbnails
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

The current MVP does not include a payment flow in the active product path.

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

### Default evaluation path

The recommended way to evaluate the current MVP is:

1. start in `mock` mode
2. validate capture, proof presentation, detail, and search flows
3. use the real Symbol path only when server-side configuration is ready

### Recommended story

Use the station-earbuds scenario in [`docs/demo-script.md`](./docs/demo-script.md).

## Local setup

### Install

```bash
npm install
cp .env.example .env
npm run typecheck
```

### Run in mock mode

This is the recommended starting point.

Minimal `.env`

```dotenv
EXPO_PUBLIC_DATA_MODE=mock
```

Run:

```bash
npm run start
```

In `mock` mode, the Expo app can be used for:

- capture flow validation
- local record creation
- search flow validation
- proof screen validation
- overall product walkthrough

The local API and Symbol account do not need to be connected for these flows.

### Optional real connection path: local API + Symbol

When you want real server-side proof anchoring, switch to `api` mode and provide the required Symbol environment values.

Start from the API template:

```bash
cp .env.api.example .env
```

Minimum values for a real Symbol connection:

- `EXPO_PUBLIC_DATA_MODE=api`
- `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8787`
- `SYMBOL_NODE_URL=...`
- `SYMBOL_NETWORK_TYPE=TEST_NET`
- `SYMBOL_PRIVATE_KEY=...`

For real Symbol anchoring, fill the required server-side environment values with a dedicated funded Testnet account or a local private-network account.

Then run:

```bash
npm run server
npm run start
```

### Optional real connection path: Symbol Testnet

Use Symbol Testnet when you want public-network proof references through the server-side proof path.

Concise path:

1. copy `.env.api.example` to `.env`
2. set the required API and Symbol values
3. use a funded dedicated Testnet account for server-side signing
4. run `npm run server`
5. run `npm run start`

Detailed operational notes:

- [Symbol Testnet Setup](./docs/symbol-testnet-setup.md)
- [API Mode Checklist](./docs/api-mode-checklist.md)

### Optional real connection path: local Symbol Bootstrap private network

Use the private-network path when you want local proof verification without depending on public faucet availability.

Start the local private network:

```bash
npm run symbol:bootstrap:verify
npm run symbol:bootstrap:start
```

Then collect the network profile and funded account values:

```bash
npm run symbol:network:profile -- http://127.0.0.1:3000
npm run symbol:bootstrap:accounts
cp .env.private.example .env
```

Then run:

```bash
npm run server
npm run start
```

Detailed operational notes:

- [Symbol Private Network Setup](./docs/symbol-private-network-setup.md)
- [API Mode Checklist](./docs/api-mode-checklist.md)

### Environment summary

Copy `.env.example` and adjust only the runtime you want to use.

- `EXPO_PUBLIC_DATA_MODE=mock` keeps the prototype ready for immediate flow validation
- `EXPO_PUBLIC_DATA_MODE=api` enables the local API runtime
- `EXPO_PUBLIC_API_BASE_URL` is used by the mobile app
- `SYMBOL_*` variables are used only by the server-side proof path
- `SYMBOL_PRIVATE_KEY` should be a dedicated funded account for real proof anchoring
- `SYMBOL_GENERATION_HASH` and `SYMBOL_EPOCH_ADJUSTMENT_SECONDS` are mainly relevant for private bootstrap networks
- `SYMBOL_EXPLORER_BASE_URL` lets proof screens point to either public Testnet explorer or a local bootstrap explorer

Additional setup references:

- [Symbol Testnet Setup](./docs/symbol-testnet-setup.md)
- [Symbol Private Network Setup](./docs/symbol-private-network-setup.md)
- [API Mode Checklist](./docs/api-mode-checklist.md)
- [MVP Flow Checklist](./docs/mvp-flow-checklist.md)

## What is demoable now

Without any funded Symbol account, the current prototype supports:

- capture UI
- image selection
- location capture
- AI suggestion flow
- local record creation
- local search
- proof presentation in mock mode

## What requires real setup

The following paths are available through configuration:

- local API runtime
- real Symbol announce
- real transaction hash generation
- explorer verification against the selected network

These are optional runtime paths, not prerequisites for understanding the MVP.

## Notes on verification

- FoundProof does not expose direct contact between strangers.
- FoundProof does not prove ownership.
- FoundProof proves that a finding event was documented and can be verified later.
- This repository includes both public Testnet and local private-network proof paths.
- Real-network claims should follow the server-side configuration and runtime path that are actually connected.
