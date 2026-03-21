import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import { FoundRecord } from "@/types/found-record";
import { formatTimestamp } from "@/utils/date";
import { ProofBadge } from "@/components/ProofBadge";

type RecordCardProps = {
  record: FoundRecord;
};

export function RecordCard({ record }: RecordCardProps) {
  return (
    <Pressable onPress={() => router.push(`/records/${record.id}`)} style={styles.card}>
      <Image source={{ uri: record.thumbnailUrl ?? record.imageUrl }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.category}>{record.category.replaceAll("_", " ")}</Text>
          <ProofBadge status={record.status} />
        </View>
        <Text numberOfLines={2} style={styles.description}>
          {record.description}
        </Text>
        <Text style={styles.meta}>{formatTimestamp(record.capturedAt)}</Text>
        <Text style={styles.meta}>{record.locationLabel ?? "Location withheld"}</Text>
        <Text style={styles.meta}>Handoff: {record.handoffType.replaceAll("_", " ")}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    overflow: "hidden",
    padding: theme.spacing.sm
  },
  image: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.sm,
    height: 108,
    width: 92
  },
  body: {
    flex: 1,
    gap: 6
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between"
  },
  category: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800",
    textTransform: "capitalize"
  },
  description: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: 12
  }
});
