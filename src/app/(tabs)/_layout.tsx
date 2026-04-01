import { Tabs } from "expo-router";
import { Search, Eye, PawPrint, Bell, Settings } from "lucide-react-native";
import { colors } from "@/lib/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontFamily: "Montserrat_500Medium", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Perdidos",
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sightings"
        options={{
          title: "Avistados",
          tabBarIcon: ({ color, size }) => <Eye size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pets"
        options={{
          title: "Meus Pets",
          tabBarIcon: ({ color, size }) => <PawPrint size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alertas",
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Config",
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
