import { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";

type ScreenProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function Screen({ eyebrow, title, description, children }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1
  },
  content: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg
  },
  header: {
    gap: theme.spacing.sm
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22
  }
});
