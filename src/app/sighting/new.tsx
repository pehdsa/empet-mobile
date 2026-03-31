import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { MessageCircle } from "lucide-react-native";

import { colors } from "@/lib/colors";
import { usePetReportDetail, useCreateSighting } from "@/hooks/usePetReports";
import { useLocation } from "@/hooks/useLocation";
import { useToastStore } from "@/stores/toast";
import { mapApiErrors } from "@/utils/map-api-errors";

import { NavHeader } from "@/components/ui/NavHeader";
import { TextInput } from "@/components/ui/TextInput";
import { DateTimePickerField } from "@/components/ui/DateTimePickerField";
import { MapPickerInline } from "@/components/map/MapPickerInline";
import { ReportPetCard } from "@/components/sighting/ReportPetCard";

import {
  sightingSchema,
  type SightingFormValues,
} from "@/features/sighting/schemas/sighting.schema";
import type { ValidationError } from "@/types/api";

function parseId(raw: string | string[] | undefined): number | null {
  if (!raw || Array.isArray(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function NewSightingScreen() {
  const { reportId: rawReportId } = useLocalSearchParams<{
    reportId: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);

  const reportId = parseId(rawReportId);
  const { data: report, isLoading: reportLoading } =
    usePetReportDetail(reportId);
  const { location } = useLocation();
  const createSighting = useCreateSighting();

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

  if (!coords && location) {
    setCoords({ latitude: location.latitude, longitude: location.longitude });
  }

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SightingFormValues>({
    resolver: zodResolver(sightingSchema),
    defaultValues: {
      addressHint: "",
      description: "",
      sightedAt: new Date(),
      sharePhone: false,
    },
  });

  const [descLength, setDescLength] = useState(0);

  if (reportId === null) {
    showToast("Report inválido", "error");
    router.back();
    return null;
  }

  const onSubmit = (values: SightingFormValues) => {
    if (!coords) {
      showToast("Aguarde a localização carregar", "error");
      return;
    }

    createSighting.mutate(
      {
        reportId,
        data: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          address_hint: values.addressHint || undefined,
          description: values.description || undefined,
          sighted_at: values.sightedAt.toISOString(),
          share_phone: values.sharePhone,
        },
      },
      {
        onSuccess: () => {
          router.replace({
            pathname: "/sighting/success" as never,
            params: { reportId: String(reportId) },
          });
        },
        onError: (err) => {
          if (err instanceof AxiosError && err.response?.status === 422) {
            mapApiErrors(setError, err as AxiosError<ValidationError>, {
              address_hint: "addressHint",
              sighted_at: "sightedAt",
              share_phone: "sharePhone",
            });
          } else {
            showToast("Erro ao reportar avistamento", "error");
          }
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="bg-background">
        <NavHeader title="Reportar avistamento" className="px-6" />
      </View>

      {reportLoading ? (
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
            {/* Pet card */}
            {report?.pet && <ReportPetCard pet={report.pet} />}

            {/* Mapa */}
            <View className="gap-3">
              <Text className="font-montserrat-bold text-base text-text-primary">
                Onde você viu o pet?
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
              name="sightedAt"
              render={({ field: { onChange, value } }) => (
                <DateTimePickerField
                  label="Quando você viu? *"
                  value={value}
                  onChange={onChange}
                  maximumDate={new Date()}
                  error={errors.sightedAt?.message}
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
                    label="Descrição"
                    placeholder="Descreva o que viu: estado do pet, direção que seguia, etc."
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

            {/* Share phone */}
            <Controller
              control={control}
              name="sharePhone"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface p-4">
                  <View className="flex-row items-center gap-2">
                    <MessageCircle size={18} color="#25D366" />
                    <Text className="font-montserrat-medium text-sm text-text-primary">
                      Compartilhar meu telefone
                    </Text>
                  </View>
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: "#E2E2E2", true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              )}
            />

            <View className="h-4" />
          </ScrollView>

          {/* Bottom bar */}
          <View
            className="border-t border-border bg-surface px-6 py-4"
            style={{ paddingBottom: 16 + insets.bottom }}
          >
            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={createSighting.isPending}
              className={`h-12 items-center justify-center rounded-xl bg-primary active:opacity-80 ${
                createSighting.isPending ? "opacity-50" : ""
              }`}
            >
              {createSighting.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-montserrat-bold text-base text-text-inverse">
                  Reportar avistamento
                </Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
