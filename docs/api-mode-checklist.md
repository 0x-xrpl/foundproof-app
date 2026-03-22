# API Mode Checklist

## Goal

Use this checklist when moving from the default `mock` evaluation path to the optional real API path.

The purpose is to confirm that:

1. the local API is reachable
2. records are created off-chain
3. proof anchoring is available through server-side configuration
4. proof references are returned to the client

Supported real-connection backends for this checklist:

- public Symbol Testnet
- local Symbol Bootstrap private network

## Fixed runtime assumptions for local private Symbol

- local Symbol Bootstrap REST endpoint: `http://127.0.0.1:3000`
- local Symbol Bootstrap explorer: `http://127.0.0.1:90`
- `transactionStatus` `404 ResourceNotFound` immediately after announce is treated as pending and retried

## Before starting

Confirm these preconditions:

- `.env` exists and is set to `EXPO_PUBLIC_DATA_MODE=api`
- `SYMBOL_PRIVATE_KEY` is configured for the selected network path
- `SYMBOL_NODE_URL` points to a reachable node
- dependencies are installed with `npm install`

## Start commands

Run the API:

```bash
npm run server
```

Run the app:

```bash
npm run start
```

Recommended order:

1. validate the core flow in `mock` mode first
2. copy `.env.api.example` to `.env`, or `.env.private.example` for local bootstrap mode
3. fill the required Symbol server-side values
4. start the API
5. run `/health`
6. create a record
7. anchor it
8. inspect detail
9. confirm the record in the client UI

## 1. Health check

Expected result:

- API returns `{"status":"ok","mode":"api"}` when API mode is active

```bash
curl -sS http://127.0.0.1:8787/health
```

## 2. Record creation check

Expected result:

- response includes `id`
- response includes `proofRecordHash`
- response status is `recorded`

Example request:

```bash
curl -sS -X POST http://127.0.0.1:8787/records \
  -H 'Content-Type: application/json' \
  -d '{
    "imageBase64":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9Wf3sAAAAASUVORK5CYII=",
    "imageMimeType":"image/png",
    "capturedAt":"2026-03-13T12:00:00.000Z",
    "locationLabel":"Shibuya, Tokyo, Japan",
    "locationHash":"demo-location-hash",
    "category":"wireless_earbuds",
    "description":"Wireless earbuds case found near the station platform.",
    "handoffType":"station_counter",
    "proofVersion":"1",
    "proofChain":"symbol"
  }'
```

Save the returned `id`.

## 3. Anchor check

Expected result:

- response includes `proofTxHash`
- status becomes `anchored`
- `proofExplorerUrl` is present when explorer base URL is configured

Example request:

```bash
curl -sS -X POST http://127.0.0.1:8787/records/<RECORD_ID>/anchor
```

## 4. Detail check

Expected result:

- `proofRecordHash` is present
- `proofTxHash` is present
- `proofExplorerUrl` is present when explorer base URL is configured

Example request:

```bash
curl -sS http://127.0.0.1:8787/records/<RECORD_ID>
```

## 5. Explorer check

Expected result:

- the transaction opens in the configured Symbol explorer
- the transaction message contains `FOUNDPROOF:<recordHash>`

Public Testnet explorer format:

```text
https://testnet.symbol.fyi/transactions/<txHash>
```

Local bootstrap explorer format:

```text
http://127.0.0.1:90/transactions/<txHash>
```

## 6. Client UI check

Confirm in the app:

- Capture can save a record in API mode
- the proof flow can anchor successfully
- proof detail shows the transaction reference
- detail shows the record and proof reference
- search can find the created record

## Operational checks if a real connection does not complete

If health check fails:

- confirm `npm run server` is running
- confirm `PORT` and `EXPO_PUBLIC_API_BASE_URL` match

If anchor does not complete:

- confirm `SYMBOL_PRIVATE_KEY` is configured
- confirm the server-side account has enough `symbol.xym`
- confirm `SYMBOL_NODE_URL` is reachable
- confirm the selected network values match the chosen runtime path
- for private bootstrap mode, confirm `SYMBOL_GENERATION_HASH` and `SYMBOL_EPOCH_ADJUSTMENT_SECONDS`

Common real-connection mistakes:

- `.env` still uses `mock`
- the wrong server-side key was pasted into `.env`
- the account is present but not funded yet
- the app bundle was not refreshed after changing env values
- the API is running on a different port
