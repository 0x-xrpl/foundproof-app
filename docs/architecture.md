# FoundProof Architecture

## Goal

FoundProof records a finding event off-chain and anchors its `recordHash` on Symbol Testnet.

The chain is used only for proof anchoring.

## Responsibilities

### Symbol Testnet

- proof anchoring
- timestamp integrity
- tamper resistance

### Off-chain API and database

- record creation
- image storage
- metadata indexing
- search
- transaction reference storage

### Mobile app

- capture input
- location capture
- AI-assisted labeling
- search and discovery
- proof display

## Runtime architecture in this repository

Default local development path:

- `mock` mode in the Expo app, without API or funded Symbol wallet

### Mobile

- Expo Router app in [`app`](/Users/mee/projects/FoundProof/app)
- API client in [`records.ts`](/Users/mee/projects/FoundProof/src/services/records.ts)

### API

- Node HTTP server in [`index.ts`](/Users/mee/projects/FoundProof/server/index.ts)
- record handlers in [`records.ts`](/Users/mee/projects/FoundProof/server/records.ts)
- local JSON/file storage in [`storage.ts`](/Users/mee/projects/FoundProof/server/storage.ts)

### Proof

- Symbol self-transfer anchor in [`symbolAnchor.ts`](/Users/mee/projects/FoundProof/server/symbolAnchor.ts)
- message format: `FOUNDPROOF:<recordHash>`
- explorer base: `https://testnet.symbol.fyi`

## API surface

### `POST /records`

Creates a record, stores the image off-chain, computes `imageHash`, computes `recordHash`, and persists the record.

### `POST /records/:id/anchor`

Signs and announces a Symbol Testnet self-transfer transaction containing the proof message. Stores `proofTxHash` and marks the record as anchored.

### `GET /records/search`

Searches off-chain metadata by:

- `keyword`
- `category`
- `location`
- `dateFrom`
- `dateTo`
- `handoffType`

### `GET /records/:id`

Returns the full record with proof information.

## Hash model

### `imageHash`

SHA-256 of the image payload.

### `recordHash`

SHA-256 of the normalized JSON payload containing:

- `id`
- `imageHash`
- `capturedAt`
- `category`
- `description`
- `handoffType`
- `locationHash`
- `proofVersion`

## Folder structure

```text
app/                  Expo Router screens
src/components/       Shared UI blocks
src/constants/        Product and network constants
src/data/             Categories and handoff types
src/services/         Mobile-side API and AI helpers
src/types/            Shared data model
src/utils/            Shared hashing, location, proof utilities
server/               HTTP API, storage, Symbol anchor
supabase/             Deployment-ready SQL schema
docs/                 Architecture and demo documentation
```
