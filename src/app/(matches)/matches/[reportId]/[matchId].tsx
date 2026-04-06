import { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Smile,
  Meh,
  Frown,
  CircleCheck,
  MapPin,
  Dog,
  Cat,
  AlertTriangle,
  User,
} from "lucide-react-native";
import { colors } from "@/lib/colors";
import { useMatches, useConfirmMatch, useDismissMatch } from "@/hooks/useMatches";
import { usePetReportDetail } from "@/hooks/usePetReports";
import { useToastStore } from "@/stores/toast";
import { formatDistance } from "@/utils/format-distance";
import { NavHeader } from "@/components/ui/NavHeader";
import { ComparisonTable } from "@/components/match/ComparisonTable";
import { ConfirmMatchDialog } from "@/components/match/ConfirmMatchDialog";
import { StaticMapPreview } from "@/components/shared/StaticMapPreview";
import type { Characteristic } from "@/types/characteristic";

function parseId(raw: string | string[] | undefined): number | null {
  if (!raw || Array.isArray(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function getScoreConfig(score: number) {
  if (score >= 70)
    return { color: "#43A047", Icon: Smile, label: "Alta compatibilidade" };
  if (score >= 40)
    return { color: "#FFA001", Icon: Meh, label: "Média compatibilidade" };
  return { color: "#E53935", Icon: Frown, label: "Baixa compatibilidade" };
}

export default function MatchDetailScreen() {
  const params = useLocalSearchParams<{ reportId: string; matchId: string }>();
  const reportId = parseId(params.reportId);
  const matchId = parseId(params.matchId);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [petImgErr, setPetImgErr] = useState(false);
  const [sightImgErr, setSightImgErr] = useState(false);

  const reportQuery = usePetReportDetail(reportId);
  const matchesQuery = useMatches(reportId);
  const confirmMut = useConfirmMatch();
  const dismissMut = useDismissMatch();

  const report = reportQuery.data;
  const match = matchesQuery.data?.find((m) => m.id === matchId);

  const isLoading = reportQuery.isLoading || matchesQuery.isLoading;
  const matchNotFound = !isLoading && !match;

  useEffect(() => {
    if (matchNotFound) {
      showToast("Match não encontrado", "error");
      router.back();
    }
  }, [matchNotFound]);

  if (isLoading || !match || !report) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const pet = report.pet;
  const { sighting } = match;
  const isPending = match.status === "PENDING";
  const { color: scoreColor, Icon: ScoreIcon, label: scoreLabel } = getScoreConfig(match.finalScore);

  const petPhoto = pet.photos?.[0]?.url;
  const sightingPhoto = sighting.photos?.[0]?.url;

  // Características em comum
  const petCharIds = new Set(pet.characteristics.map((c: Characteristic) => c.id));
  const commonChars = sighting.characteristics.filter((c: Characteristic) => petCharIds.has(c.id));

  const handleConfirm = () => {
    if (!reportId) return;
    confirmMut.mutate(
      { reportId, matchId: match.id },
      {
        onSuccess: () => {
          setShowConfirmDialog(false);
          showToast("Pet reencontrado! 🎉");
          router.replace({
            pathname: "/(pets)/[id]",
            params: { id: String(pet.id) },
          });
        },
        onError: () => showToast("Erro ao confirmar match", "error"),
      },
    );
  };

  const handleDismiss = () => {
    if (!reportId) return;
    dismissMut.mutate(
      { reportId, matchId: match.id },
      {
        onSuccess: () => router.back(),
        onError: () => showToast("Erro ao descartar match", "error"),
      },
    );
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <NavHeader title="Match Detalhado" className="px-6" />

      <ScrollView className="flex-1">
        {/* Score Section */}
        <View className="items-center gap-2 bg-surface px-6 pb-4 pt-6">
          <View
            className="h-20 w-20 items-center justify-center rounded-full"
            style={{
              backgroundColor: `${scoreColor}20`,
              borderWidth: 3,
              borderColor: scoreColor,
            }}
          >
            <ScoreIcon size={36} color={scoreColor} />
          </View>
          <Text className="font-montserrat-medium text-sm text-text-secondary">
            {scoreLabel}
          </Text>
          <Text className="font-montserrat text-[13px] text-text-tertiary">
            {formatDistance(match.distanceMeters)} de distância
          </Text>
        </View>

        {/* Photo Section */}
        <View className="relative px-6 py-4">
          <View className="flex-row gap-4">
            {/* Seu pet */}
            <View className="flex-1 gap-1">
              <Text className="font-montserrat-medium text-[11px] text-text-tertiary">
                Seu pet
              </Text>
              {petPhoto && !petImgErr ? (
                <Image
                  source={{ uri: petPhoto }}
                  className="h-[140px] rounded-xl"
                  resizeMode="cover"
                  onError={() => setPetImgErr(true)}
                />
              ) : (
                <View className="h-[140px] items-center justify-center rounded-xl bg-border/30">
                  {pet.species === "DOG" ? (
                    <Dog size={36} color={colors.textTertiary} />
                  ) : (
                    <Cat size={36} color={colors.textTertiary} />
                  )}
                </View>
              )}
            </View>
            {/* Match */}
            <View className="flex-1 gap-1">
              <Text className="font-montserrat-medium text-[11px] text-text-tertiary">
                Match
              </Text>
              {sightingPhoto && !sightImgErr ? (
                <Image
                  source={{ uri: sightingPhoto }}
                  className="h-[140px] rounded-xl"
                  resizeMode="cover"
                  onError={() => setSightImgErr(true)}
                />
              ) : (
                <View className="h-[140px] items-center justify-center rounded-xl bg-border/30">
                  {sighting.species === "DOG" ? (
                    <Dog size={36} color={colors.textTertiary} />
                  ) : (
                    <Cat size={36} color={colors.textTertiary} />
                  )}
                </View>
              )}
            </View>
          </View>
          {/* VS badge */}
          <View className="absolute items-center justify-center w-full h-full mx-6 my-4 pt-4">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
              <Text className="font-montserrat-bold text-xs text-white">VS</Text>
            </View>
          </View>
        </View>

        {/* Comparison Table */}
        <View className="px-6 py-4">
          <Text className="mb-3 font-montserrat-bold text-base text-text-primary">
            Comparação
          </Text>
          <ComparisonTable pet={pet} sighting={sighting} />
        </View>

        {/* Characteristics in common */}
        {commonChars.length > 0 && (
          <View className="gap-3 px-6 py-4">
            <Text className="font-montserrat-bold text-base text-text-primary">
              Características em comum
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {commonChars.map((c: Characteristic) => (
                <View
                  key={c.id}
                  className="rounded-xl px-3 py-1.5"
                  style={{ backgroundColor: "#43A04715" }}
                >
                  <Text className="font-montserrat-medium text-xs" style={{ color: "#43A047" }}>
                    {c.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Sighting Author */}
        {sighting.user && (
          <View className="flex-row items-center gap-3 px-6 py-4">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-border/30">
              {sighting.user.avatarUrl ? (
                <Image
                  source={{ uri: sighting.user.avatarUrl }}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <User size={16} color={colors.textTertiary} />
              )}
            </View>
            <View>
              <Text className="font-montserrat text-[11px] text-text-tertiary">
                Avistado por
              </Text>
              <Text className="font-montserrat-medium text-sm text-text-primary">
                {sighting.user.name}
              </Text>
            </View>
          </View>
        )}

        {/* Location */}
        {sighting.location?.latitude != null && sighting.location?.longitude != null && (
        <View className="gap-3 px-6 py-4 pb-8">
          <Text className="font-montserrat-bold text-base text-text-primary">
            Local do avistamento
          </Text>
          <StaticMapPreview
            latitude={sighting.location.latitude}
            longitude={sighting.location.longitude}
            label={sighting.title}
          />
          {sighting.addressHint && (
            <View className="flex-row items-center gap-2">
              <MapPin size={14} color={colors.textTertiary} />
              <Text className="flex-1 font-montserrat text-sm text-text-secondary">
                {sighting.addressHint}
              </Text>
            </View>
          )}
          <View className="flex-row items-center gap-2">
            <MapPin size={14} color={colors.textTertiary} />
            <Text className="font-montserrat text-sm text-text-secondary">
              {formatDistance(match.distanceMeters)} de distância
            </Text>
          </View>
        </View>
        )}
      </ScrollView>

      {/* Sighting deleted banner */}
      {match.isSightingDeleted && (
        <View className="flex-row items-center gap-2 bg-error/10 px-6 py-3">
          <AlertTriangle size={16} color="#E53935" />
          <Text className="font-montserrat-medium text-sm text-error">
            Avistamento removido
          </Text>
        </View>
      )}

      {/* Bottom Bar */}
      {isPending && (
        <View className="border-t border-border bg-surface px-6 pb-8 pt-4">
          <View className="gap-3">
            <Pressable
              onPress={() => setShowConfirmDialog(true)}
              disabled={match.isSightingDeleted}
              className="h-[52px] flex-row items-center justify-center gap-2 rounded-xl active:opacity-80"
              style={{
                backgroundColor: match.isSightingDeleted ? "#43A04760" : "#43A047",
              }}
            >
              <CircleCheck size={20} color="#FFFFFF" />
              <Text className="font-montserrat-semibold text-base text-white">
                É meu pet!
              </Text>
            </Pressable>
            <Pressable
              onPress={handleDismiss}
              disabled={match.isSightingDeleted || dismissMut.isPending}
              className="h-[52px] items-center justify-center rounded-xl border border-border bg-surface active:opacity-80"
              style={{ opacity: match.isSightingDeleted ? 0.5 : 1 }}
            >
              {dismissMut.isPending ? (
                <ActivityIndicator color="#6B6C6D" />
              ) : (
                <Text className="font-montserrat-semibold text-base" style={{ color: "#6B6C6D" }}>
                  Não é meu pet
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      )}

      {/* Confirm dialog */}
      <ConfirmMatchDialog
        visible={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirm}
        loading={confirmMut.isPending}
      />
    </View>
  );
}
