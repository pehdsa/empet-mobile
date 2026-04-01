import { useState, useEffect } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { MapPin, Clock, ChevronRight, Dog, Cat } from "lucide-react-native";
import { colors } from "@/lib/colors";
import type { PetSpecies } from "@/types/pet";

interface PetListCardProps {
  photoUrl?: string | null;
  species: PetSpecies;
  title: string;
  subtitle: string;
  locationText?: string | null;
  timeText: string;
  onPress?: () => void;
  className?: string;
}

export function PetListCard({
  photoUrl,
  species,
  title,
  subtitle,
  locationText,
  timeText,
  onPress,
  className,
}: PetListCardProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [photoUrl]);

  const showPlaceholder = !photoUrl || imageError;

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-2xl bg-white p-3 shadow-soft active:opacity-80 ${className ?? ""}`}
    >
      {/* Foto */}
      {!showPlaceholder ? (
        <Image
          source={{ uri: photoUrl! }}
          className="h-20 w-20 rounded-xl"
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View className="h-20 w-20 items-center justify-center rounded-xl bg-border/30">
          {species === "DOG" ? (
            <Dog size={32} color={colors.textTertiary} />
          ) : (
            <Cat size={32} color={colors.textTertiary} />
          )}
        </View>
      )}

      {/* Info */}
      <View className="flex-1 gap-1">
        <Text
          className="font-montserrat-bold text-base text-text-primary"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          className="font-montserrat text-[13px] text-text-secondary"
          numberOfLines={1}
        >
          {subtitle}
        </Text>
        {locationText && (
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color={colors.textTertiary} />
            <Text
              className="font-montserrat text-xs text-text-tertiary"
              numberOfLines={1}
            >
              {locationText}
            </Text>
          </View>
        )}
        <View className="flex-row items-center gap-1">
          <Clock size={12} color={colors.textTertiary} />
          <Text className="font-montserrat text-xs text-text-tertiary">
            {timeText}
          </Text>
        </View>
      </View>

      {/* Chevron */}
      <ChevronRight size={20} color={colors.textTertiary} />
    </Pressable>
  );
}
