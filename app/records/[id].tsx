import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { ProofBadge } from "@/components/ProofBadge";
import { Screen } from "@/components/Screen";
import { SectionCard } from "@/components/SectionCard";
import { REQUIRED_COPY } from "@/constants/foundproof";
import { theme } from "@/constants/theme";
import { loadRecord } from "@/services/records";
import { FoundRecord } from "@/types/found-record";
import { formatTimestamp } from "@/utils/date";

export default function RecordDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [record, setRecord] = useState<FoundRecord | null>(null);

  useEffect(() => {
    if (id) {
      loadRecord(id).then((result) => setRecord(result ?? null));
    }
  }, [id]);

  if (!record) {
    return (
      <Screen eyebrow="Record" title="Record not found" description="The requested record could not be loaded.">
        <SectionCard>
          <Text style={styles.meta}>The record may be missing from the off-chain API.</Text>
        </SectionCard>
      </Screen>
    );
  }

  return (
    <Screen
      eyebrow="Record Detail"
      title="Proof-aware record detail"
      description="This page exposes the searchable discovery data alongside the Symbol proof reference."
    >
      <Image source={{ uri: record.imageUrl }} style={styles.image} />

      <SectionCard>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>{record.category.replaceAll("_", " ")}</Text>
          <ProofBadge status={record.status} />
        </View>
        <Text style={styles.body}>{record.description}</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.heading}>Finding record</Text>
        <Text style={styles.meta}>Record ID: {record.id}</Text>
        <Text style={styles.meta}>Found at: {formatTimestamp(record.capturedAt)}</Text>
        <Text style={styles.meta}>Area: {record.locationLabel ?? "Withheld"}</Text>
        <Text style={styles.meta}>Handoff: {record.handoffType.replaceAll("_", " ")}</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.heading}>Verification</Text>
        <Text style={styles.meta}>Proof anchored on Symbol</Text>
        <Text style={styles.meta}>Proof chain: Symbol</Text>
        <Text style={styles.meta}>Proof version: {record.proofVersion}</Text>
        <Text style={styles.meta}>Record hash: {record.proofRecordHash}</Text>
        <Text style={styles.meta}>Transaction hash: {record.proofTxHash ?? "Not anchored yet"}</Text>
        <Text style={styles.meta}>Explorer URL: {record.proofExplorerUrl ?? "Not available yet"}</Text>
        {record.proofExplorerUrl ? (
          <Pressable onPress={() => Linking.openURL(record.proofExplorerUrl!)}>
            <Text style={styles.link}>Open explorer link</Text>
          </Pressable>
        ) : null}
        <Text style={styles.note}>{REQUIRED_COPY.en.ownership}</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.heading}>Safety note</Text>
        <Text style={styles.note}>{REQUIRED_COPY.en.noPeer}</Text>
        <Text style={styles.note}>{REQUIRED_COPY.en.institution}</Text>
      </SectionCard>

      <Pressable onPress={() => router.push(`/proof/${record.id}`)} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Open proof screen</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    height: 280,
    width: "100%"
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  heading: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
    textTransform: "capitalize"
  },
  body: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 22
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 20
  },
  note: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 20
  },
  link: {
    color: theme.colors.accentStrong,
    fontSize: 13,
    fontWeight: "700"
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.accentStrong,
    borderRadius: theme.radius.sm,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800"
  }
});
