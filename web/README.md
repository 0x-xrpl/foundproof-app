# FoundProof Web Demo

This Vite app is the web presentation layer for the current FoundProof MVP.

It is intentionally scoped to present the core product flow clearly:

- capture a finding event
- show proof-oriented record detail
- show discovery through history and map views
- keep Symbol as the proof layer

## Runtime behavior

This web app supports two deliberate runtime choices:

- embedded demo mode when `VITE_FOUNDPROOF_API_BASE_URL` is not set
- external API mode when `VITE_FOUNDPROOF_API_BASE_URL` is configured

This makes the web demo usable as a standalone product walkthrough while preserving the option to connect it to the real FoundProof API later.

## What this web demo is for

- presenting the product flow with stable demo data
- showing proof detail and discovery views
- optionally connecting to the FoundProof API when server-side configuration is ready

The web demo does not change the architecture:

- search and image data remain off-chain
- proof remains server-side and Symbol-based

## Local setup

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

The app runs on:

```text
http://127.0.0.1:5173
```

## Optional API connection

If you want this web demo to use an external FoundProof API, add:

```dotenv
VITE_FOUNDPROOF_API_BASE_URL=http://127.0.0.1:8787
```

If no API base URL is set, the web app uses embedded demo records by design.

## Vercel

This folder can be deployed directly to Vercel.

Recommended Vercel settings:

- Root Directory: `web`
- Framework: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

If no API base URL is configured in Vercel, the deployed site uses embedded demo records.
If an API base URL is configured, the same web UI can point to the external FoundProof API.

## Notes

- this folder is optimized for a polished MVP walkthrough
- real Symbol anchoring remains available through the server-side runtime
- the standalone web deployment is presentation-ready even before external API configuration is connected
