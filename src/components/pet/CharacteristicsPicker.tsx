import { View, Text, Pressable } from "react-native";
import { Check } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { characteristicCategoryLabel } from "@/constants/enums";
import { useCharacteristics } from "@/hooks/useCharacteristics";
import type { CharacteristicCategory } from "@/types/characteristic";

interface CharacteristicsPickerProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

const CATEGORY_ORDER: CharacteristicCategory[] = [
  "MARKING",
  "COAT",
  "BEHAVIOR",
  "IDENTIFICATION",
];

export function CharacteristicsPicker({
  selectedIds,
  onChange,
}: CharacteristicsPickerProps) {
  const { data: characteristics } = useCharacteristics();

  if (!characteristics) return null;

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: characteristics.filter((c) => c.category === category),
  })).filter((g) => g.items.length > 0);

  const toggleItem = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <View className="gap-4">
      <Text className="font-montserrat-bold text-base text-text-primary">
        Caracteristicas
      </Text>

      {grouped.map(({ category, items }) => (
        <View key={category} className="gap-2">
          <Text className="font-montserrat-medium text-[13px] text-text-secondary">
            {characteristicCategoryLabel[category]}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {items.map((item) => {
              const selected = selectedIds.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggleItem(item.id)}
                  className={`h-9 flex-row items-center gap-1.5 rounded-full px-3 ${
                    selected
                      ? "bg-primary"
                      : "border border-border bg-surface"
                  }`}
                >
                  {selected && <Check size={14} color="#FFFFFF" />}
                  <Text
                    className={`text-[13px] ${
                      selected
                        ? "font-montserrat-medium text-text-inverse"
                        : "font-montserrat text-text-primary"
                    }`}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
