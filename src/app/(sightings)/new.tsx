import { useState, useCallback, useEffect } from "react";
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
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";

import { colors } from "@/lib/colors";
import { useCreatePetSighting } from "@/hooks/usePetSightings";
import { useUserPhones } from "@/hooks/usePhones";
import { useBreeds } from "@/hooks/useBreeds";
import { useLocation } from "@/hooks/useLocation";
import { useToastStore } from "@/stores/toast";
import { mapApiErrors } from "@/utils/map-api-errors";

import { NavHeader } from "@/components/ui/NavHeader";
import { TextInput } from "@/components/ui/TextInput";
import { SelectField } from "@/components/ui/SelectField";
import { ToggleButton } from "@/components/ui/ToggleButton";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { DateTimePickerField } from "@/components/ui/DateTimePickerField";
import { MapPickerInline } from "@/components/map/MapPickerInline";
import { PhotoUploader } from "@/components/pet/PhotoUploader";
import { CharacteristicsPicker } from "@/components/pet/CharacteristicsPicker";
import { PhoneSection } from "@/components/shared/phone/PhoneSection";

import {
  petSightingSchema,
  type PetSightingFormValues,
  MAX_SIGHTING_PHOTOS,
} from "@/features/pet-sighting/schemas/pet-sighting.schema";
import { buildPetSightingFormData } from "@/features/pet-sighting/utils/build-pet-sighting-form-data";
import type { ValidationError } from "@/types/api";
import type { PetSpecies, PetSize, PetSex } from "@/types/pet";
import { speciesLabel, sizeLabel, sexLabel } from "@/constants/enums";

const SPECIES_OPTIONS: PetSpecies[] = ["DOG", "CAT"];
const SIZE_OPTIONS: PetSize[] = ["SMALL", "MEDIUM", "LARGE"];
const SEX_OPTIONS: PetSex[] = ["MALE", "FEMALE", "UNKNOWN"];

