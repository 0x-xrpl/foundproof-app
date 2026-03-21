import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text } from "react-native";

import { RecordCard } from "@/components/RecordCard";
import { Screen } from "@/components/Screen";
import { SectionCard } from "@/components/SectionCard";
import { theme } from "@/constants/theme";
import { runRecordSearch } from "@/services/records";
import { FoundRecord, SearchFilters } from "@/types/found-record";

export default function SearchResultsScreen() {
  const params = useLocalSearchParams<{
    keyword?: string | string[];
    category?: string | string[];
    area?: string | string[];
    dateFrom?: string | string[];
    dateTo?: string | string[];
  }>();
  const [records, setRecords] = useState<FoundRecord[]>([]);

  function coerceParam(value?: string | string[]) {
    return Array.isArray(value) ? value[0] : value;
  }

  useEffect(() => {
    const filters: SearchFilters = {
      keyword: coerceParam(params.keyword),
      category: coerceParam(params.category),
      area: coerceParam(params.area),
      dateFrom: coerceParam(params.dateFrom),
      dateTo: coerceParam(params.dateTo)
    };

    runRecordSearch(filters).then(setRecords).catch(() => setRecords([]));
  }, [params.area, params.category, params.dateFrom, params.dateTo, params.keyword]);

  return (
    <Screen
      eyebrow="Results"
      title="Candidate records"
      description="Discovery is filtered off-chain by metadata. Open any result to inspect the proof state and institution handoff details."
    >
      <SectionCard>
        <Text style={styles.summaryText}>
          {records.length} result{records.length === 1 ? "" : "s"} for the current query.
        </Text>
      </SectionCard>
      {records.length === 0 ? (
        <SectionCard>
          <Text style={styles.summaryText}>
            No matching records were found. Try a broader area, category, or date window.
          </Text>
        </SectionCard>
      ) : (
        records.map((record) => <RecordCard key={record.id} record={record} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20
  }
});
