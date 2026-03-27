import { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { ChevronRight, Dog, Cat } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { speciesLabel, sizeLabel } from "@/constants/enums";
import type { Pet } from "@/types/pet";

interface PetCardProps {
  pet: Pet;
  onPress: () => void;
}

export function PetCard({ pet, onPress }: PetCardProps) {
  const photoUrl = pet.photos?.[0]?.url;
  const [imageError, setImageError] = useState(false);
  const showPlaceholder = !photoUrl || imageError;
  const SpeciesIcon = pet.species === "DOG" ? Dog : Cat;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3 active:opacity-80"
    >
      {/* Foto */}
      {!showPlaceholder ? (
        <Image
          source={{ uri: photoUrl }}
          className="h-16 w-16 rounded-xl"
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View className="h-16 w-16 items-center justify-center rounded-xl bg-border/30">
          <SpeciesIcon size={28} color={colors.textTertiary} />
        </View>
      )}

      {/* Info */}
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text
            className="font-montserrat-bold text-base text-text-primary"
            numberOfLines={1}
          >
            {pet.name}
          </Text>
          <View
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: pet.isActive ? colors.success : colors.textTertiary,
            }}
          />
        </View>
        <Text className="font-montserrat text-[13px] text-text-secondary" numberOfLines={1}>
          {speciesLabel[pet.species]} · {sizeLabel[pet.size]}
        </Text>
        {pet.breed && (
          <Text className="font-montserrat text-xs text-text-tertiary" numberOfLines={1}>
            {pet.breed.name}
          </Text>
        )}
      </View>

      {/* Chevron */}
      <ChevronRight size={20} color={colors.textTertiary} />
    </Pressable>
  );
}
