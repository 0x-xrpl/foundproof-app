import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";

type FieldLabelProps = {
  label: string;
  supportingText?: string;
};

export function FieldLabel({ label, supportingText }: FieldLabelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {supportingText ? <Text style={styles.supportingText}>{supportingText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700"
  },
  supportingText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18
  }
});
