import { Tabs } from "expo-router";

import { theme } from "@/constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accentStrong,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border
        }
      }}
    >
      <Tabs.Screen
        name="capture"
        options={{
          title: "Capture"
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search"
        }}
      />
      <Tabs.Screen
        name="debug"
        options={{
          title: "Debug"
        }}
      />
    </Tabs>
  );
}
