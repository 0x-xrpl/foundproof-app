# FoundProof Web Demo

This Vite app is the hackathon demo frontend for FoundProof.

It keeps the current project split:

- web demo UI: this folder
- proof API and Symbol anchor: `../server`
- off-chain record storage: `../server/runtime`

## What this demo shows

- finding record creation flow
- server-side private Symbol proof anchor
- proof detail and explorer link
- history and map views
- API/debug status in the profile screen
- no wallet-connect step; the demo focuses on Symbol proof itself

Symbol remains the proof layer.

## Setup

1. install dependencies

```bash
npm install
```

2. copy env template

```bash
cp .env.example .env.local
```

3. set API base URL if needed

```dotenv
VITE_FOUNDPROOF_API_BASE_URL=http://127.0.0.1:8787
```

4. start the FoundProof API from the project root

```bash
npm run server
```

5. start this web app

```bash
npm run dev
```

The demo frontend runs on `http://127.0.0.1:5173`.

This avoids colliding with the local Symbol REST node on `http://127.0.0.1:3000`.

## Vercel

This folder can be deployed to Vercel as a standalone demo frontend.

- set the Vercel project root directory to this folder
- if `VITE_FOUNDPROOF_API_BASE_URL` is not set, the app runs with embedded demo records
- if `VITE_FOUNDPROOF_API_BASE_URL` is set, the app will use the external FoundProof API

## Demo flow

1. create a record
2. save and anchor it on private Symbol
3. open proof detail
4. open explorer
5. show profile/debug status

## Notes

- the API must allow browser access; the root server now sends CORS headers
- the Symbol proof transaction is still signed server-side
- use the root `.env` to switch between public testnet and private bootstrap network
- this demo is currently optimized for the local private Symbol network
