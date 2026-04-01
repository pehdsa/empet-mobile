import { useState } from "react";
import { View, ScrollView, ActivityIndicator, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Pencil,
  Trash2,
  TriangleAlert,
  FileText,
  Users,
  ChevronRight,
  CircleCheck,
} from "lucide-react-native";

import { colors } from "@/lib/colors";
import { usePet, useDeletePet } from "@/hooks/usePets";
import { usePetReportDetail, useMarkPetFound } from "@/hooks/usePetReports";
import { useToastStore } from "@/stores/toast";
import { NavHeader } from "@/components/ui/NavHeader";
import { Dialog } from "@/components/ui/Dialog";
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
  const deletePet = useDeletePet();
  const markFound = useMarkPetFound();

  const isLost = !!pet?.activeReportId;
  const { data: activeReport } = usePetReportDetail(
    pet?.activeReportId ?? null,
  );

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [foundModalVisible, setFoundModalVisible] = useState(false);

  if (parsedId === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="font-montserrat text-sm text-text-secondary">
          Pet inválido
        </Text>
      </View>
    );
  }

  const handleDelete = () => {
    deletePet.mutate(parsedId, {
      onSuccess: () => {
        setDeleteModalVisible(false);
        showToast("Pet excluído com sucesso");
        router.replace("/(tabs)/pets" as never);
      },
      onError: () => {
        showToast("Erro ao excluir pet", "error");
      },
    });
  };

  const handleMarkFound = () => {
    if (!pet?.activeReportId) return;
    markFound.mutate(
      { reportId: pet.activeReportId, petId: parsedId },
      {
        onSuccess: () => {
          setFoundModalVisible(false);
          showToast("Pet marcado como encontrado!");
        },
        onError: () => {
          showToast("Erro ao marcar como encontrado", "error");
        },
      },
    );
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

            {/* Botao Pet encontrado (estado perdido) */}
            {isLost && (
              <View className="items-center px-0 py-3">
                <Pressable
                  onPress={() => setFoundModalVisible(true)}
                  className="h-[52px] flex-row items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-success px-5 active:opacity-80"
                >
                  <CircleCheck size={20} color="#43A047" />
                  <Text className="font-montserrat-bold text-base" style={{ color: "#43A047" }}>
                    Pet encontrado
                  </Text>
                </Pressable>
              </View>
            )}

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

          {/* Card Ver Matches (estado perdido, fixo entre scroll e bottom bar, oculto se 0 matches) */}
          {isLost && (activeReport?.matchesCount ?? 0) > 0 && (
            <Pressable
              onPress={() => showToast("Em breve")}
              className="flex-row items-center gap-3 border-t border-border px-6 py-3"
              style={{ backgroundColor: "#AD4FFF10" }}
            >
              <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "#AD4FFF15" }}>
                <Users size={20} color={colors.primary} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="font-montserrat-semibold text-[15px] text-text-primary">
                  Ver Matches
                </Text>
                <Text className="font-montserrat text-xs text-text-secondary">
                  {activeReport?.matchesCount ?? 0} pets encontrados com similaridade
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </Pressable>
          )}

          {/* Bottom bar */}
          <View
            className="gap-3 border-t border-border bg-surface px-6 py-3"
            style={{ paddingBottom: 12 + insets.bottom }}
          >
            <View className="flex-row items-center gap-3">
              {isLost ? (
                /* Estado perdido: botao outline "Detalhes de Perda" */
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(reports)/lost/update/[reportId]" as never,
                      params: { reportId: String(pet.activeReportId) },
                    })
                  }
                  className="h-[52px] w-[216px] flex-row items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-primary active:opacity-80"
                >
                  <FileText size={20} color={colors.primary} />
                  <Text className="font-montserrat-semibold text-base text-primary">
                    Detalhes de Perda
                  </Text>
                </Pressable>
              ) : (
                /* Estado seguro: botao "Pet Perdido" */
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(reports)/lost/[petId]" as never,
                      params: { petId: String(parsedId) },
                    })
                  }
                  className="h-[52px] w-[216px] flex-row items-center justify-center gap-2 rounded-[14px] bg-error active:opacity-80"
                >
                  <TriangleAlert size={20} color="#FFFFFF" />
                  <Text className="font-montserrat-semibold text-base text-text-inverse">
                    Pet Perdido
                  </Text>
                </Pressable>
              )}

              {/* Edit */}
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(pets)/[id]/edit" as never,
                    params: { id: String(parsedId) },
                  })
                }
                className="h-[52px] w-[52px] items-center justify-center rounded-xl border-[1.5px] border-primary active:opacity-80"
              >
                <Pencil size={20} color={colors.primary} />
              </Pressable>

              {/* Delete */}
              <Pressable
                onPress={() => setDeleteModalVisible(true)}
                className="h-[52px] w-[52px] items-center justify-center rounded-xl border-[1.5px] border-error active:opacity-80"
              >
                <Trash2 size={20} color={colors.error} />
              </Pressable>
            </View>
          </View>

          {/* Delete modal */}
          <Dialog
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
                Tem certeza que deseja excluir {pet.name}? Essa ação não pode ser
                desfeita.
              </Text>

              <View className="w-full items-center gap-3">
                <Pressable
                  onPress={handleDelete}
                  disabled={deletePet.isPending}
                  className={`w-full h-[52px] items-center justify-center rounded-[14px] bg-error active:opacity-80 ${
                    deletePet.isPending ? "opacity-50" : ""
                  }`}
                >
                  <Text className="font-montserrat-medium text-base text-text-inverse">
                    {deletePet.isPending ? "Excluindo..." : "Excluir"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setDeleteModalVisible(false)}
                  className="w-full h-[42px] items-center justify-center active:opacity-60"
                >
                  <Text className="font-montserrat-medium text-[13px] text-text-tertiary">
                    Cancelar
                  </Text>
                </Pressable>
              </View>
            </View>
          </Dialog>

          {/* Found confirmation modal */}
          <Dialog
            visible={foundModalVisible}
            onClose={() => setFoundModalVisible(false)}
          >
            <View className="items-center gap-4">
              <View
                className="h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: "#43A04720" }}
              >
                <CircleCheck size={28} color="#43A047" />
              </View>

              <Text className="font-montserrat-bold text-xl text-text-primary">
                Pet encontrado?
              </Text>

              <Text className="text-center font-montserrat text-sm leading-5 text-text-secondary">
                Tem certeza que o pet foi encontrado? O status será atualizado e
                o alerta será encerrado.
              </Text>

              <View className="w-full items-center gap-3">
                <Pressable
                  onPress={handleMarkFound}
                  disabled={markFound.isPending}
                  className="w-full h-[52px] items-center justify-center rounded-[14px] active:opacity-80"
                  style={{
                    backgroundColor: "#43A047",
                    opacity: markFound.isPending ? 0.5 : 1,
                  }}
                >
                  <Text className="font-montserrat-medium text-base text-text-inverse">
                    {markFound.isPending ? "Atualizando..." : "Sim, encontrado!"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setFoundModalVisible(false)}
                  className="w-full h-[42px] items-center justify-center active:opacity-60"
                >
                  <Text className="font-montserrat-medium text-[13px] text-text-tertiary">
                    Cancelar
                  </Text>
                </Pressable>
              </View>
            </View>
          </Dialog>
        </>
      )}
    </View>
  );
}
