type LogLevel = "info" | "warn" | "error";

type LogPayload = {
  event: string;
  level?: LogLevel;
  [key: string]: unknown;
};

export function logEvent(payload: LogPayload) {
  const entry = {
    timestamp: new Date().toISOString(),
    level: payload.level ?? "info",
    ...payload
  };

  const serialized = JSON.stringify(entry);

  if (entry.level === "error") {
    console.error(serialized);
    return;
  }

  if (entry.level === "warn") {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
}
