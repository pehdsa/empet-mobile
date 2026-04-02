import { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { ChevronRight, MapPin } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { formatDate } from "@/utils/format-date";
import { PetPhotoPlaceholder } from "@/components/shared/PetPhotoPlaceholder";
import type { PetSighting } from "@/types/pet-sighting";

interface SightingCardProps {
  sighting: PetSighting;
  onPress: () => void;
}

export function SightingCard({ sighting, onPress }: SightingCardProps) {
  const photoUrl = sighting.photos?.[0]?.url;
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
          species={sighting.species}
          iconSize={28}
          className="h-16 w-16"
        />
      )}

      <View className="flex-1 gap-0.5">
        <Text
          className="font-montserrat-semibold text-[15px] text-text-primary"
          numberOfLines={1}
        >
          {sighting.title}
        </Text>
        {sighting.addressHint && (
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color={colors.textTertiary} />
            <Text
              className="font-montserrat text-xs text-text-tertiary"
              numberOfLines={1}
            >
              {sighting.addressHint}
            </Text>
          </View>
        )}
        <Text className="font-montserrat text-xs text-text-tertiary">
          Avistado em {formatDate(sighting.sightedAt)}
        </Text>
      </View>

      <ChevronRight size={16} color={colors.border} />
    </Pressable>
  );
}
