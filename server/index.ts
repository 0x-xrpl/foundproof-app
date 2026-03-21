import "dotenv/config";

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, ServerResponse } from "node:http";
import path from "node:path";
import { URL } from "node:url";

import { HandoffType } from "../src/types/found-record";
import { readJsonBody, sendError, sendJson } from "./http";
import { logEvent } from "./logger";
import { anchorRecord, createRecord, getRecordDetail, searchRecordIndex } from "./records";
import { ensureRuntimeStorage, getUploadsDir } from "./storage";

const PORT = Number(process.env.PORT ?? 8787);
const DATA_MODE = process.env.EXPO_PUBLIC_DATA_MODE === "api" ? "api" : "mock";
const ALLOWED_ORIGIN = process.env.FOUNDPROOF_ALLOWED_ORIGIN ?? "*";

function setCorsHeaders(response: ServerResponse) {
  response.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function getContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
}

async function serveUpload(pathname: string, response: ServerResponse) {
  const uploadsDir = await getUploadsDir();
  const filename = path.basename(pathname.replace("/uploads/", ""));
  const filePath = path.join(uploadsDir, filename);
  await stat(filePath);

  response.writeHead(200, {
    "Content-Type": getContentType(filePath),
    "Cache-Control": "no-cache"
  });
  createReadStream(filePath).pipe(response);
}

async function main() {
  await ensureRuntimeStorage();

  const server = createServer(async (request, response) => {
    const method = request.method ?? "GET";
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
    const pathname = url.pathname;

    try {
      setCorsHeaders(response);

      if (method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
      }

      if (method === "GET" && pathname === "/health") {
        return sendJson(response, 200, {
          status: "ok",
          mode: DATA_MODE
        });
      }

      if (method === "GET" && pathname.startsWith("/uploads/")) {
        await serveUpload(pathname, response);
        return;
      }

      if (method === "POST" && pathname === "/records") {
        const body = await readJsonBody<Parameters<typeof createRecord>[0]>(request);
        const record = await createRecord(body);
        return sendJson(response, 201, record);
      }

      if (method === "GET" && pathname === "/records/search") {
        const records = await searchRecordIndex({
          keyword: url.searchParams.get("keyword") ?? undefined,
          category: url.searchParams.get("category") ?? undefined,
          area: url.searchParams.get("location") ?? undefined,
          dateFrom: url.searchParams.get("dateFrom") ?? undefined,
          dateTo: url.searchParams.get("dateTo") ?? undefined,
          handoffType: (url.searchParams.get("handoffType") as HandoffType | null) ?? undefined
        });
        return sendJson(response, 200, records);
      }

      const anchorMatch = pathname.match(/^\/records\/([^/]+)\/anchor$/);
      if (method === "POST" && anchorMatch) {
        const record = await anchorRecord(anchorMatch[1]);
        return sendJson(response, 200, record);
      }

      const detailMatch = pathname.match(/^\/records\/([^/]+)$/);
      if (method === "GET" && detailMatch) {
        const record = await getRecordDetail(detailMatch[1]);
        return sendJson(response, 200, record);
      }

      sendError(response, 404, "Not found");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected server error";
      logEvent({
        event: "api.error",
        level: "error",
        method,
        pathname,
        message
      });
      const statusCode =
        message === "Record not found." ||
        (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT")
          ? 404
          : 400;
      sendError(response, statusCode, message);
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    logEvent({
      event: "api.started",
      port: PORT,
      mode: DATA_MODE
    });
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
