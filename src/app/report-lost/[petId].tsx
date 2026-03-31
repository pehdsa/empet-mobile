import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
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
import { usePet } from "@/hooks/usePets";
import { useCreatePetReport } from "@/hooks/usePetReports";
import { useLocation } from "@/hooks/useLocation";
import { useToastStore } from "@/stores/toast";
import { mapApiErrors } from "@/utils/map-api-errors";

import { NavHeader } from "@/components/ui/NavHeader";
import { TextInput } from "@/components/ui/TextInput";
import { DateTimePickerField } from "@/components/ui/DateTimePickerField";
import { MapPickerInline } from "@/components/map/MapPickerInline";
import { PetSummaryCard } from "@/components/report-lost/PetSummaryCard";
import { PhoneSection } from "@/components/report-lost/PhoneSection";

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

export default function ReportLostScreen() {
  const { petId: rawPetId } = useLocalSearchParams<{ petId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);

  const petId = parseId(rawPetId);
  const { data: pet, isLoading: petLoading } = usePet(petId);
  const { location } = useLocation();
  const createReport = useCreatePetReport();

  // Coordenadas inicializadas com localizacao do usuario
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const initialRegion = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : undefined;

  const handleRegionChange = useCallback(
    (c: { latitude: number; longitude: number }) => {
      setCoords(c);
    },
    [],
  );

  // Inicializar coords com a localizacao quando disponivel
  if (!coords && location) {
    setCoords({ latitude: location.latitude, longitude: location.longitude });
  }

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ReportLostFormValues>({
    resolver: zodResolver(reportLostSchema),
    defaultValues: {
      addressHint: "",
      description: "",
      lostAt: new Date(),
    },
  });

  const [descLength, setDescLength] = useState(0);

  if (petId === null) {
    showToast("Pet inválido", "error");
    router.back();
    return null;
  }

  const onSubmit = (values: ReportLostFormValues) => {
    if (!coords) {
      showToast("Aguarde a localização carregar", "error");
      return;
    }

    createReport.mutate(
      {
        pet_id: petId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        address_hint: values.addressHint || undefined,
        description: values.description || undefined,
        lost_at: values.lostAt.toISOString(),
      },
      {
        onSuccess: (response) => {
          const reportId = response.data.data.id;
          router.replace({
            pathname: "/report-lost/success" as never,
            params: { reportId: String(reportId), petId: String(petId) },
          });
        },
        onError: (err) => {
          if (err instanceof AxiosError && err.response?.status === 422) {
            const apiErr = err as AxiosError<ValidationError>;
            mapApiErrors(setError, apiErr, {
              address_hint: "addressHint",
              lost_at: "lostAt",
            });
            const petIdError =
              apiErr.response?.data?.errors?.pet_id?.[0];
            if (petIdError) {
              showToast(petIdError, "error");
            }
          } else {
            showToast("Erro ao reportar pet perdido", "error");
          }
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="bg-background">
        <NavHeader title="Reportar Perda" className="px-6" />
      </View>

      {petLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 24, gap: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Pet summary */}
            {pet && (
              <PetSummaryCard pet={pet} subtitle="Local marcado no mapa" />
            )}

            {/* Secao local */}
            <View className="gap-3">
              <Text className="font-montserrat-bold text-base text-text-primary">
                Onde ele se perdeu?
              </Text>

              <MapPickerInline
                initialRegion={initialRegion}
                onRegionChange={handleRegionChange}
              />

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
                    label="O que aconteceu?"
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
            <PhoneSection />

            <View className="h-4" />
          </ScrollView>

          {/* Bottom bar */}
          <View
            className="border-t border-border bg-surface px-6 py-4"
            style={{ paddingBottom: 16 + insets.bottom }}
          >
            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={createReport.isPending}
              className={`h-12 items-center justify-center rounded-xl active:opacity-80 ${
                createReport.isPending ? "opacity-50" : ""
              }`}
              style={{ backgroundColor: "#E53935" }}
            >
              {createReport.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-montserrat-bold text-base text-text-inverse">
                  Reportar como perdido
                </Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
