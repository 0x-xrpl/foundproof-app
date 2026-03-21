import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { RecordCard } from "@/components/RecordCard";
import { Screen } from "@/components/Screen";
import { SectionCard } from "@/components/SectionCard";
import { REQUIRED_COPY } from "@/constants/foundproof";
import { theme } from "@/constants/theme";
import { categories } from "@/data/categories";
import { runRecordSearch } from "@/services/records";
import { FoundRecord } from "@/types/found-record";

export default function SearchScreen() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [area, setArea] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [recentRecords, setRecentRecords] = useState<FoundRecord[]>([]);

  useEffect(() => {
    runRecordSearch({}).then(setRecentRecords).catch(() => setRecentRecords([]));
  }, []);

  function handleSearch() {
    router.push({
      pathname: "/search/results",
      params: {
        keyword,
        category,
        area,
        dateFrom,
        dateTo
      }
    });
  }

  return (
    <Screen
      eyebrow="Search"
      title="Explore the lost-and-found network"
      description="Search stays off-chain for speed. Proof integrity stays on Symbol Testnet. The record helps people discover the right institution path, not contact each other directly."
    >
      <SectionCard>
        <Text style={styles.policyHeadline}>{REQUIRED_COPY.en.network}</Text>
        <Text style={styles.policyText}>{REQUIRED_COPY.en.noPeer}</Text>
      </SectionCard>

      <SectionCard>
        <TextInput
          onChangeText={setKeyword}
          placeholder="Keyword, item type, or detail"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          value={keyword}
        />
        <TextInput
          onChangeText={setArea}
          placeholder="Area or facility"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          value={area}
        />
        <View style={styles.chipRow}>
          <Pressable
            onPress={() => setCategory("all")}
            style={[styles.chip, category === "all" ? styles.chipSelected : null]}
          >
            <Text style={[styles.chipText, category === "all" ? styles.chipTextSelected : null]}>
              All categories
            </Text>
          </Pressable>
          {categories.map((option) => {
            const isSelected = category === option;
            return (
              <Pressable
                key={option}
                onPress={() => setCategory(option)}
                style={[styles.chip, isSelected ? styles.chipSelected : null]}
              >
                <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>
                  {option.replaceAll("_", " ")}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          autoCapitalize="none"
          onChangeText={setDateFrom}
          placeholder="Date from (YYYY-MM-DD)"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          value={dateFrom}
        />
        <TextInput
          autoCapitalize="none"
          onChangeText={setDateTo}
          placeholder="Date to (YYYY-MM-DD)"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          value={dateTo}
        />
        <Pressable onPress={handleSearch} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Search records</Text>
        </Pressable>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Recent records</Text>
        {recentRecords.length === 0 ? (
          <Text style={styles.policyText}>No records yet. Create one from the Capture tab.</Text>
        ) : (
          recentRecords.slice(0, 3).map((record) => <RecordCard key={record.id} record={record} />)
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    color: theme.colors.text,
    minHeight: 50,
    paddingHorizontal: 14
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  chip: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  chipSelected: {
    backgroundColor: "#d9efe7"
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700"
  },
  chipTextSelected: {
    color: theme.colors.accentStrong
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
  policyHeadline: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800"
  },
  policyText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 20
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800"
  }
});
