import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Phone, Plus } from "lucide-react-native";
import { AxiosError } from "axios";

import { colors } from "@/lib/colors";
import {
  useUserPhones,
  useCreatePhone,
  useUpdatePhone,
  useDeletePhone,
} from "@/hooks/usePhones";
import { useToastStore } from "@/stores/toast";

import { NavHeader } from "@/components/ui/NavHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Dialog } from "@/components/ui/Dialog";
import { PhoneFormDialog } from "@/components/shared/phone/PhoneFormDialog";
import { PhoneCard } from "@/components/menu/PhoneCard";
import type { UserPhone } from "@/types/phone";

const MAX_PHONES = 5;

export default function PhonesScreen() {
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);

  const { data: phones, isLoading } = useUserPhones();
  const createPhone = useCreatePhone();
  const updatePhone = useUpdatePhone();
  const deletePhone = useDeletePhone();

  const [formVisible, setFormVisible] = useState(false);
  const [editingPhone, setEditingPhone] = useState<UserPhone | null>(null);
  const [phoneToDelete, setPhoneToDelete] = useState<UserPhone | null>(null);
  const [formError, setFormError] = useState<string | undefined>();

  const atLimit = (phones?.length ?? 0) >= MAX_PHONES;

  function openCreate() {
    setEditingPhone(null);
    setFormError(undefined);
    setFormVisible(true);
  }

  function openEdit(phone: UserPhone) {
    setEditingPhone(phone);
    setFormError(undefined);
    setFormVisible(true);
  }

  function handleSave(data: { phone: string; is_whatsapp: boolean }) {
    setFormError(undefined);

    if (editingPhone) {
      updatePhone.mutate(
        { id: editingPhone.id, data },
        {
          onSuccess: () => {
            setFormVisible(false);
            setEditingPhone(null);
          },
          onError: (err) => {
            if (err instanceof AxiosError && err.response?.status === 422) {
              const errors = err.response.data?.errors?.phone;
              setFormError(errors?.[0] ?? "Erro de validação");
            } else {
              showToast("Erro ao atualizar telefone", "error");
            }
          },
        },
      );
    } else {
      createPhone.mutate(data, {
        onSuccess: () => setFormVisible(false),
        onError: (err) => {
          if (err instanceof AxiosError && err.response?.status === 422) {
            const errors = err.response.data?.errors?.phone;
            setFormError(errors?.[0] ?? "Erro de validação");
          } else {
            showToast("Erro ao adicionar telefone", "error");
          }
        },
      });
    }
  }

  function handleDelete() {
    if (!phoneToDelete) return;
    deletePhone.mutate(phoneToDelete.id, {
      onSuccess: () => {
        setPhoneToDelete(null);
      },
      onError: () => {
        showToast("Erro ao excluir telefone", "error");
      },
    });
  }

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="bg-background">
        <NavHeader title="Meus Telefones" className="px-6" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 16,
          gap: 8,
          paddingBottom: 16 + insets.bottom,
        }}
      >
        {/* Loading */}
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={52} borderRadius={12} />
          ))}

        {/* Empty */}
        {!isLoading && phones?.length === 0 && (
          <View className="flex-1 items-center justify-center gap-4 py-20">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-background">
              <Phone size={32} color={colors.border} />
            </View>
            <Text className="font-montserrat-medium text-sm text-text-secondary">
              Nenhum telefone cadastrado
            </Text>
          </View>
        )}

        {/* List */}
        {!isLoading &&
          phones?.map((phone) => (
            <PhoneCard
              key={phone.id}
              phone={phone}
              onEdit={() => openEdit(phone)}
              onDelete={() => setPhoneToDelete(phone)}
            />
          ))}

        {/* Add button */}
        {!isLoading && (
          <View className="gap-1.5">
            <Pressable
              onPress={openCreate}
              disabled={atLimit}
              className={`h-14 flex-row items-center justify-center gap-2 rounded-xl border border-border bg-background active:opacity-80 ${
                atLimit ? "opacity-50" : ""
              }`}
            >
              <Plus size={20} color={colors.primary} />
              <Text className="font-montserrat-medium text-sm text-primary">
                Adicionar telefone
              </Text>
            </Pressable>
            {atLimit && (
              <Text className="text-center font-montserrat text-xs text-text-tertiary">
                Máximo de {MAX_PHONES} telefones
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Phone Form Dialog */}
      <PhoneFormDialog
        visible={formVisible}
        onClose={() => {
          setFormVisible(false);
          setEditingPhone(null);
        }}
        onSave={handleSave}
        isSaving={createPhone.isPending || updatePhone.isPending}
        error={formError}
        initialData={
          editingPhone
            ? { phone: editingPhone.phone, isWhatsapp: editingPhone.isWhatsapp }
            : undefined
        }
        title={editingPhone ? "Editar telefone" : "Adicionar telefone"}
      />

      {/* Delete Dialog */}
      <Dialog
        visible={phoneToDelete !== null}
        onClose={() => setPhoneToDelete(null)}
      >
        <View className="items-center gap-4">
          <Text className="font-montserrat-bold text-lg text-text-primary">
            Excluir telefone?
          </Text>
          <Text className="text-center font-montserrat text-sm text-text-secondary">
            Essa ação não pode ser desfeita.
          </Text>
          <View className="w-full flex-row gap-3">
            <Pressable
              onPress={() => setPhoneToDelete(null)}
              className="h-11 flex-1 items-center justify-center rounded-[10px] border border-border bg-white active:opacity-80"
            >
              <Text className="font-montserrat-semibold text-sm text-text-primary">
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={handleDelete}
              disabled={deletePhone.isPending}
              className="h-11 flex-1 items-center justify-center rounded-[10px] bg-error active:opacity-80"
            >
              <Text className="font-montserrat-semibold text-sm text-white">
                Excluir
              </Text>
            </Pressable>
          </View>
        </View>
      </Dialog>
    </View>
  );
}
