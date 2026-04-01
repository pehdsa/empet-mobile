import { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { MapPin, Clock, Dog, Cat } from "lucide-react-native";
import { colors } from "@/lib/colors";
import type { PetSpecies } from "@/types/pet";

interface PetGridCardProps {
  photoUrl?: string | null;
  species: PetSpecies;
  title: string;
  subtitle: string;
  locationText?: string | null;
  timeText: string;
  onPress?: () => void;
  width?: number;
}

export function PetGridCard({
  photoUrl,
  species,
  title,
  subtitle,
  locationText,
  timeText,
  onPress,
  width,
}: PetGridCardProps) {
  const [imageError, setImageError] = useState(false);
  const showPlaceholder = !photoUrl || imageError;

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft active:opacity-80"
      style={width ? { width } : undefined}
    >
      {/* Foto */}
      {!showPlaceholder ? (
        <Image
          source={{ uri: photoUrl! }}
          className="h-[140px] w-full"
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View className="h-[140px] w-full items-center justify-center bg-border/30">
          {species === "DOG" ? (
            <Dog size={40} color={colors.textTertiary} />
          ) : (
            <Cat size={40} color={colors.textTertiary} />
          )}
        </View>
      )}

      {/* Info */}
      <View className="gap-1 px-3 pb-3 pt-2">
        <Text
          className="font-montserrat-bold text-sm text-text-primary"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          className="font-montserrat text-xs text-text-secondary"
          numberOfLines={1}
        >
          {subtitle}
        </Text>
        {locationText && (
          <View className="flex-row items-center gap-1">
            <MapPin size={11} color={colors.textTertiary} />
            <Text
              className="flex-1 font-montserrat text-[11px] text-text-tertiary"
              numberOfLines={1}
            >
              {locationText}
            </Text>
          </View>
        )}
        <View className="flex-row items-center gap-1">
          <Clock size={11} color={colors.textTertiary} />
          <Text className="font-montserrat text-[11px] text-text-tertiary">
            {timeText}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
