import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { theme } from "@/constants/theme";

type SectionCardProps = {
  children: ReactNode;
};

export function SectionCard({ children }: SectionCardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.md
  }
});
