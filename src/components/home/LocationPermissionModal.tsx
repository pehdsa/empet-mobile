import { View, Text, Pressable } from "react-native";
import { MapPin, X } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { Dialog } from "@/components/ui/Dialog";

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
    <Dialog visible={visible} onClose={onClose}>
      <View className="items-center gap-4 pt-2">
        {/* Close button */}
        <Pressable
          onPress={onClose}
          className="absolute -top-2 right-0 h-8 w-8 items-center justify-center rounded-full bg-border/30 active:opacity-60"
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
            Permitir localização
          </Text>
          <Text className="text-center font-montserrat text-[13px] leading-5 text-text-secondary">
            Para mostrar pets perdidos perto de você, precisamos acessar sua
            localização. Sem permissão, a busca será baseada na região padrão.
          </Text>
        </View>

        {/* Actions */}
        <View className="w-full gap-3">
          <ButtonPrimary label="Permitir localização" onPress={onAllow} />
          <Pressable
            onPress={onClose}
            className="items-center py-1 active:opacity-60"
          >
            <Text className="font-montserrat-medium text-[13px] text-text-tertiary">
              Continuar sem localização
            </Text>
          </Pressable>
        </View>
      </View>
    </Dialog>
  );
}
