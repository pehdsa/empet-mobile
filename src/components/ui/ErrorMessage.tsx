import { View, Text } from "react-native";
import { CircleAlert } from "lucide-react-native";
import { colors } from "@/lib/colors";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <View className="flex-row items-center gap-2 rounded-xl bg-[#FDEDED] px-4 py-3">
      <CircleAlert size={18} color={colors.error} />
      <Text className="flex-1 font-montserrat text-[13px] text-error">{message}</Text>
    </View>
  );
}
