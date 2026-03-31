import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { CirclePlus, Trash2 } from "lucide-react-native";
import { AxiosError } from "axios";
import { colors } from "@/lib/colors";
import {
  useUserPhones,
  useCreatePhone,
  useUpdatePhone,
  useDeletePhone,
} from "@/hooks/usePhones";
import { useToastStore } from "@/stores/toast";
import { Dialog } from "@/components/ui/Dialog";
import { PhoneEntry } from "./PhoneEntry";
import { NewPhoneEntry } from "./NewPhoneEntry";
import type { ValidationError } from "@/types/api";

const MAX_PHONES = 5;

export function PhoneSection() {
  const showToast = useToastStore((s) => s.show);
  const { data: phones } = useUserPhones();
  const createPhone = useCreatePhone();
  const updatePhone = useUpdatePhone();
  const deletePhone = useDeletePhone();

  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newPhoneError, setNewPhoneError] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const phoneCount = phones?.length ?? 0;

  const handleCreatePhone = (data: {
    phone: string;
    is_whatsapp: boolean;
  }) => {
    setNewPhoneError(undefined);
    createPhone.mutate(data, {
      onSuccess: () => {
        setShowNewEntry(false);
      },
      onError: (err) => {
        if (err instanceof AxiosError && err.response?.status === 422) {
          const apiErr = err as AxiosError<ValidationError>;
          const phoneErrors = apiErr.response?.data?.errors?.phone;
          setNewPhoneError(phoneErrors?.[0] ?? "Erro de validação");
        } else {
          showToast("Erro ao salvar telefone", "error");
        }
      },
    });
  };

  const handleToggleWhatsapp = (phoneId: number, value: boolean) => {
    updatePhone.mutate({ id: phoneId, data: { is_whatsapp: value } });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget === null) return;
    deletePhone.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
      onError: () => {
        showToast("Erro ao excluir telefone", "error");
        setDeleteTarget(null);
      },
    });
  };

  return (
    <View className="gap-3">
      <Text className="font-montserrat-medium text-sm text-text-primary">
        Telefones para contato
      </Text>

      {/* Lista de phones existentes */}
      {phones?.map((phone) => (
        <PhoneEntry
          key={phone.id}
          phone={phone}
          onWhatsappToggle={(v) => handleToggleWhatsapp(phone.id, v)}
          onDelete={() => setDeleteTarget(phone.id)}
          isDeleting={deletePhone.isPending && deleteTarget === phone.id}
          isUpdating={
            updatePhone.isPending &&
            updatePhone.variables?.id === phone.id
          }
        />
      ))}

      {/* Novo phone */}
      {showNewEntry && (
        <NewPhoneEntry
          onSave={handleCreatePhone}
          onCancel={() => {
            setShowNewEntry(false);
            setNewPhoneError(undefined);
          }}
          isSaving={createPhone.isPending}
          error={newPhoneError}
        />
      )}

      {/* Botao adicionar */}
      {!showNewEntry && phoneCount < MAX_PHONES && (
        <Pressable
          onPress={() => setShowNewEntry(true)}
          className="h-10 flex-row items-center justify-center gap-1.5 active:opacity-60"
        >
          <CirclePlus size={18} color={colors.primary} />
          <Text className="font-montserrat-semibold text-sm text-primary">
            Adicionar telefone
          </Text>
        </Pressable>
      )}

      {/* Dialog excluir telefone */}
      <Dialog
        visible={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
      >
        <View className="items-center gap-4">
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: "#E5393520" }}
          >
            <Trash2 size={28} color={colors.error} />
          </View>

          <Text className="font-montserrat-bold text-xl text-text-primary">
            Excluir telefone?
          </Text>

          <Text className="text-center font-montserrat text-sm leading-5 text-text-secondary">
            Tem certeza que deseja excluir este número de telefone? Essa ação
            não pode ser desfeita.
          </Text>

          <View className="w-full items-center gap-3">
            <Pressable
              onPress={handleConfirmDelete}
              disabled={deletePhone.isPending}
              className={`w-full h-[52px] items-center justify-center rounded-[14px] bg-error active:opacity-80 ${
                deletePhone.isPending ? "opacity-50" : ""
              }`}
            >
              <Text className="font-montserrat-medium text-base text-text-inverse">
                {deletePhone.isPending ? "Excluindo..." : "Excluir"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setDeleteTarget(null)}
              className="py-1 active:opacity-60"
            >
              <Text className="font-montserrat-medium text-[13px] text-text-tertiary">
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Dialog>
    </View>
  );
}
