import { Modal as RNModal, View, Text, Pressable } from "react-native";
import { X } from "lucide-react-native";
import { colors } from "@/lib/colors";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50" onPress={onClose} />
      <View className="rounded-t-3xl bg-surface px-6 pb-8 pt-4">
        <View className="mb-4 items-center">
          <View className="h-1 w-10 rounded-[2px] bg-border" />
        </View>
        {title && (
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="font-montserrat-bold text-lg text-text-primary">{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={24} color={colors.textTertiary} />
            </Pressable>
          </View>
        )}
        {children}
      </View>
    </RNModal>
  );
}
