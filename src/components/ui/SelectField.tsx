import { View, Text, Pressable } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { ErrorMessage } from "./ErrorMessage";

interface SelectFieldProps {
  label?: string;
  value?: string;
  placeholder?: string;
  error?: string;
  onPress?: () => void;
  className?: string;
}

export function SelectField({
  label,
  value,
  placeholder,
  error,
  onPress,
  className,
}: SelectFieldProps) {
  return (
    <View className={`gap-1.5 ${className ?? ""}`}>
      {label && (
        <Text className="font-montserrat-medium text-[13px] text-text-secondary">{label}</Text>
      )}
      <Pressable
        onPress={onPress}
        className={`h-12 flex-row items-center justify-between rounded-xl border bg-surface px-4 ${
          error ? "border-error" : "border-border"
        }`}
      >
        <Text
          className={`font-montserrat text-[15px] ${
            value ? "text-text-primary" : "text-text-tertiary"
          }`}
        >
          {value || placeholder || "Selecionar"}
        </Text>
        <ChevronDown size={20} color={colors.textTertiary} />
      </Pressable>
      {error && <ErrorMessage message={error} />}
    </View>
  );
}
