import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="search/results" />
      <Stack.Screen name="records/[id]" />
      <Stack.Screen name="proof/[id]" />
    </Stack>
  );
}