export default function NewPetSightingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);

  const { location } = useLocation();
  const createSighting = useCreatePetSighting();
  const { data: phones } = useUserPhones();

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<PetSightingFormValues>({
    resolver: zodResolver(petSightingSchema),
    defaultValues: {
      title: "",
      sightedAt: new Date(),
      species: undefined as unknown as "DOG" | "CAT",
      size: null,
      sex: null,
      color: "",
      breedId: null,
      addressHint: "",
      description: "",
      sharePhone: false,
      characteristicIds: [],
      photos: [],
      latitude: undefined as unknown as number,
      longitude: undefined as unknown as number,
    },
  });

  const watchedSpecies = useWatch({ control, name: "species" });
  const watchedBreedId = useWatch({ control, name: "breedId" });
  const { data: breeds } = useBreeds(watchedSpecies);

  const [breedModalVisible, setBreedModalVisible] = useState(false);
  const [breedSearch, setBreedSearch] = useState("");
  const [descLength, setDescLength] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // Reset breed quando species muda
  useEffect(() => {
    if (watchedSpecies) {
      setValue("breedId", null);
    }
  }, [watchedSpecies, setValue]);

  // Inicializar coords com localizacao do usuario
  const [coordsInitialized, setCoordsInitialized] = useState(false);
  useEffect(() => {
    if (!coordsInitialized && location) {
      setCoordsInitialized(true);
      setValue("latitude", location.latitude);
      setValue("longitude", location.longitude);
    }
  }, [coordsInitialized, location, setValue]);

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
      setValue("latitude", c.latitude);
      setValue("longitude", c.longitude);
    },
    [setValue],
  );

  const selectedBreedName = breeds?.find((b) => b.id === watchedBreedId)?.name;

  const onSubmit = (values: PetSightingFormValues) => {
    // Validar que tem telefone se sharePhone
    if (values.sharePhone && (!phones || phones.length === 0)) {
      showToast("Adicione ao menos um telefone antes de compartilhar", "error");
      return;
    }

    const formData = buildPetSightingFormData(values);

    createSighting.mutate(formData, {
      onSuccess: (response) => {
        const id = response.data.data.id;
        router.replace({
          pathname: "/(sightings)/success" as never,
          params: { id: String(id) },
        });
      },
      onError: (err) => {
        if (err instanceof AxiosError && err.response?.status === 422) {
          const unhandled = mapApiErrors(setError, err as AxiosError<ValidationError>, {
            sighted_at: "sightedAt",
            breed_id: "breedId",
            address_hint: "addressHint",
            share_phone: "sharePhone",
            characteristic_ids: "characteristicIds",
          });
          if (unhandled.length > 0) showToast(unhandled[0], "error");
        } else {
          showToast("Erro ao registrar avistamento", "error");
        }
      },
    });
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="bg-background">
        <NavHeader title="Registrar avistamento" className="px-6" />
      </View>

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
          {/* Fotos */}
          <Controller
            control={control}
            name="photos"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View className="gap-1.5">
                <Text className="font-montserrat-medium text-[13px] text-text-secondary">
                  Fotos
                </Text>
                <PhotoUploader
                  photos={value}
                  onChange={onChange}
                  maxPhotos={MAX_SIGHTING_PHOTOS}
                />
                {error && (
                  <Text className="font-montserrat text-xs text-error">
                    {error.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Titulo */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <TextInput
                label="Título *"
                placeholder="Ex: Cachorro caramelo visto na Praça"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
              />
            )}
          />

          {/* Data/hora */}
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

          {/* Localizacao */}
          <View className="gap-3">
            <Text className="font-montserrat-bold text-base text-text-primary">
              Onde você viu o pet?
            </Text>

            <MapPickerInline
              initialRegion={initialRegion}
              onRegionChange={handleRegionChange}
              onTouchStart={() => setScrollEnabled(false)}
              onTouchEnd={() => setScrollEnabled(true)}
            />

            <Controller
              control={control}
              name="addressHint"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Referência do local"
                  placeholder="Ex: Perto da praça central"
                  value={value ?? ""}
                  onChangeText={onChange}
                  error={errors.addressHint?.message}
                />
              )}
            />
          </View>

          {/* Especie */}
          <Controller
            control={control}
            name="species"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View className="gap-2">
                <Text className="font-montserrat-medium text-[13px] text-text-secondary">
                  Espécie *
                </Text>
                <View className="flex-row gap-2">
                  {SPECIES_OPTIONS.map((sp) => (
                    <ToggleButton
                      key={sp}
                      label={speciesLabel[sp]}
                      active={value === sp}
                      onPress={() => onChange(sp)}
                    />
                  ))}
                </View>
                {error && (
                  <Text className="font-montserrat text-xs text-error">
                    {error.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Porte */}
          <Controller
            control={control}
            name="size"
            render={({ field: { value, onChange } }) => (
              <View className="gap-2">
                <Text className="font-montserrat-medium text-[13px] text-text-secondary">
                  Porte
                </Text>
                <View className="flex-row gap-2">
                  {SIZE_OPTIONS.map((sz) => (
                    <ToggleButton
                      key={sz}
                      label={sizeLabel[sz]}
                      active={value === sz}
                      onPress={() => onChange(value === sz ? null : sz)}
                    />
                  ))}
                </View>
              </View>
            )}
          />

          {/* Sexo */}
          <Controller
            control={control}
            name="sex"
            render={({ field: { value, onChange } }) => (
              <View className="gap-2">
                <Text className="font-montserrat-medium text-[13px] text-text-secondary">
                  Sexo
                </Text>
                <View className="flex-row gap-2">
                  {SEX_OPTIONS.map((sx) => (
                    <ToggleButton
                      key={sx}
                      label={sexLabel[sx]}
                      active={value === sx}
                      onPress={() => onChange(value === sx ? null : sx)}
                    />
                  ))}
                </View>
              </View>
            )}
          />

          {/* Cor */}
          <Controller
            control={control}
            name="color"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <TextInput
                label="Cor predominante"
                placeholder="Ex: Caramelo, Preto..."
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
              />
            )}
          />

          {/* Raca */}
          <Controller
            control={control}
            name="breedId"
            render={({ fieldState: { error } }) => (
              <>
                <SelectField
                  label="Raça"
                  value={selectedBreedName}
                  placeholder="Selecionar raça"
                  error={error?.message}
                  onPress={watchedSpecies ? () => setBreedModalVisible(true) : undefined}
                  className={!watchedSpecies ? "opacity-50" : ""}
                />
                <BottomSheetModal
                  visible={breedModalVisible}
                  onClose={() => setBreedModalVisible(false)}
                  title="Selecionar raça"
                  searchable
                  searchPlaceholder="Buscar raça..."
                  onSearchChange={setBreedSearch}
                >
                  <ScrollView className="max-h-72">
                    <Pressable
                      onPress={() => {
                        setValue("breedId", null);
                        setBreedModalVisible(false);
                      }}
                      className="border-b border-border px-2 py-3 active:opacity-60"
                    >
                      <Text className="font-montserrat text-[15px] text-text-tertiary">
                        Nenhuma
                      </Text>
                    </Pressable>
                    {breeds
                      ?.filter((b) =>
                        b.name.toLowerCase().includes(breedSearch.toLowerCase()),
                      )
                      .map((breed) => (
                        <Pressable
                          key={breed.id}
                          onPress={() => {
                            setValue("breedId", breed.id);
                            setBreedModalVisible(false);
                          }}
                          className="border-b border-border px-2 py-3 active:opacity-60"
                        >
                          <Text
                            className={`font-montserrat text-[15px] ${
                              breed.id === watchedBreedId
                                ? "font-montserrat-medium text-primary"
                                : "text-text-primary"
                            }`}
                          >
                            {breed.name}
                          </Text>
                        </Pressable>
                      ))}
                  </ScrollView>
                </BottomSheetModal>
              </>
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
                  value={value ?? ""}
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

          {/* Caracteristicas */}
          <Controller
            control={control}
            name="characteristicIds"
            render={({ field: { value, onChange } }) => (
              <CharacteristicsPicker selectedIds={value} onChange={onChange} />
            )}
          />

          {/* Share phone toggle */}
          <Controller
            control={control}
            name="sharePhone"
            render={({ field: { onChange, value } }) => (
              <View className="gap-2 rounded-xl border border-border bg-surface p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 font-montserrat-medium text-sm leading-5 text-text-primary">
                    Compartilhar meu telefone{"\n"}com o dono?
                  </Text>
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: "#E2E2E2", true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                <Text className="font-montserrat text-xs leading-4 text-text-tertiary">
                  O dono poderá entrar em contato caso reconheça o animal
                </Text>

                {value && <PhoneSection />}
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
            onPress={handleSubmit(onSubmit, () => showToast("Preencha os campos obrigatórios", "error"))}
            disabled={createSighting.isPending}
            className={`h-12 items-center justify-center rounded-xl bg-primary active:opacity-80 ${
              createSighting.isPending ? "opacity-50" : ""
            }`}
          >
            {createSighting.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-montserrat-bold text-base text-text-inverse">
                Registrar avistamento
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
