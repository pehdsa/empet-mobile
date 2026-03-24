import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
}

export function Screen({ children, scroll = true, className }: ScreenProps) {
  const insets = useSafeAreaInsets();

  if (scroll) {
    return (
      <ScrollView
        className={`flex-1 bg-background ${className ?? ""}`}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingHorizontal: 24,
        }}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      className={`flex-1 bg-background px-6 ${className ?? ""}`}
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {children}
    </View>
  );
}
