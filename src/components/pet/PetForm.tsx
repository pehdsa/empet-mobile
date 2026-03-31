import { useEffect } from "react";
import { View, Text } from "react-native";
import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { TextInput } from "@/components/ui/TextInput";
import { SelectField } from "@/components/ui/SelectField";
import { ToggleButton } from "@/components/ui/ToggleButton";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { PhotoUploader } from "./PhotoUploader";
import { CharacteristicsPicker } from "./CharacteristicsPicker";
import { useBreeds } from "@/hooks/useBreeds";
import { speciesLabel, sizeLabel, sexLabel } from "@/constants/enums";
import type { PetFormValues } from "@/features/pets/schemas/pet.schema";
import type { PetSpecies, PetSize, PetSex } from "@/types/pet";
import { useState } from "react";
import { Pressable, Text as RNText, ScrollView } from "react-native";
import { colors } from "@/lib/colors";

interface PetFormProps {
  form: UseFormReturn<PetFormValues>;
  mode: "create" | "edit";
}

const SPECIES_OPTIONS: PetSpecies[] = ["DOG", "CAT"];
const SIZE_OPTIONS: PetSize[] = ["SMALL", "MEDIUM", "LARGE"];
const SEX_OPTIONS: PetSex[] = ["MALE", "FEMALE", "UNKNOWN"];

export function PetForm({ form, mode }: PetFormProps) {
  const { control, setValue } = form;
  const watchedSpecies = useWatch({ control, name: "species" });
  const watchedBreedId = useWatch({ control, name: "breedId" });
  const { data: breeds } = useBreeds(watchedSpecies);

  const [breedModalVisible, setBreedModalVisible] = useState(false);
  const [breed2ModalVisible, setBreed2ModalVisible] = useState(false);
  const [breedSearch, setBreedSearch] = useState("");
  const [breed2Search, setBreed2Search] = useState("");

  // Reset breeds quando species muda
  useEffect(() => {
    if (mode === "create" || watchedSpecies) {
      setValue("breedId", null);
      setValue("secondaryBreedId", null);
    }
  }, [watchedSpecies]);

  // Reset secondary breed quando breed principal e null
  useEffect(() => {
    if (watchedBreedId === null) {
      setValue("secondaryBreedId", null);
    }
  }, [watchedBreedId]);

  const selectedBreedName = breeds?.find((b) => b.id === watchedBreedId)?.name;
  const watchedSecondaryBreedId = useWatch({ control, name: "secondaryBreedId" });
  const selectedBreed2Name = breeds?.find(
    (b) => b.id === watchedSecondaryBreedId,
  )?.name;

  return (
    <View className="gap-6">
      {/* Fotos */}
      <Controller
        control={control}
        name="photos"
        render={({ field: { value, onChange } }) => (
          <PhotoUploader photos={value} onChange={onChange} />
        )}
      />

      {/* Nome */}
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <TextInput
            label="Nome do pet"
            placeholder="Ex: Rex, Luna..."
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error?.message}
          />
        )}
      />

      {/* Especie */}
      <Controller
        control={control}
        name="species"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <View className="gap-2">
            <Text className="font-montserrat-medium text-[13px] text-text-secondary">
              Espécie
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
              <Text className="font-montserrat text-xs text-error">{error.message}</Text>
            )}
          </View>
        )}
      />

      {/* Porte */}
      <Controller
        control={control}
        name="size"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
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
                  onPress={() => onChange(sz)}
                />
              ))}
            </View>
            {error && (
              <Text className="font-montserrat text-xs text-error">{error.message}</Text>
            )}
          </View>
        )}
      />

      {/* Sexo */}
      <Controller
        control={control}
        name="sex"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
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
                  onPress={() => onChange(sx)}
                />
              ))}
            </View>
            {error && (
              <Text className="font-montserrat text-xs text-error">{error.message}</Text>
            )}
          </View>
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
              onPress={() => setBreedModalVisible(true)}
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
                  <RNText className="font-montserrat text-[15px] text-text-tertiary">
                    Nenhuma
                  </RNText>
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
                      <RNText
                        className={`font-montserrat text-[15px] ${
                          breed.id === watchedBreedId
                            ? "font-montserrat-medium text-primary"
                            : "text-text-primary"
                        }`}
                      >
                        {breed.name}
                      </RNText>
                    </Pressable>
                  ))}
              </ScrollView>
            </BottomSheetModal>
          </>
        )}
      />

      {/* Raca secundaria */}
      <Controller
        control={control}
        name="secondaryBreedId"
        render={({ fieldState: { error } }) => (
          <>
            <SelectField
              label="Raça secundária (opcional)"
              value={selectedBreed2Name}
              placeholder="Selecionar raça"
              error={error?.message}
              onPress={
                watchedBreedId !== null
                  ? () => setBreed2ModalVisible(true)
                  : undefined
              }
              className={watchedBreedId === null ? "opacity-50" : ""}
            />
            <BottomSheetModal
              visible={breed2ModalVisible}
              onClose={() => setBreed2ModalVisible(false)}
              title="Raça secundária"
              searchable
              searchPlaceholder="Buscar raça..."
              onSearchChange={setBreed2Search}
            >
              <ScrollView className="max-h-72">
                <Pressable
                  onPress={() => {
                    setValue("secondaryBreedId", null);
                    setBreed2ModalVisible(false);
                  }}
                  className="border-b border-border px-2 py-3 active:opacity-60"
                >
                  <RNText className="font-montserrat text-[15px] text-text-tertiary">
                    Nenhuma
                  </RNText>
                </Pressable>
                {breeds
                  ?.filter(
                    (b) =>
                      b.id !== watchedBreedId &&
                      b.name.toLowerCase().includes(breed2Search.toLowerCase()),
                  )
                  .map((breed) => (
                    <Pressable
                      key={breed.id}
                      onPress={() => {
                        setValue("secondaryBreedId", breed.id);
                        setBreed2ModalVisible(false);
                      }}
                      className="border-b border-border px-2 py-3 active:opacity-60"
                    >
                      <RNText
                        className={`font-montserrat text-[15px] ${
                          breed.id === watchedSecondaryBreedId
                            ? "font-montserrat-medium text-primary"
                            : "text-text-primary"
                        }`}
                      >
                        {breed.name}
                      </RNText>
                    </Pressable>
                  ))}
              </ScrollView>
            </BottomSheetModal>
          </>
        )}
      />

      {/* Cor predominante */}
      <Controller
        control={control}
        name="primaryColor"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <TextInput
            label="Cor predominante"
            placeholder="Ex: Caramelo, Preto..."
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error?.message}
          />
        )}
      />

      {/* Observacoes */}
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View className="gap-1.5">
            <Text className="font-montserrat-medium text-[13px] text-text-secondary">
              Observações (opcional)
            </Text>
            <TextInput
              placeholder="Detalhes sobre o pet..."
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text className="self-end font-montserrat text-[11px] text-text-tertiary">
              {value.length}/1000
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
    </View>
  );
}
