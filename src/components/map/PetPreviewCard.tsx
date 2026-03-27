import { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { MapPin, Clock, ChevronRight, Dog, Cat } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { speciesLabel, sizeLabel } from "@/constants/enums";
import type { PetReport } from "@/types/pet-report";

interface PetPreviewCardProps {
  report: PetReport;
  onPress: () => void;
}

function getDaysAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Perdido hoje";
  if (days === 1) return "Perdido ha 1 dia";
  return `Perdido ha ${days} dias`;
}

export function PetPreviewCard({ report, onPress }: PetPreviewCardProps) {
  const { pet, addressHint, lostAt } = report;
  const photoUrl = pet.photos?.[0]?.url;
  const [imageError, setImageError] = useState(false);

  const showPlaceholder = !photoUrl || imageError;

  return (
    <Pressable
      onPress={onPress}
      className="mx-4 flex-row items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm active:opacity-80"
    >
      {/* Foto */}
      {!showPlaceholder ? (
        <Image
          source={{ uri: photoUrl }}
          className="h-20 w-20 rounded-xl"
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View className="h-20 w-20 items-center justify-center rounded-xl bg-border/30">
          {pet.species === "DOG" ? (
            <Dog size={32} color={colors.textTertiary} />
          ) : (
            <Cat size={32} color={colors.textTertiary} />
          )}
        </View>
      )}

      {/* Info */}
      <View className="flex-1 gap-1">
        <Text className="font-montserrat-semibold text-base text-text-primary" numberOfLines={1}>
          {pet.name}
        </Text>
        <Text className="font-montserrat text-sm text-text-secondary" numberOfLines={1}>
          {speciesLabel[pet.species]} · {sizeLabel[pet.size]}
        </Text>
        {pet.primaryColor && (
          <View className="self-start rounded-full bg-primary/10 px-2.5 py-0.5">
            <Text className="font-montserrat-medium text-xs text-primary">
              {pet.primaryColor}
            </Text>
          </View>
        )}
        {addressHint && (
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color={colors.textTertiary} />
            <Text className="font-montserrat text-xs text-text-tertiary" numberOfLines={1}>
              {addressHint}
            </Text>
          </View>
        )}
        <View className="flex-row items-center gap-1">
          <Clock size={12} color={colors.textTertiary} />
          <Text className="font-montserrat text-xs text-text-tertiary">
            {getDaysAgo(lostAt)}
          </Text>
        </View>
      </View>

      {/* Chevron */}
      <ChevronRight size={20} color={colors.textTertiary} />
    </Pressable>
  );
}
