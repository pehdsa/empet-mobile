import { Modal, View, Text, Pressable } from "react-native";
import { MapPin, X } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";

interface LocationPermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onAllow: () => void;
}

export function LocationPermissionModal({
  visible,
  onClose,
  onAllow,
}: LocationPermissionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/40 px-9">
        <View className="w-full max-w-[320px] items-center gap-4 rounded-3xl bg-surface p-6 pt-8 shadow-soft-lg">
          {/* Close button */}
          <Pressable
            onPress={onClose}
            className="absolute right-4 top-4 h-8 w-8 items-center justify-center rounded-full bg-border/30 active:opacity-60"
            accessibilityLabel="Fechar"
          >
            <X size={16} color={colors.textSecondary} />
          </Pressable>

          {/* Icon */}
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MapPin size={28} color={colors.primary} />
          </View>

          {/* Text */}
          <View className="w-full gap-2">
            <Text className="text-center font-montserrat-bold text-lg text-text-primary">
              Permitir localizacao
            </Text>
            <Text className="text-center font-montserrat text-[13px] leading-5 text-text-secondary">
              Para mostrar pets perdidos perto de voce, precisamos acessar sua
              localizacao. Sem permissao, a busca sera baseada na regiao padrao.
            </Text>
          </View>

          {/* Actions */}
          <View className="w-full gap-3">
            <ButtonPrimary label="Permitir localizacao" onPress={onAllow} />
            <Pressable
              onPress={onClose}
              className="items-center py-1 active:opacity-60"
            >
              <Text className="font-montserrat-medium text-[13px] text-text-tertiary">
                Continuar sem localizacao
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
