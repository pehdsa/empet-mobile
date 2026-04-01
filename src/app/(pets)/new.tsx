import { View } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { Screen } from "@/components/ui/Screen";
import { NavHeader } from "@/components/ui/NavHeader";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { PetForm } from "@/components/pet/PetForm";
import { petSchema, type PetFormValues } from "@/features/pets/schemas/pet.schema";
import { buildCreatePetFormData } from "@/features/pets/utils/build-pet-form-data";
import { useCreatePet } from "@/hooks/usePets";
import { mapApiErrors } from "@/utils/map-api-errors";
import { useToastStore } from "@/stores/toast";
import type { ValidationError } from "@/types/api";

export default function CreatePetScreen() {
  const router = useRouter();
  const showToast = useToastStore((s) => s.show);
  const createPet = useCreatePet();

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "",
      species: undefined as unknown as "DOG",
      size: undefined as unknown as "SMALL",
      sex: undefined as unknown as "MALE",
      breedId: null,
      secondaryBreedId: null,
      breedDescription: "",
      primaryColor: "",
      notes: "",
      characteristicIds: [],
      photos: [],
    },
  });

  const handleSubmit = form.handleSubmit((values: PetFormValues) => {
    const formData = buildCreatePetFormData(values);

    createPet.mutate(formData, {
      onSuccess: (response) => {
        showToast("Pet cadastrado com sucesso!");
        const newId = response.data.data.id;
        router.replace({
          pathname: "/(pets)/[id]",
          params: { id: String(newId) },
        });
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
          showToast("Erro ao cadastrar pet", "error");
        }
      },
    });
  });

  return (
    <Screen scroll>
      <NavHeader title="Cadastrar Pet" />

      <PetForm form={form} mode="create" />

      <View className="mt-6 pb-8">
        <ButtonPrimary
          label="Salvar"
          onPress={handleSubmit}
          loading={createPet.isPending}
        />
      </View>
    </Screen>
  );
}
