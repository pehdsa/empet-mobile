import { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { speciesLabel, sizeLabel } from "@/constants/enums";
import { PetPhotoPlaceholder } from "@/components/shared/PetPhotoPlaceholder";
import type { Pet } from "@/types/pet";

interface PetCardProps {
  pet: Pet;
  onPress: () => void;
}

export function PetCard({ pet, onPress }: PetCardProps) {
  const photoUrl = pet.photos?.[0]?.url;
  const [imageError, setImageError] = useState(false);
  const showPlaceholder = !photoUrl || imageError;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl bg-white p-3 shadow-soft active:opacity-80"
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
        <PetPhotoPlaceholder species={pet.species} iconSize={28} className="h-16 w-16" />
      )}

      {/* Info */}
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text
            className="flex-1 font-montserrat-bold text-base text-text-primary"
            numberOfLines={1}
          >
            {pet.name}
          </Text>
          {pet.activeReportId ? (
            <View className="flex-row items-center gap-1.5 rounded-lg px-2.5 py-[3px]" style={{ backgroundColor: "#E5393515" }}>
              <View className="h-2 w-2 rounded-full" style={{ backgroundColor: "#E53935" }} />
              <Text className="font-montserrat-semibold text-xs" style={{ color: "#E53935" }}>
                Perdido
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-1.5 rounded-xl px-3 py-1" style={{ backgroundColor: "#43A04715" }}>
              <View className="h-2 w-2 rounded-full" style={{ backgroundColor: "#43A047" }} />
              <Text className="font-montserrat-semibold text-xs" style={{ color: "#43A047" }}>
                Seguro
              </Text>
            </View>
          )}
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
