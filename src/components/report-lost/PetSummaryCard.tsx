import { View, Text, Pressable, Image } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors } from "@/lib/colors";
import type { Pet } from "@/types/pet";

interface PetSummaryCardProps {
  pet: Pet;
  subtitle: string;
  onPress?: () => void;
  showChevron?: boolean;
}

export function PetSummaryCard({
  pet,
  subtitle,
  onPress,
  showChevron = false,
}: PetSummaryCardProps) {
  const photoUrl = pet.photos?.[0]?.url;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center gap-3 rounded-xl border border-border bg-surface p-3 active:opacity-80"
    >
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          className="h-12 w-12 rounded-xl"
          resizeMode="cover"
        />
      ) : (
        <View className="h-12 w-12 items-center justify-center rounded-xl bg-background">
          <Text className="font-montserrat-medium text-lg text-text-tertiary">
            {pet.name.charAt(0)}
          </Text>
        </View>
      )}

      <View className="flex-1 gap-0.5">
        <Text className="font-montserrat-medium text-sm text-text-primary">
          {pet.name}
        </Text>
        <Text className="font-montserrat text-[13px] text-text-secondary">
          {subtitle}
        </Text>
      </View>

      {showChevron && (
        <ChevronRight size={20} color={colors.textTertiary} />
      )}
    </Pressable>
  );
}
