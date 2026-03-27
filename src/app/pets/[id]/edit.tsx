import { useEffect } from "react";
import { View, ActivityIndicator, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";

import { colors } from "@/lib/colors";
import { Screen } from "@/components/ui/Screen";
import { NavHeader } from "@/components/ui/NavHeader";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { PetForm } from "@/components/pet/PetForm";
import { petSchema, type PetFormValues } from "@/features/pets/schemas/pet.schema";
import { buildUpdatePetFormData } from "@/features/pets/utils/build-pet-form-data";
import { usePet, useUpdatePet } from "@/hooks/usePets";
import { mapApiErrors } from "@/utils/map-api-errors";
import { useToastStore } from "@/stores/toast";
import type { ValidationError } from "@/types/api";
import type { Pet, PetPhoto } from "@/types/pet";

function parseId(raw: string | string[] | undefined): number | null {
  if (!raw || Array.isArray(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function petToFormValues(pet: Pet): PetFormValues {
  return {
    name: pet.name,
    species: pet.species,
    size: pet.size,
    sex: pet.sex,
    breedId: pet.breed?.id ?? null,
    secondaryBreedId: pet.secondaryBreed?.id ?? null,
    breedDescription: pet.breedDescription ?? "",
    primaryColor: pet.primaryColor ?? "",
    notes: pet.notes ?? "",
    characteristicIds: pet.characteristics.map((c) => c.id),
    photos: pet.photos.map((p) => ({
      id: `existing-${p.id}`,
      existing: p,
    })),
  };
}

export default function EditPetScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const showToast = useToastStore((s) => s.show);

  const parsedId = parseId(rawId);
  const { data: pet, isLoading, isError, refetch } = usePet(parsedId);
  const updatePet = useUpdatePet();

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "",
      species: "DOG",
      size: "SMALL",
      sex: "UNKNOWN",
      breedId: null,
      secondaryBreedId: null,
      breedDescription: "",
      primaryColor: "",
      notes: "",
      characteristicIds: [],
      photos: [],
    },
  });

  // Preencher form quando dados carregam
  useEffect(() => {
    if (pet) {
      form.reset(petToFormValues(pet));
    }
  }, [pet]);

  if (parsedId === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="font-montserrat text-sm text-text-secondary">
          Pet invalido
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isError || !pet) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <Text className="font-montserrat-medium text-base text-text-primary">
          Erro ao carregar
        </Text>
        <Pressable onPress={() => refetch()} className="mt-2 active:opacity-60">
          <Text className="font-montserrat-medium text-sm text-primary">
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  }

  const originalPhotos: PetPhoto[] = pet.photos;

  const handleSubmit = form.handleSubmit((values: PetFormValues) => {
    const formData = buildUpdatePetFormData(values, originalPhotos);

    updatePet.mutate(
      { id: parsedId, data: formData },
      {
        onSuccess: () => {
          showToast("Pet atualizado com sucesso!");
          router.back();
        },
        onError: (error) => {
          const axiosError = error as AxiosError<ValidationError>;
          if (axiosError.response?.status === 422) {
            mapApiErrors(form.setError, axiosError, {
              breed_id: "breedId",
              secondary_breed_id: "secondaryBreedId",
              breed_description: "breedDescription",
              primary_color: "primaryColor",
              characteristic_ids: "characteristicIds",
            });
          } else {
            showToast("Erro ao atualizar pet", "error");
          }
        },
      },
    );
  });

  return (
    <Screen scroll>
      <NavHeader title="Editar Pet" />

      <PetForm form={form} mode="edit" />

      <View className="mt-6 pb-8">
        <ButtonPrimary
          label="Salvar"
          onPress={handleSubmit}
          loading={updatePet.isPending}
        />
      </View>
    </Screen>
  );
}
