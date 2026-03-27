import { useCallback, useEffect, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import {
  BottomSheetModal as GorhomModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import { colors } from "@/lib/colors";

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheetModal({
  visible,
  onClose,
  title,
  children,
}: BottomSheetModalProps) {
  const sheetRef = useRef<GorhomModal>(null);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.3}
      />
    ),
    [],
  );

  return (
    <GorhomModal
      ref={sheetRef}
      enablePanDownToClose
      enableDynamicSizing
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
      backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
    >
      <BottomSheetView>
        <View className="px-6 pb-8">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="font-montserrat-bold text-lg text-text-primary">
              {title}
            </Text>
            <Pressable
              onPress={() => sheetRef.current?.dismiss()}
              hitSlop={8}
              className="active:opacity-60"
            >
              <X size={24} color={colors.textPrimary} />
            </Pressable>
          </View>

          {children}
        </View>
      </BottomSheetView>
    </GorhomModal>
  );
}
