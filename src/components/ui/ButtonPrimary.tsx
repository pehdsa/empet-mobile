import { Pressable, Text, ActivityIndicator } from "react-native";
import { colors } from "@/lib/colors";

interface ButtonPrimaryProps {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ButtonPrimary({
  label,
  onPress,
  loading,
  disabled,
  className,
}: ButtonPrimaryProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`h-[52px] items-center justify-center rounded-[14px] bg-primary active:opacity-80 ${
        disabled || loading ? "opacity-50" : ""
      } ${className ?? ""}`}
    >
      {loading ? (
        <ActivityIndicator color={colors.textInverse} />
      ) : (
        <Text className="font-montserrat-medium text-base text-text-inverse">{label}</Text>
      )}
    </Pressable>
  );
}
