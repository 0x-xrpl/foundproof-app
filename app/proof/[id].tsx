import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { ProofBadge } from "@/components/ProofBadge";
import { Screen } from "@/components/Screen";
import { SectionCard } from "@/components/SectionCard";
import { REQUIRED_COPY } from "@/constants/foundproof";
import { theme } from "@/constants/theme";
import { anchorRecord, loadRecord } from "@/services/records";
import { describeAnchorError } from "@/utils/errors";
import { FoundRecord } from "@/types/found-record";
import { formatTimestamp } from "@/utils/date";

export default function ProofResultScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [record, setRecord] = useState<FoundRecord | null>(null);
  const [isAnchoring, setIsAnchoring] = useState(false);

  useEffect(() => {
    if (id) {
      loadRecord(id).then((result) => setRecord(result ?? null));
    }
  }, [id]);

  async function handleAnchor() {
    if (!id) {
      return;
    }

    setIsAnchoring(true);
    try {
      const result = await anchorRecord(id);
      setRecord(result.record);
    } catch (error) {
      Alert.alert("Anchor failed", describeAnchorError(error));
    } finally {
      setIsAnchoring(false);
    }
  }

  if (!record) {
    return (
      <Screen eyebrow="Proof" title="Proof target missing" description="The record could not be loaded for proof generation.">
        <SectionCard>
          <Text style={styles.meta}>Create and save a record first.</Text>
        </SectionCard>
      </Screen>
    );
  }

  return (
    <Screen
      eyebrow="Proof Result"
      title="Anchor the record on Symbol"
      description="Only the proof payload is anchored on Symbol. Images and searchable metadata remain off-chain."
    >
      <Image source={{ uri: record.imageUrl }} style={styles.image} />

      <SectionCard>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Record summary</Text>
          <ProofBadge status={record.status} />
        </View>
        <Text style={styles.meta}>Record ID: {record.id}</Text>
        <Text style={styles.meta}>Created at: {formatTimestamp(record.createdAt)}</Text>
        <Text style={styles.meta}>Category: {record.category.replaceAll("_", " ")}</Text>
        <Text style={styles.meta}>Handoff: {record.handoffType.replaceAll("_", " ")}</Text>
        <Text style={styles.meta}>Image hash: {record.imageHash}</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.heading}>Proof reference</Text>
        <Text style={styles.meta}>Record hash: {record.proofRecordHash ?? "Generate proof to create this hash."}</Text>
        <Text style={styles.meta}>Transaction hash: {record.proofTxHash ?? "Not announced yet."}</Text>
        <Text style={styles.meta}>Explorer URL: {record.proofExplorerUrl ?? "Not available yet."}</Text>
        <Text style={styles.note}>Proof anchored on Symbol.</Text>
        {record.proofExplorerUrl ? (
          <Pressable onPress={() => Linking.openURL(record.proofExplorerUrl!)}>
            <Text style={styles.link}>Open in explorer</Text>
          </Pressable>
        ) : null}
      </SectionCard>

      <SectionCard>
        <Text style={styles.heading}>Boundary</Text>
        <Text style={styles.note}>{REQUIRED_COPY.en.noPeer}</Text>
        <Text style={styles.note}>{REQUIRED_COPY.en.symbol}</Text>
      </SectionCard>

      {record.status !== "anchored" ? (
        <Pressable onPress={handleAnchor} style={styles.primaryButton}>
          {isAnchoring ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Create proof on Symbol</Text>
          )}
        </Pressable>
      ) : (
        <Pressable onPress={() => router.push(`/records/${record.id}`)} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Open detail screen</Text>
        </Pressable>
      )}
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
    fontWeight: "800"
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
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.sm,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700"
  }
});
