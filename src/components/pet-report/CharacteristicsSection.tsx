import { View, Text } from "react-native";
import { Target, Paintbrush, Heart, Tag } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { characteristicCategoryLabel } from "@/constants/enums";
import { characteristicCategoryIcon } from "@/constants/characteristics";
import type { Characteristic, CharacteristicCategory } from "@/types/characteristic";

interface CharacteristicsSectionProps {
  characteristics: Characteristic[];
}

const CATEGORY_ORDER: CharacteristicCategory[] = [
  "MARKING",
  "COAT",
  "BEHAVIOR",
  "IDENTIFICATION",
];

const iconMap = {
  target: Target,
  paintbrush: Paintbrush,
  heart: Heart,
  tag: Tag,
} as const;

export function CharacteristicsSection({
  characteristics,
}: CharacteristicsSectionProps) {
  if (characteristics.length === 0) return null;

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: characteristics.filter((c) => c.category === category),
  })).filter((group) => group.items.length > 0);

  if (grouped.length === 0) return null;

  return (
    <View className="gap-3 bg-surface px-4 py-3">
      {/* Divider */}
      <View className="h-px bg-border" />

      {/* Title */}
      <Text className="font-montserrat-bold text-base text-text-primary">
        Caracteristicas
      </Text>

      {/* Category rows */}
      {grouped.map(({ category, items }) => {
        const iconName = characteristicCategoryIcon[category];
        const IconComponent = iconMap[iconName as keyof typeof iconMap];

        return (
          <View key={category} className="gap-1.5">
            {/* Category label */}
            <View className="flex-row items-center gap-1.5">
              <IconComponent size={14} color={colors.textSecondary} />
              <Text className="font-montserrat-medium text-sm text-text-secondary">
                {characteristicCategoryLabel[category]}
              </Text>
            </View>

            {/* Pills */}
            <View className="flex-row flex-wrap gap-2">
              {items.map((item) => (
                <View
                  key={item.id}
                  className="rounded-full bg-background px-2 py-1"
                >
                  <Text className="font-montserrat text-[13px] text-text-primary">
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}
