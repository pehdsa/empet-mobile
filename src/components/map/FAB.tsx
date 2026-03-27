import { Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import { colors } from "@/lib/colors";

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps) {
  return (
    <Pressable
      onPress={onPress}
      className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-soft-lg active:opacity-80"
    >
      <Plus size={24} color={colors.textInverse} />
    </Pressable>
  );
}
