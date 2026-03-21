import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { Screen } from "@/components/Screen";
import { SectionCard } from "@/components/SectionCard";
import { theme } from "@/constants/theme";
import { getHealthStatus, HealthStatus } from "@/services/records";
import { getLastAnchorTxHash } from "@/storage/debug";

const DATA_MODE = process.env.EXPO_PUBLIC_DATA_MODE ?? "mock";
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8787").replace(/\/$/, "");

export default function DebugScreen() {
  const [lastAnchorTxHash, setLastAnchorTxHash] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<string>("Not checked");

  async function refresh() {
    const [txHash, health]: [string | null, HealthStatus] = await Promise.all([
      getLastAnchorTxHash(),
      getHealthStatus().catch((error) => ({
        status: "unreachable",
        mode: DATA_MODE,
        detail: error instanceof Error ? error.message : "Health check failed"
      }))
    ]);

    setLastAnchorTxHash(txHash);
    setHealthStatus(`${health.status} (${health.mode})${health.detail ? ` - ${health.detail}` : ""}`);
  }

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  return (
    <Screen
      eyebrow="Debug"
      title="Runtime diagnostics"
      description="Use this screen to confirm the current mode, API endpoint, health status, and the last anchor transaction seen by the app."
    >
      <SectionCard>
        <Text style={styles.label}>Current mode</Text>
        <Text style={styles.value}>{DATA_MODE}</Text>
        <Text style={styles.label}>API endpoint</Text>
        <Text style={styles.value}>{API_BASE_URL}</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.label}>Health status</Text>
        <Text style={styles.value}>{healthStatus}</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.label}>Last anchor txHash</Text>
        <Text style={styles.value}>{lastAnchorTxHash ?? "No anchor recorded yet"}</Text>
      </SectionCard>

      <Pressable onPress={() => refresh().catch(() => undefined)} style={styles.button}>
        <Text style={styles.buttonText}>Refresh debug state</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700"
  },
  value: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 22
  },
  button: {
    alignItems: "center",
    backgroundColor: theme.colors.accentStrong,
    borderRadius: theme.radius.sm,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800"
  }
});
