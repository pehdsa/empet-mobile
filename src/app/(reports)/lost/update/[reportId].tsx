import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";

import { colors } from "@/lib/colors";
import { usePetReportDetail, useUpdatePetReport } from "@/hooks/usePetReports";
import { useToastStore } from "@/stores/toast";
import { mapApiErrors } from "@/utils/map-api-errors";
import { speciesLabel, sizeLabel } from "@/constants/enums";

import { NavHeader } from "@/components/ui/NavHeader";
import { TextInput } from "@/components/ui/TextInput";
import { DateTimePickerField } from "@/components/ui/DateTimePickerField";
import { MapPickerInline } from "@/components/map/MapPickerInline";
import { PhoneSection } from "@/components/shared/phone/PhoneSection";

import {
  reportLostSchema,
  type ReportLostFormValues,
} from "@/features/report-lost/schemas/report-lost.schema";
import type { ValidationError } from "@/types/api";

function parseId(raw: string | string[] | undefined): number | null {
  if (!raw || Array.isArray(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function UpdateReportScreen() {
  const { reportId: rawReportId } = useLocalSearchParams<{
    reportId: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);

  const reportId = parseId(rawReportId);
  const {
    data: report,
    isLoading,
    isError,
    refetch,
  } = usePetReportDetail(reportId);
  const updateReport = useUpdatePetReport();

  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ReportLostFormValues>({
    resolver: zodResolver(reportLostSchema),
    defaultValues: {
      addressHint: "",
      description: "",
      lostAt: new Date(),
    },
  });

  // Pre-preencher form quando report carrega
  useEffect(() => {
    if (report) {
      reset({
        addressHint: report.addressHint ?? "",
        description: report.description ?? "",
        lostAt: new Date(report.lostAt),
      });
      if (!coords) {
        setCoords({
          latitude: report.location.latitude,
          longitude: report.location.longitude,
        });
      }
    }
  }, [report]);

  const handleRegionChange = useCallback(
    (c: { latitude: number; longitude: number }) => {
      setCoords(c);
    },
    [],
  );

  const [descLength, setDescLength] = useState(0);

  if (reportId === null) {
    showToast("Report inválido", "error");
    router.back();
    return null;
  }

  const pet = report?.pet;

  const initialRegion = report
    ? {
        latitude: report.location.latitude,
        longitude: report.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : undefined;

  const onSubmit = (values: ReportLostFormValues) => {
    if (!coords) return;

    updateReport.mutate(
      {
        id: reportId,
        data: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          address_hint: values.addressHint || undefined,
          description: values.description || undefined,
          lost_at: values.lostAt.toISOString(),
        },
      },
      {
        onSuccess: () => {
          showToast("Report atualizado!");
          router.back();
        },
        onError: (err) => {
          if (err instanceof AxiosError && err.response?.status === 422) {
            const unhandled = mapApiErrors(setError, err as AxiosError<ValidationError>, {
              address_hint: "addressHint",
              lost_at: "lostAt",
            });
            if (unhandled.length > 0) showToast(unhandled[0], "error");
          } else {
            showToast("Erro ao atualizar report", "error");
          }
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="bg-background">
        <NavHeader title="Atualizar Report" className="px-6" />
      </View>

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
          <Pressable onPress={() => refetch()} className="mt-2 active:opacity-60">
            <Text className="font-montserrat-medium text-sm text-primary">
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      )}

      {report && (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 24, gap: 20 }}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={scrollEnabled}
          >
            {/* Pet summary card (read-only) */}
            {pet && (
              <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3">
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
                <View className="flex-1 gap-0.5">
                  <Text className="font-montserrat-bold text-base text-text-primary">
                    {pet.name}
                  </Text>
                  <Text className="font-montserrat text-[13px] text-text-secondary">
                    {speciesLabel[pet.species]} · {sizeLabel[pet.size]}
                  </Text>
                  {pet.breed && (
                    <Text className="font-montserrat text-xs text-text-tertiary">
                      {pet.breed.name}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Local */}
            <View className="gap-3">
              <Text className="font-montserrat-bold text-base text-text-primary">
                Última localização conhecida
              </Text>

              {initialRegion && (
                <MapPickerInline
                  initialRegion={initialRegion}
                  onRegionChange={handleRegionChange}
                  onTouchStart={() => setScrollEnabled(false)}
                  onTouchEnd={() => setScrollEnabled(true)}
                />
              )}

              <Controller
                control={control}
                name="addressHint"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Referência do local"
                    placeholder="Ex: Perto da praça central"
                    value={value}
                    onChangeText={onChange}
                    error={errors.addressHint?.message}
                  />
                )}
              />
            </View>

            {/* Data */}
            <Controller
              control={control}
              name="lostAt"
              render={({ field: { onChange, value } }) => (
                <DateTimePickerField
                  label="Quando ele se perdeu? *"
                  value={value}
                  onChange={onChange}
                  maximumDate={new Date()}
                  error={errors.lostAt?.message}
                />
              )}
            />

            {/* Descricao */}
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <View className="gap-1.5">
                  <TextInput
                    label="Atualize a descrição"
                    placeholder="Descreva as circunstâncias: como ele fugiu, última vez que foi visto, etc."
                    value={value}
                    onChangeText={(text) => {
                      onChange(text);
                      setDescLength(text.length);
                    }}
                    multiline
                    maxLength={2000}
                    error={errors.description?.message}
                  />
                  <Text className="text-right font-montserrat text-xs text-text-tertiary">
                    {descLength}/2000
                  </Text>
                </View>
              )}
            />

            {/* Telefones */}
            <View className="gap-3">
              <Text className="font-montserrat-medium text-sm text-text-primary">
                Telefones para contato
              </Text>
              <PhoneSection />
            </View>

            <View className="h-4" />
          </ScrollView>

          {/* Bottom bar */}
          <View
            className="border-t border-border bg-surface px-6 py-4"
            style={{ paddingBottom: 16 + insets.bottom }}
          >
            <Pressable
              onPress={handleSubmit(onSubmit, () => showToast("Preencha os campos obrigatórios", "error"))}
              disabled={updateReport.isPending}
              className={`h-12 items-center justify-center rounded-xl bg-primary active:opacity-80 ${
                updateReport.isPending ? "opacity-50" : ""
              }`}
            >
              {updateReport.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-montserrat-bold text-base text-text-inverse">
                  Salvar alterações
                </Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
