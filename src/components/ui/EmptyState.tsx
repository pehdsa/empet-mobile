import { View, Text, Pressable } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { TextLink } from "./TextLink";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: "link" | "button";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = "link",
  className,
}: EmptyStateProps) {
  return (
    <View className={`items-center gap-4 rounded-2xl bg-surface/95 p-6 ${className ?? ""}`}>
      <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Icon size={32} color={colors.primary} />
      </View>
      <Text className="text-center font-montserrat-bold text-lg text-text-primary">{title}</Text>
      {description && (
        <Text className="w-[280px] text-center font-montserrat text-sm leading-5 text-text-secondary">
          {description}
        </Text>
      )}
      {actionLabel && onAction && actionVariant === "link" && (
        <TextLink label={actionLabel} onPress={onAction} />
      )}
      {actionLabel && onAction && actionVariant === "button" && (
        <Pressable
          onPress={onAction}
          className="h-[52px] w-[220px] items-center justify-center rounded-[14px] bg-primary active:opacity-80"
        >
          <Text className="font-montserrat-medium text-base text-white">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
