# API Mode Checklist

## Goal

Confirm this sequence in order:

1. health check
2. record creation
3. anchor
4. detail
5. explorer
6. Expo proof display

Fixed implementation assumptions:

- local Symbol Bootstrap REST endpoint is `http://127.0.0.1:3000`
- local Symbol Bootstrap explorer is `http://127.0.0.1:90`
- `transactionStatus` `404 ResourceNotFound` immediately after announce is treated as pending and retried

## Before starting

Confirm these preconditions:

- `.env` exists and `EXPO_PUBLIC_DATA_MODE=api`
- `SYMBOL_PRIVATE_KEY` is set to a funded Symbol wallet for the selected network
- `SYMBOL_NODE_URL` points to a reachable Symbol node
- dependencies are installed with `npm install`

Supported anchor backends for this checklist:

- public Symbol Testnet
- local Symbol Bootstrap private network

## Start commands

Run the API:

```bash
npm run server
```

Run Expo:

```bash
npm run start
```

Recommended order:

1. copy `.env.api.example` to `.env`
2. or copy `.env.private.example` to `.env` for local bootstrap mode
3. fill in `SYMBOL_PRIVATE_KEY`
4. if using a private network, also set `SYMBOL_GENERATION_HASH` and `SYMBOL_EPOCH_ADJUSTMENT_SECONDS`
5. start API
6. run `/health`
7. create a record
8. anchor it
9. inspect detail
10. open explorer
11. confirm the same record in Expo UI

## 1. Health check

Expected result: API returns `{"status":"ok","mode":"api"}` or `{"status":"ok","mode":"mock"}` depending on env

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

Local bootstrap demo explorer format:

```text
http://127.0.0.1:90/transactions/<txHash>
```

## 6. Expo UI check

Confirm in the app:

- Capture screen can save a record in API mode
- Proof screen can call anchor successfully
- Proof screen shows `Transaction hash`
- Proof screen shows `Explorer URL`
- Detail screen shows `Record hash`
- Detail screen shows `Transaction hash`
- Detail screen shows `Explorer URL`
- Search screen can find the created record
- Debug tab shows:
  - current mode
  - current API endpoint
  - health status
  - last anchor txHash

## Failure checks

If health check fails:

- confirm `npm run server` is running
- confirm `PORT` and `EXPO_PUBLIC_API_BASE_URL` match

If anchor fails:

- confirm `SYMBOL_PRIVATE_KEY` is set
- confirm the wallet has enough `symbol.xym`
- confirm `SYMBOL_NODE_URL` is reachable
- confirm `SYMBOL_NETWORK_TYPE=TEST_NET`
- if using a private bootstrap network, confirm `SYMBOL_GENERATION_HASH` and `SYMBOL_EPOCH_ADJUSTMENT_SECONDS` match the local node
- if `transactionStatus` returns `404 ResourceNotFound` briefly after announce, the current implementation retries automatically
- if that `404 ResourceNotFound` persists past the retry window, inspect API logs and confirm the local REST node is healthy
- if you see `Failure_Core_Insufficient_Balance`, the transaction was announced but rejected on-chain because the Testnet wallet does not have enough XYM

Most common real-connection mistakes:

- `.env` still has `EXPO_PUBLIC_DATA_MODE=mock`
- wrong Testnet wallet key pasted into `.env`
- wallet was created but not funded yet
- stale Expo bundle after switching env values
- API is running on a different port from `EXPO_PUBLIC_API_BASE_URL`
