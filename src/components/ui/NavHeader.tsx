import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "@/lib/colors";

interface NavHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  className?: string;
}

export function NavHeader({ title, onBack, showBack = true, className }: NavHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View className={`h-[52px] flex-row items-center gap-3 ${className ?? ""}`}>
      {showBack && (
        <Pressable onPress={handleBack} hitSlop={8}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
      )}
      <Text className="font-montserrat-medium text-lg text-text-primary">{title}</Text>
    </View>
  );
}
