import { Pressable, Text } from "react-native";

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  className?: string;
}

export function Chip({ label, active, onPress, className }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-9 items-center justify-center rounded-full px-4 ${
        active ? "bg-primary" : "border border-border bg-surface"
      } ${className ?? ""}`}
    >
      <Text
        className={`text-[13px] ${
          active
            ? "font-montserrat-medium text-text-inverse"
            : "font-montserrat text-text-primary"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
