import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4a90e2",
        tabBarInactiveTintColor: "#aaa",
        tabBarStyle: {
          backgroundColor: "#222",
          borderTopColor: "#111",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="download"
        options={{
          title: "Baixar",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="download" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="audio"
        options={{
          title: "Audio",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="download" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
