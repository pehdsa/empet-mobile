import { useState } from "react";
import { View, ScrollView, ActivityIndicator, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pencil, Trash2, TriangleAlert } from "lucide-react-native";

import { colors } from "@/lib/colors";
import { usePet, useTogglePetActive, useDeletePet } from "@/hooks/usePets";
import { useToastStore } from "@/stores/toast";
import { NavHeader } from "@/components/ui/NavHeader";
import { Modal } from "@/components/ui/Modal";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import { PhotoCarousel } from "@/components/pet-report/PhotoCarousel";
import { CharacteristicsSection } from "@/components/pet-report/CharacteristicsSection";
import { NotesCard } from "@/components/pet-report/NotesCard";
import { PetBasicInfo } from "@/components/pet/PetBasicInfo";

function parseId(raw: string | string[] | undefined): number | null {
  if (!raw || Array.isArray(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function PetDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);

  const parsedId = parseId(rawId);
  const { data: pet, isLoading, isError, refetch } = usePet(parsedId);
  const toggleActive = useTogglePetActive();
  const deletePet = useDeletePet();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  if (parsedId === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="font-montserrat text-sm text-text-secondary">
          Pet invalido
        </Text>
      </View>
    );
  }

  const handleToggleActive = () => {
    if (toggleActive.isPending) return;
    toggleActive.mutate(parsedId, {
      onError: () => showToast("Erro ao alterar status", "error"),
    });
  };

  const handleDelete = () => {
    deletePet.mutate(parsedId, {
      onSuccess: () => {
        setDeleteModalVisible(false);
        showToast("Pet excluido com sucesso");
        router.replace("/(tabs)/pets" as never);
      },
      onError: () => {
        showToast("Erro ao excluir pet", "error");
      },
    });
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-background">
        <NavHeader title="Detalhes do Pet" className="px-6" />
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
          <Pressable onPress={() => refetch()} className="mt-2 active:opacity-60">
            <Text className="font-montserrat-medium text-sm text-primary">
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      )}

      {pet && (
        <>
          <ScrollView>
            <PhotoCarousel photos={pet.photos} species={pet.species} />
            <PetBasicInfo pet={pet} />

            {pet.characteristics.length > 0 && (
              <CharacteristicsSection characteristics={pet.characteristics} />
            )}

            {pet.notes && (
              <>
                <View className="h-2" />
                <NotesCard notes={pet.notes} />
              </>
            )}

            <View className="h-4" />
          </ScrollView>

          {/* Bottom bar */}
          <View
            className="flex-row items-center gap-3 border-t border-border bg-surface px-6 py-3"
            style={{ paddingBottom: 12 + insets.bottom }}
          >
            {/* Toggle active */}
            <Pressable
              onPress={handleToggleActive}
              disabled={toggleActive.isPending}
              className={`h-[52px] flex-1 items-center justify-center rounded-[14px] ${
                pet.isActive ? "bg-error" : "bg-success"
              } active:opacity-80 ${toggleActive.isPending ? "opacity-50" : ""}`}
            >
              <Text className="font-montserrat-medium text-base text-text-inverse">
                {pet.isActive ? "Desativar" : "Ativar"}
              </Text>
            </Pressable>

            {/* Edit */}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/pets/[id]/edit",
                  params: { id: String(parsedId) },
                })
              }
              className="h-[52px] w-[52px] items-center justify-center rounded-xl border border-primary active:opacity-80"
            >
              <Pencil size={20} color={colors.primary} />
            </Pressable>

            {/* Delete */}
            <Pressable
              onPress={() => setDeleteModalVisible(true)}
              className="h-[52px] w-[52px] items-center justify-center rounded-xl border border-error active:opacity-80"
            >
              <Trash2 size={20} color={colors.error} />
            </Pressable>
          </View>

          {/* Delete modal */}
          <Modal
            visible={deleteModalVisible}
            onClose={() => setDeleteModalVisible(false)}
          >
            <View className="items-center gap-4">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-error/10">
                <TriangleAlert size={28} color={colors.error} />
              </View>

              <Text className="font-montserrat-bold text-xl text-text-primary">
                Excluir Pet?
              </Text>

              <Text className="text-center font-montserrat text-sm leading-5 text-text-secondary">
                Tem certeza que deseja excluir {pet.name}? Essa acao nao pode ser
                desfeita.
              </Text>

              <View className="w-full gap-3">
                <ButtonSecondary
                  label="Cancelar"
                  onPress={() => setDeleteModalVisible(false)}
                />
                <Pressable
                  onPress={handleDelete}
                  disabled={deletePet.isPending}
                  className={`h-[52px] items-center justify-center rounded-[14px] bg-error active:opacity-80 ${
                    deletePet.isPending ? "opacity-50" : ""
                  }`}
                >
                  <Text className="font-montserrat-medium text-base text-text-inverse">
                    {deletePet.isPending ? "Excluindo..." : "Excluir"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}
