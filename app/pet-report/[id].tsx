import { View, ScrollView, ActivityIndicator, Pressable, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/lib/colors";
import { usePetReportDetail } from "@/hooks/usePetReports";
import { NavHeader } from "@/components/ui/NavHeader";
import { PhotoCarousel } from "@/components/pet-report/PhotoCarousel";
import { PetInfoSection } from "@/components/pet-report/PetInfoSection";
import { CharacteristicsSection } from "@/components/pet-report/CharacteristicsSection";
import { ReportInfoSection } from "@/components/pet-report/ReportInfoSection";
import { NotesCard } from "@/components/pet-report/NotesCard";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";

function parseId(raw: string | string[] | undefined): number | null {
  if (!raw || Array.isArray(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function PetReportDetail() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const parsedId = parseId(rawId);
  const { data: report, isLoading, isError, refetch } = usePetReportDetail(parsedId);


  if (parsedId === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="font-montserrat text-sm text-text-secondary">
          Report invalido
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-background">
        <NavHeader title="Detalhes do Report" className="px-6" />
      </View>

      {/* Content */}
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}

      {isError && !isLoading && (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="font-montserrat-medium text-base text-text-primary">
            Erro ao carregar
          </Text>
          <Text className="text-center font-montserrat text-sm text-text-secondary">
            Nao foi possivel carregar os detalhes do report.
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

      {report && (
        <>
          <ScrollView>
            {/* Photo carousel */}
            <PhotoCarousel photos={report.pet.photos} species={report.pet.species} />

            {/* Pet info */}
            <PetInfoSection pet={report.pet} status={report.status} />

            {/* Characteristics */}
            <CharacteristicsSection characteristics={report.pet.characteristics} />

            {/* Spacer */}
            <View className="h-2" />

            {/* Report info */}
            <ReportInfoSection report={report} />

            {/* Spacer */}
            <View className="h-2" />

            {/* Notes */}
            {report.pet.notes && (
              <NotesCard notes={report.pet.notes} />
            )}

            {/* Bottom spacer */}
            <View className="h-4" />
          </ScrollView>

          {/* Bottom bar */}
          <View
            className="border-t border-border bg-surface px-4 py-3"
            style={{ paddingBottom: 12 + insets.bottom }}
          >
            <ButtonPrimary
              label="Vi esse pet!"
              onPress={() =>
                router.push(`/sighting/new?reportId=${parsedId}` as never)
              }
            />
          </View>
        </>
      )}
    </View>
  );
}
