import { useState } from "react";
import { View, ScrollView, ActivityIndicator, Pressable, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, MapPin, CircleAlert, Dog, Cat } from "lucide-react-native";

import { colors } from "@/lib/colors";
import { StaticMapPreview } from "@/components/shared/StaticMapPreview";
import { usePetSightingDetail, useClaimSighting } from "@/hooks/usePetSightings";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import { speciesLabel, sizeLabel, sexLabel } from "@/constants/enums";
import { formatDate } from "@/utils/format-date";
import { relativeTime } from "@/utils/relative-time";

import { NavHeader } from "@/components/ui/NavHeader";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { PhotoCarousel } from "@/components/pet-report/PhotoCarousel";
import { CharacteristicsSection } from "@/components/pet-report/CharacteristicsSection";
import { ClaimContactDialog } from "@/components/sighting/ClaimContactDialog";
import type { SightingOwner } from "@/types/pet-sighting";

function parseId(raw: string | string[] | undefined): number | null {
  if (!raw || Array.isArray(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function PetSightingDetail() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const parsedId = parseId(rawId);
  const {
    data: sighting,
    isLoading,
    isError,
    refetch,
  } = usePetSightingDetail(parsedId);

  const claim = useClaimSighting();
  const showToast = useToastStore((s) => s.show);
  const userId = useAuthStore((s) => s.user?.id);
  const isOwnSighting = sighting?.userId === userId;

  const [contactDialogVisible, setContactDialogVisible] = useState(false);
  const [claimedOwner, setClaimedOwner] = useState<SightingOwner | null>(null);

  if (parsedId === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="font-montserrat text-sm text-text-secondary">
          Avistamento inválido
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-background">
        <NavHeader title="Detalhes do Avistamento" className="px-6" />
      </View>

      {/* Loading */}
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="font-montserrat-medium text-base text-text-primary">
            Erro ao carregar
          </Text>
          <Text className="text-center font-montserrat text-sm text-text-secondary">
            Não foi possível carregar os detalhes do avistamento.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-2 active:opacity-60"
          >
            <Text className="font-montserrat-medium text-sm text-primary">
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      )}

      {sighting && (
        <>
        <ScrollView>
          {/* Photo carousel */}
          <PhotoCarousel
            photos={sighting.photos.map((p) => ({
              id: p.id,
              url: p.url,
              position: p.position,
            }))}
            species={sighting.species}
          />

          {/* Pet info card */}
          <View className="gap-3 rounded-t-2xl bg-surface px-4 py-4">
            {/* Title */}
            <Text className="font-montserrat-bold text-[22px] text-text-primary">
              {sighting.title}
            </Text>

            {/* Badges: species, size, sex */}
            <View className="flex-row flex-wrap gap-2">
              <View className="flex-row items-center gap-1 rounded-full bg-background px-2.5 py-1">
                {sighting.species === "DOG" ? (
                  <Dog size={14} color={colors.textSecondary} />
                ) : (
                  <Cat size={14} color={colors.textSecondary} />
                )}
                <Text className="font-montserrat-medium text-[13px] text-text-secondary">
                  {speciesLabel[sighting.species]}
                </Text>
              </View>

              {sighting.size && (
                <View className="items-center rounded-full bg-background px-2.5 py-1">
                  <Text className="font-montserrat-medium text-[13px] text-text-secondary">
                    {sizeLabel[sighting.size]}
                  </Text>
                </View>
              )}

              {sighting.sex && (
                <View className="items-center rounded-full bg-background px-2.5 py-1">
                  <Text className="font-montserrat-medium text-[13px] text-text-secondary">
                    {sexLabel[sighting.sex]}
                  </Text>
                </View>
              )}
            </View>

            {/* Breed */}
            {sighting.breed && (
              <Text className="font-montserrat text-sm text-text-secondary">
                {sighting.breed.name}
              </Text>
            )}

            {/* Color badge */}
            {sighting.color && (
              <View className="self-start rounded-full bg-background px-2.5 py-1">
                <Text className="font-montserrat-medium text-[13px] text-text-secondary">
                  {sighting.color}
                </Text>
              </View>
            )}
          </View>

          {/* Characteristics */}
          <CharacteristicsSection characteristics={sighting.characteristics} />

          {/* Spacer */}
          <View className="h-2" />

          {/* Sighting info card */}
          <View className="gap-3 bg-surface p-4">
            <Text className="font-montserrat-bold text-base text-text-primary">
              Sobre o avistamento
            </Text>

            {/* Date */}
            <View className="flex-row items-center gap-2">
              <Calendar size={16} color={colors.textTertiary} />
              <View className="gap-0.5">
                <Text className="font-montserrat text-sm text-text-primary">
                  {formatDate(sighting.sightedAt, "dd 'de' MMMM 'de' yyyy, HH:mm")}
                </Text>
                <Text className="font-montserrat text-[13px] text-text-tertiary">
                  {relativeTime(sighting.sightedAt)}
                </Text>
              </View>
            </View>

            {/* Location */}
            {sighting.addressHint && (
              <View className="flex-row items-center gap-2">
                <MapPin size={16} color={colors.textTertiary} />
                <Text className="font-montserrat text-sm text-text-primary">
                  {sighting.addressHint}
                </Text>
              </View>
            )}

            {/* Description */}
            {sighting.description && (
              <Text className="font-montserrat text-sm leading-5 text-text-secondary">
                {sighting.description}
              </Text>
            )}

            {/* Static map preview — não usa MKMapView (RNGH #2688) */}
            <StaticMapPreview
              latitude={sighting.location.latitude}
              longitude={sighting.location.longitude}
            />
          </View>

          {/* Spacer */}
          <View className="h-2" />

          {/* Notes card */}
          {sighting.description && (
            <View className="gap-2 bg-surface p-4 border-t border-border">
              <View className="flex-row items-center gap-2">
                <CircleAlert size={16} color="#FFA001" />
                <Text className="font-montserrat-bold text-base text-text-primary">
                  Observações do avistador
                </Text>
              </View>
              <Text className="font-montserrat text-sm leading-5 text-text-secondary">
                {sighting.description}
              </Text>
            </View>
          )}

          {/* Bottom spacer */}
          <View className="h-4" />
        </ScrollView>

        {/* Bottom bar */}
        {sighting && !isOwnSighting && (
          <View
            className="border-t border-border bg-surface px-4 py-3"
            style={{ paddingBottom: 12 + insets.bottom }}
          >
            <ButtonPrimary
              label="É meu pet!"
              loading={claim.isPending}
              onPress={() => {
                if (!sighting?.id) return;
                claim.mutate(sighting.id, {
                  onSuccess: (data) => {
                    setClaimedOwner(data.sightingOwner);
                    setContactDialogVisible(true);
                  },
                  onError: (error) => {
                    if (error.response?.status === 403) {
                      showToast(
                        "Você não pode clamar seu próprio avistamento",
                        "error",
                      );
                      return;
                    }
                    if (error.response?.status === 404) {
                      showToast("Avistamento não encontrado", "error");
                      return;
                    }
                    showToast("Erro ao clamar avistamento", "error");
                  },
                });
              }}
            />
          </View>
        )}

        <ClaimContactDialog
          visible={contactDialogVisible}
          onClose={() => {
            setContactDialogVisible(false);
            setClaimedOwner(null);
          }}
          owner={claimedOwner}
        />
      </>
      )}
    </View>
  );
}
