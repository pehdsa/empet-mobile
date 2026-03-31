import { Modal, View, Pressable } from "react-native";

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Dialog({ visible, onClose, children }: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={onClose}>
        <Pressable className="w-full max-w-[345px] rounded-3xl bg-surface p-6 shadow-soft-lg">
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
