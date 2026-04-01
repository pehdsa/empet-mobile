import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { PartyPopper } from "lucide-react-native";
import { Dialog } from "@/components/ui/Dialog";

interface ConfirmMatchDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmMatchDialog({
  visible,
  onClose,
  onConfirm,
  loading,
}: ConfirmMatchDialogProps) {
  return (
    <Dialog visible={visible} onClose={onClose}>
      <View className="items-center gap-4">
        {/* Icon */}
        <View
          className="h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: "#43A04720" }}
        >
          <PartyPopper size={28} color="#43A047" />
        </View>

        {/* Title */}
        <Text className="text-center font-montserrat-bold text-xl text-text-primary">
          Confirmar que é seu pet?
        </Text>

        {/* Description */}
        <Text className="text-center font-montserrat text-sm leading-5 text-text-secondary">
          Ao confirmar, o reporte será atualizado como &ldquo;encontrado&rdquo; e o
          avistante será notificado. Essa ação não pode ser desfeita.
        </Text>

        {/* Buttons */}
        <View className="w-full gap-3">
          <Pressable
            onPress={onConfirm}
            disabled={loading}
            className="h-[52px] items-center justify-center rounded-[14px] active:opacity-80"
            style={{ backgroundColor: "#43A047" }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-montserrat-semibold text-base text-white">
                Sim, é meu pet!
              </Text>
            )}
          </Pressable>
          <Pressable
            onPress={onClose}
            disabled={loading}
            className="h-[52px] items-center justify-center rounded-[14px] border-[1.5px] active:opacity-80"
            style={{ borderColor: "#6B6C6D" }}
          >
            <Text className="font-montserrat-semibold text-base" style={{ color: "#6B6C6D" }}>
              Cancelar
            </Text>
          </Pressable>
        </View>
      </View>
    </Dialog>
  );
}
