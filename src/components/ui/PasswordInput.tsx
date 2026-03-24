import React, { useState } from "react";
import {
  View,
  Text,
  TextInput as RNTextInput,
  Pressable,
  type TextInputProps as RNTextInputProps,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { ErrorMessage } from "./ErrorMessage";

interface PasswordInputProps extends Omit<RNTextInputProps, "className" | "secureTextEntry"> {
  label?: string;
  error?: string;
  className?: string;
}

export const PasswordInput = React.forwardRef<RNTextInput, PasswordInputProps>(
  ({ label, error, className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <View className={`gap-1.5 ${className ?? ""}`}>
        {label && (
          <Text className="font-montserrat-medium text-[13px] text-text-secondary">{label}</Text>
        )}
        <View
          className={`h-12 flex-row items-center rounded-xl border bg-surface px-4 ${
            error ? "border-error" : "border-border"
          }`}
        >
          <RNTextInput
            ref={ref}
            secureTextEntry={!visible}
            placeholderTextColor={colors.textTertiary}
            className="flex-1 font-montserrat text-[15px] text-text-primary"
            {...props}
          />
          <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
            {visible ? (
              <Eye size={20} color={colors.textTertiary} />
            ) : (
              <EyeOff size={20} color={colors.textTertiary} />
            )}
          </Pressable>
        </View>
        {error && <ErrorMessage message={error} />}
      </View>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
