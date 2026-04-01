import { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import {
  Smile,
  Meh,
  Frown,
  ChevronRight,
  Dog,
  Cat,
  AlertTriangle,
} from "lucide-react-native";
import { colors } from "@/lib/colors";
import { speciesLabel, sizeLabel } from "@/constants/enums";
import { formatDistance } from "@/utils/format-distance";
import type { PetMatch } from "@/types/match";
import type { Pet } from "@/types/pet";
import type { Characteristic } from "@/types/characteristic";

interface MatchCardProps {
  match: PetMatch;
  pet: Pet;
  onConfirm: () => void;
  onDismiss: () => void;
  onPress: () => void;
}

function getScoreConfig(score: number) {
  if (score >= 70) return { color: "#43A047", Icon: Smile };
  if (score >= 40) return { color: "#FFA001", Icon: Meh };
  return { color: "#E53935", Icon: Frown };
}

function computeChips(
  petChars: Characteristic[],
  sightingChars: Characteristic[],
) {
  const petIds = new Set(petChars.map((c) => c.id));
  const common: Characteristic[] = [];
  const divergent: Characteristic[] = [];
  for (const c of sightingChars) {
    if (petIds.has(c.id)) common.push(c);
    else divergent.push(c);
  }
  return { common, divergent };
}

export function MatchCard({
  match,
  pet,
  onConfirm,
  onDismiss,
  onPress,
}: MatchCardProps) {
  const { color: scoreColor, Icon: ScoreIcon } = getScoreConfig(match.score);
  const { sighting } = match;
  const isPending = match.status === "PENDING";

  const petPhoto = pet.photos?.[0]?.url;
  const sightingPhoto = sighting.photos?.[0]?.url;
  const [petImgErr, setPetImgErr] = useState(false);
  const [sightImgErr, setSightImgErr] = useState(false);

  const { common, divergent } = computeChips(
    pet.characteristics,
    sighting.characteristics,
  );

  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl bg-surface p-4 shadow-soft active:opacity-80"
    >
      {/* Top row: score + distance + chevron */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: scoreColor }}
          >
            <ScoreIcon size={22} color="#FFFFFF" />
          </View>
          <Text className="font-montserrat text-[13px] text-text-secondary">
            {formatDistance(match.distanceMeters)} de distância
          </Text>
        </View>
        <ChevronRight size={20} color="#9B9C9D" />
      </View>

      {/* Photo row */}
      <View className="mt-3 flex-row gap-3">
        <View className="flex-1 gap-1">
          <Text className="font-montserrat-medium text-[11px] text-text-tertiary">
            Seu pet
          </Text>
          {petPhoto && !petImgErr ? (
            <Image
              source={{ uri: petPhoto }}
              className="h-[120px] rounded-xl"
              resizeMode="cover"
              onError={() => setPetImgErr(true)}
            />
          ) : (
            <View className="h-[120px] items-center justify-center rounded-xl bg-border/30">
              {pet.species === "DOG" ? (
                <Dog size={32} color={colors.textTertiary} />
              ) : (
                <Cat size={32} color={colors.textTertiary} />
              )}
            </View>
          )}
        </View>
        <View className="flex-1 gap-1">
          <Text className="font-montserrat-medium text-[11px] text-text-tertiary">
            Match
          </Text>
          {sightingPhoto && !sightImgErr ? (
            <Image
              source={{ uri: sightingPhoto }}
              className="h-[120px] rounded-xl"
              resizeMode="cover"
              onError={() => setSightImgErr(true)}
            />
          ) : (
            <View className="h-[120px] items-center justify-center rounded-xl bg-border/30">
              {sighting.species === "DOG" ? (
                <Dog size={32} color={colors.textTertiary} />
              ) : (
                <Cat size={32} color={colors.textTertiary} />
              )}
            </View>
          )}
        </View>
      </View>

      {/* Pet info */}
      <View className="mt-3 gap-0.5">
        <Text className="font-montserrat-bold text-base text-text-primary" numberOfLines={1}>
          {sighting.title}
        </Text>
        <Text className="font-montserrat text-[13px] text-text-secondary" numberOfLines={1}>
          {speciesLabel[sighting.species]} · {sighting.size ? sizeLabel[sighting.size] : "—"}
          {sighting.breed ? ` · ${sighting.breed.name}` : ""}
        </Text>
      </View>

      {/* Chips: common + divergent */}
      {(common.length > 0 || divergent.length > 0) && (
        <View className="mt-3 flex-row flex-wrap gap-1.5">
          {common.map((c) => (
            <View key={c.id} className="rounded-xl px-2.5 py-1" style={{ backgroundColor: "#43A04715" }}>
              <Text className="font-montserrat-medium text-[11px]" style={{ color: "#43A047" }}>
                {c.name}
              </Text>
            </View>
          ))}
          {divergent.map((c) => (
            <View key={c.id} className="rounded-xl bg-background px-2.5 py-1">
              <Text className="font-montserrat text-[11px] text-text-tertiary">
                {c.name}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Sighting deleted banner */}
      {match.isSightingDeleted && (
        <View className="mt-3 flex-row items-center gap-2 rounded-lg bg-error/10 px-3 py-2">
          <AlertTriangle size={14} color="#E53935" />
          <Text className="font-montserrat-medium text-xs text-error">
            Avistamento removido
          </Text>
        </View>
      )}

      {/* Buttons */}
      {isPending && (
        <View className="mt-3 flex-row gap-3">
          <Pressable
            onPress={onConfirm}
            disabled={match.isSightingDeleted}
            className="h-10 flex-1 items-center justify-center rounded-[10px] active:opacity-80"
            style={{
              backgroundColor: match.isSightingDeleted ? "#43A04760" : "#43A047",
            }}
          >
            <Text className="font-montserrat-bold text-sm text-white">
              É meu pet!
            </Text>
          </Pressable>
          <Pressable
            onPress={onDismiss}
            disabled={match.isSightingDeleted}
            className="h-10 flex-1 items-center justify-center rounded-[10px] border border-border bg-surface active:opacity-80"
            style={{ opacity: match.isSightingDeleted ? 0.5 : 1 }}
          >
            <Text className="font-montserrat-medium text-sm" style={{ color: "#E53935" }}>
              Não é
            </Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}
