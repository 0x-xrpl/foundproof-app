import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import { RecordStatus } from "@/types/found-record";

type ProofBadgeProps = {
  status: RecordStatus;
};

const statusCopy: Record<RecordStatus, string> = {
  draft: "Draft",
  recorded: "Recorded",
  anchored: "Anchored on Symbol"
};

export function ProofBadge({ status }: ProofBadgeProps) {
  return (
    <View style={[styles.badge, status === "anchored" ? styles.badgeAnchored : null]}>
      <Text style={[styles.text, status === "anchored" ? styles.textAnchored : null]}>
        {statusCopy[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  badgeAnchored: {
    backgroundColor: "#d9efe7"
  },
  text: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  textAnchored: {
    color: theme.colors.success
  }
});
