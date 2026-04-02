import {
  View,
  ScrollView,
  Pressable,
  Text,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { NavHeader } from "@/components/ui/NavHeader";
import { PetForm } from "@/components/pet/PetForm";
import { petSchema, type PetFormValues } from "@/features/pets/schemas/pet.schema";
import { buildCreatePetFormData } from "@/features/pets/utils/build-pet-form-data";
import { useCreatePet } from "@/hooks/usePets";
import { mapApiErrors } from "@/utils/map-api-errors";
import { useToastStore } from "@/stores/toast";
import type { ValidationError } from "@/types/api";

export default function CreatePetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
          const unhandled = mapApiErrors(form.setError, axiosError, {
            breed_id: "breedId",
            secondary_breed_id: "secondaryBreedId",
            breed_description: "breedDescription",
            primary_color: "primaryColor",
            characteristic_ids: "characteristicIds",
          });
          if (unhandled.length > 0) showToast(unhandled[0], "error");
        } else {
          showToast("Erro ao cadastrar pet", "error");
        }
      },
    });
  }, () => showToast("Preencha os campos obrigatórios", "error"));

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="bg-background">
        <NavHeader title="Cadastrar Pet" className="px-6" />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, gap: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <PetForm form={form} mode="create" />
          <View className="h-4" />
        </ScrollView>

        <View
          className="border-t border-border bg-surface px-6 py-4"
          style={{ paddingBottom: 16 + insets.bottom }}
        >
          <Pressable
            onPress={handleSubmit}
            disabled={createPet.isPending}
            className={`h-12 items-center justify-center rounded-xl bg-primary active:opacity-80 ${
              createPet.isPending ? "opacity-50" : ""
            }`}
          >
            {createPet.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-montserrat-bold text-base text-text-inverse">
                Salvar
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
