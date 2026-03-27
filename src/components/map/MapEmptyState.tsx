import { View, Text } from "react-native";
import { Search } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { TextLink } from "@/components/ui/TextLink";

interface MapEmptyStateProps {
  onAction: () => void;
}

export function MapEmptyState({ onAction }: MapEmptyStateProps) {
  return (
    <View className="mx-4 flex-row items-center gap-3 rounded-2xl bg-surface/85 p-4 shadow-sm">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Search size={22} color={colors.primary} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="font-montserrat-semibold text-sm text-text-primary">
          Nenhum pet por aqui
        </Text>
        <Text className="font-montserrat text-xs text-text-secondary">
          Amplie a busca ou mude os filtros
        </Text>
        <TextLink label="Ver filtros" onPress={onAction} />
      </View>
    </View>
  );
}
