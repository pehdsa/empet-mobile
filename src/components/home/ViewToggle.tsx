import { Pressable, View } from "react-native";
import { Map, List } from "lucide-react-native";
import { colors } from "@/lib/colors";
import type { HomeViewMode } from "@/stores/home-pet-reports.store";

interface ViewToggleProps {
  mode: HomeViewMode;
  onToggle: (mode: HomeViewMode) => void;
}

export function ViewToggle({ mode, onToggle }: ViewToggleProps) {
  return (
    <View className="flex-row items-center rounded-[22px] border border-border bg-surface/90 p-[3px] shadow-soft">
      <Pressable
        onPress={() => onToggle("map")}
        className={`items-center justify-center rounded-[18px] px-3.5 py-2 ${
          mode === "map" ? "bg-primary" : ""
        }`}
        accessibilityRole="button"
        accessibilityLabel="Modo mapa"
        accessibilityState={{ selected: mode === "map" }}
      >
        <Map
          size={16}
          color={mode === "map" ? colors.textInverse : colors.textSecondary}
        />
      </Pressable>
      <Pressable
        onPress={() => onToggle("list")}
        className={`items-center justify-center rounded-[18px] px-3.5 py-2 ${
          mode === "list" ? "bg-primary" : ""
        }`}
        accessibilityRole="button"
        accessibilityLabel="Modo lista"
        accessibilityState={{ selected: mode === "list" }}
      >
        <List
          size={16}
          color={mode === "list" ? colors.textInverse : colors.textSecondary}
        />
      </Pressable>
    </View>
  );
}
