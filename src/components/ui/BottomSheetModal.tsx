import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import {
  BottomSheetModal as GorhomModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { X, Search } from "lucide-react-native";
import { colors } from "@/lib/colors";

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Quando true, exibe campo de busca abaixo do header */
  searchable?: boolean;
  /** Placeholder do campo de busca */
  searchPlaceholder?: string;
  /** Callback com o texto digitado no campo de busca */
  onSearchChange?: (query: string) => void;
  children: React.ReactNode;
}

export function BottomSheetModal({
  visible,
  onClose,
  title,
  searchable = false,
  searchPlaceholder = "Buscar...",
  onSearchChange,
  children,
}: BottomSheetModalProps) {
  const sheetRef = useRef<GorhomModal>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
      if (searchable) {
        setSearchQuery("");
        onSearchChange?.("");
      }
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

          {searchable && (
            <View className="mb-4 flex-row items-center gap-2 rounded-xl border border-border bg-background px-3">
              <Search size={16} color={colors.textTertiary} />
              <TextInput
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  onSearchChange?.(text);
                }}
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.textTertiary}
                className="h-10 flex-1 font-montserrat text-sm text-text-primary"
                autoCorrect={false}
              />
            </View>
          )}

          {children}
        </View>
      </BottomSheetView>
    </GorhomModal>
  );
}
