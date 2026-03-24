import { View, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { TextLink } from "./TextLink";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <View className={`items-center gap-3 rounded-2xl bg-surface/95 p-6 ${className ?? ""}`}>
      <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Icon size={28} color={colors.primary} />
      </View>
      <Text className="text-center font-montserrat-bold text-base text-text-primary">{title}</Text>
      {description && (
        <Text className="text-center font-montserrat text-[13px] leading-5 text-text-secondary">
          {description}
        </Text>
      )}
      {actionLabel && onAction && <TextLink label={actionLabel} onPress={onAction} />}
    </View>
  );
}
