import { View, Text } from "react-native";
import { CircleCheck } from "lucide-react-native";
import { colors } from "@/lib/colors";

interface SuccessMessageProps {
  message: string;
}

export function SuccessMessage({ message }: SuccessMessageProps) {
  return (
    <View className="flex-row items-center gap-2 rounded-xl bg-[#E8F5E9] px-4 py-3">
      <CircleCheck size={18} color={colors.success} />
      <Text className="flex-1 font-montserrat text-[13px] text-success">{message}</Text>
    </View>
  );
}
