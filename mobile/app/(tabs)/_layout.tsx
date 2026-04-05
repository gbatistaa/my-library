import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { HapticTab } from "@/components/haptic-tab";

export default function TabLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 88,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "library" : "library-outline"} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="session"
        options={{
          title: "Session",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "time" : "time-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="awards"
        options={{
          title: "Awards",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "trophy" : "trophy-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
