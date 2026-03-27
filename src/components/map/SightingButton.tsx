import { Pressable, Text } from "react-native";
import { Eye } from "lucide-react-native";
import { colors } from "@/lib/colors";

interface SightingButtonProps {
  onPress: () => void;
}

export function SightingButton({ onPress }: SightingButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2 rounded-full bg-surface/85 px-4 py-3 shadow-sm active:opacity-80"
    >
      <Eye size={18} color={colors.secondary} />
      <Text className="font-montserrat-medium text-sm text-text-primary">Avistei um pet</Text>
    </Pressable>
  );
}
