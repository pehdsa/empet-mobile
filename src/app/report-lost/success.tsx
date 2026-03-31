import { View, Text, Pressable, Image, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";

import { colors } from "@/lib/colors";
import { usePetReportDetail } from "@/hooks/usePetReports";
import { speciesLabel, sizeLabel } from "@/constants/enums";

function parseId(raw: string | string[] | undefined): number | null {
  if (!raw || Array.isArray(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function ReportLostSuccessScreen() {
  const { reportId: rawReportId } = useLocalSearchParams<{
    reportId: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const reportId = parseId(rawReportId);
  const { data: report, isLoading, isError, refetch } = usePetReportDetail(reportId);

  if (reportId === null) {
    router.replace("/(tabs)" as never);
    return null;
  }

  const pet = report?.pet;

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Center content */}
      <View className="flex-1 items-center justify-center gap-5 px-6">
        <View
          className="h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: "#43A047" }}
        >
          <Check size={40} color="#FFFFFF" />
        </View>

        <Text className="font-montserrat-bold text-xl text-text-primary text-center">
          Report criado com sucesso!
        </Text>

        <Text
          className="max-w-[300px] text-center font-montserrat text-sm leading-5 text-text-secondary"
        >
          Estamos procurando pets semelhantes na região. Você será notificado
          quando encontrarmos possíveis matches.
        </Text>

        {/* Pet card */}
        {isLoading && <ActivityIndicator color={colors.primary} />}

        {isError && (
          <Pressable onPress={() => refetch()} className="active:opacity-60">
            <Text className="font-montserrat-medium text-sm text-primary">
              Tentar novamente
            </Text>
          </Pressable>
        )}

        {pet && (
          <View className="w-full flex-row items-center gap-3 rounded-xl border border-border bg-surface p-4">
            {pet.photos?.[0]?.url ? (
              <Image
                source={{ uri: pet.photos[0].url }}
                className="h-16 w-16 rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <View className="h-16 w-16 items-center justify-center rounded-xl bg-background">
                <Text className="font-montserrat-medium text-lg text-text-tertiary">
                  {pet.name.charAt(0)}
                </Text>
              </View>
            )}
            <View className="flex-1 gap-1">
              <Text className="font-montserrat-bold text-base text-text-primary">
                {pet.name}
              </Text>
              <Text className="font-montserrat text-[13px] text-text-secondary">
                {speciesLabel[pet.species]} · {sizeLabel[pet.size]}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Bottom actions */}
      <View className="items-center gap-3 px-6 pb-6 pt-4">
        <Pressable
          onPress={() =>
            router.replace({
              pathname: "/pet-report/[id]" as never,
              params: { id: String(reportId) },
            })
          }
          className="h-[52px] w-full items-center justify-center rounded-[14px] bg-primary active:opacity-80"
        >
          <Text className="font-montserrat-medium text-base text-text-inverse">
            Ver report
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/(tabs)" as never)}
          className="py-1 active:opacity-60"
        >
          <Text className="font-montserrat-medium text-sm text-primary">
            Voltar ao mapa
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
