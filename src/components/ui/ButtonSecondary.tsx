import { Pressable, Text, ActivityIndicator } from "react-native";
import { colors } from "@/lib/colors";

interface ButtonSecondaryProps {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ButtonSecondary({
  label,
  onPress,
  loading,
  disabled,
  className,
}: ButtonSecondaryProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`h-[52px] items-center justify-center rounded-[14px] border-[1.5px] border-primary bg-transparent active:opacity-80 ${
        disabled || loading ? "opacity-50" : ""
      } ${className ?? ""}`}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Text className="font-montserrat-medium text-base text-primary">{label}</Text>
      )}
    </Pressable>
  );
}
