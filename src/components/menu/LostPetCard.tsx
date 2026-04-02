import { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { speciesLabel, sizeLabel } from "@/constants/enums";
import { PetPhotoPlaceholder } from "@/components/shared/PetPhotoPlaceholder";
import type { PetReport } from "@/types/pet-report";

interface LostPetCardProps {
  report: PetReport;
  onPress: () => void;
}

export function LostPetCard({ report, onPress }: LostPetCardProps) {
  const { pet } = report;
  const photoUrl = pet.photos?.[0]?.url;
  const [imageError, setImageError] = useState(false);
  const showPlaceholder = !photoUrl || imageError;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-white p-3 active:opacity-80"
    >
      {!showPlaceholder ? (
        <Image
          source={{ uri: photoUrl }}
          className="h-16 w-16 rounded-xl"
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <PetPhotoPlaceholder
          species={pet.species}
          iconSize={28}
          className="h-16 w-16"
        />
      )}

      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text
            className="font-montserrat-bold text-base text-text-primary"
            numberOfLines={1}
          >
            {pet.name}
          </Text>
          <View
            className="rounded-lg px-2 py-0.5"
            style={{ backgroundColor: "#E5393520" }}
          >
            <Text
              className="font-montserrat-medium text-[11px]"
              style={{ color: colors.error }}
            >
              Perdido
            </Text>
          </View>
        </View>
        <Text
          className="font-montserrat text-[13px] text-text-secondary"
          numberOfLines={1}
        >
          {speciesLabel[pet.species]}
          {pet.size ? ` · ${sizeLabel[pet.size]}` : ""}
        </Text>
        {pet.breed && (
          <Text
            className="font-montserrat text-xs text-text-tertiary"
            numberOfLines={1}
          >
            {pet.breed.name}
          </Text>
        )}
      </View>

      <ChevronRight size={20} color={colors.textTertiary} />
    </Pressable>
  );
}
