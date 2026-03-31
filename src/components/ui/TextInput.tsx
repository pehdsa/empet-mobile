import React from "react";
import {
  View,
  Text,
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
} from "react-native";
import { colors } from "@/lib/colors";
import { ErrorMessage } from "./ErrorMessage";

interface TextInputProps extends Omit<RNTextInputProps, "className"> {
  label?: string;
  error?: string;
  className?: string;
}

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <View className={`gap-1.5 ${className ?? ""}`}>
        {label && (
          <Text className="font-montserrat-medium text-[13px] text-text-secondary">{label}</Text>
        )}
        <RNTextInput
          ref={ref}
          placeholderTextColor={colors.textTertiary}
          className={`${props.multiline ? "min-h-[128px] py-3" : "h-12"} rounded-xl border bg-surface px-4 font-montserrat text-[15px] text-text-primary ${
            error ? "border-error" : "border-border"
          }`}
          {...props}
        />
        {error && <ErrorMessage message={error} />}
      </View>
    );
  },
);

TextInput.displayName = "TextInput";
