import { Pressable, Text, View } from "react-native";
import { SlidersHorizontal } from "lucide-react-native";
import { colors } from "@/lib/colors";

interface FilterButtonProps {
  onPress: () => void;
  hasActiveFilters: boolean;
}

export function FilterButton({ onPress, hasActiveFilters }: FilterButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2 rounded-full bg-surface/85 px-4 py-3 shadow-sm active:opacity-80"
    >
      <SlidersHorizontal size={18} color={hasActiveFilters ? colors.primary : colors.textPrimary} />
      <Text className={`font-montserrat-medium text-sm ${hasActiveFilters ? "text-primary" : "text-text-primary"}`}>Filtros</Text>
      {hasActiveFilters && (
        <View className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-surface bg-primary" />
      )}
    </Pressable>
  );
}
