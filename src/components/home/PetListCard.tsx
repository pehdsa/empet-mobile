import { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { MapPin, Clock, ChevronRight, Dog, Cat } from "lucide-react-native";
import { useRouter } from "expo-router";
import { colors } from "@/lib/colors";
import { speciesLabel, sizeLabel } from "@/constants/enums";
import { formatDistance } from "@/utils/format-distance";
import type { PetReport } from "@/types/pet-report";

interface PetListCardProps {
  report: PetReport;
}

function getDaysAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Perdido hoje";
  if (days === 1) return "Perdido ha 1 dia";
  return `Perdido ha ${days} dias`;
}

export function PetListCard({ report }: PetListCardProps) {
  const router = useRouter();
  const { pet, addressHint, lostAt, distanceMeters } = report;
  const photoUrl = pet.photos?.[0]?.url;
  const [imageError, setImageError] = useState(false);

  const showPlaceholder = !photoUrl || imageError;

  const handlePress = () => {
    router.push({
      pathname: "/pet-report/[id]",
      params: { id: String(report.id) },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center gap-3 rounded-2xl bg-white p-3 shadow-soft active:opacity-80"
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
        <Text
          className="font-montserrat-bold text-base text-text-primary"
          numberOfLines={1}
        >
          {pet.name}
        </Text>
        <Text
          className="font-montserrat text-[13px] text-text-secondary"
          numberOfLines={1}
        >
          {speciesLabel[pet.species]} · {sizeLabel[pet.size]}
          {pet.primaryColor ? ` · ${pet.primaryColor}` : ""}
        </Text>
        {distanceMeters != null && (
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color={colors.textTertiary} />
            <Text
              className="font-montserrat text-xs text-text-tertiary"
              numberOfLines={1}
            >
              {formatDistance(distanceMeters)}
              {addressHint ? ` - ${addressHint}` : ""}
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
