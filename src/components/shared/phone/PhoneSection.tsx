import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { CirclePlus, Trash2, Phone } from "lucide-react-native";
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
import { PhoneFormDialog } from "./PhoneFormDialog";
import type { UserPhone } from "@/types/phone";
import type { ValidationError } from "@/types/api";

const MAX_PHONES = 5;

export function PhoneSection() {
  const showToast = useToastStore((s) => s.show);
  const { data: phones } = useUserPhones();
  const createPhone = useCreatePhone();
  const updatePhone = useUpdatePhone();
  const deletePhone = useDeletePhone();

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<UserPhone | null>(null);
  const [formError, setFormError] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const phoneCount = phones?.length ?? 0;

  const handleOpenCreate = () => {
    setEditTarget(null);
    setFormError(undefined);
    setShowFormDialog(true);
  };

  const handleOpenEdit = (phone: UserPhone) => {
    setEditTarget(phone);
    setFormError(undefined);
    setShowFormDialog(true);
  };

  const handleCloseForm = () => {
    setShowFormDialog(false);
    setEditTarget(null);
    setFormError(undefined);
  };

  const handleSave = (data: { phone: string; is_whatsapp: boolean }) => {
    setFormError(undefined);

    if (editTarget) {
      updatePhone.mutate(
        { id: editTarget.id, data },
        {
          onSuccess: () => handleCloseForm(),
          onError: (err) => {
            if (err instanceof AxiosError && err.response?.status === 422) {
              const apiErr = err as AxiosError<ValidationError>;
              const phoneErrors = apiErr.response?.data?.errors?.phone;
              setFormError(phoneErrors?.[0] ?? "Erro de validação");
            } else {
              showToast("Erro ao atualizar telefone", "error");
            }
          },
        },
      );
    } else {
      createPhone.mutate(data, {
        onSuccess: () => handleCloseForm(),
        onError: (err) => {
          if (err instanceof AxiosError && err.response?.status === 422) {
            const apiErr = err as AxiosError<ValidationError>;
            const phoneErrors = apiErr.response?.data?.errors?.phone;
            setFormError(phoneErrors?.[0] ?? "Erro de validação");
          } else {
            showToast("Erro ao salvar telefone", "error");
          }
        },
      });
    }
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
    <View className="gap-2">
      {/* Estado vazio */}
      {phoneCount === 0 && (
        <View className="items-center gap-1 rounded-xl border border-dashed border-border py-6">
          <Phone size={24} color={colors.textTertiary} />
          <Text className="font-montserrat-medium text-sm text-text-secondary">
            Nenhum telefone cadastrado
          </Text>
          <Text className="font-montserrat text-xs text-text-tertiary">
            Adicione um telefone para facilitar o contato
          </Text>
        </View>
      )}

      {/* Lista de phones */}
      {phones?.map((phone) => (
        <PhoneEntry
          key={phone.id}
          phone={phone}
          onEdit={() => handleOpenEdit(phone)}
          onDelete={() => setDeleteTarget(phone.id)}
        />
      ))}

      {/* Botão adicionar */}
      {phoneCount < MAX_PHONES && (
        <Pressable
          onPress={handleOpenCreate}
          className="h-10 flex-row items-center justify-center gap-1.5 active:opacity-60"
        >
          <CirclePlus size={18} color={colors.primary} />
          <Text className="font-montserrat-semibold text-sm text-primary">
            Adicionar telefone
          </Text>
        </Pressable>
      )}

      {/* Dialog criar/editar */}
      <PhoneFormDialog
        visible={showFormDialog}
        onClose={handleCloseForm}
        onSave={handleSave}
        isSaving={editTarget ? updatePhone.isPending : createPhone.isPending}
        error={formError}
        initialData={
          editTarget
            ? { phone: editTarget.phone, isWhatsapp: editTarget.isWhatsapp }
            : undefined
        }
      />

      {/* Dialog excluir */}
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
              className={`w-full h-[52px] flex-row items-center justify-center gap-2 rounded-[14px] bg-error active:opacity-80 ${
                deletePhone.isPending ? "opacity-50" : ""
              }`}
            >
              <Trash2 size={20} color="#FFFFFF" />
              <Text className="font-montserrat-bold text-base text-text-inverse">
                {deletePhone.isPending ? "Excluindo..." : "Excluir"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setDeleteTarget(null)}
              className="w-full h-[42px] items-center justify-center active:opacity-60"
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
