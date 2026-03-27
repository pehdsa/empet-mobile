import { Pressable, Text } from "react-native";

interface TextLinkProps {
  label: string;
  onPress?: () => void;
  className?: string;
}

export function TextLink({ label, onPress, className }: TextLinkProps) {
  return (
    <Pressable onPress={onPress} hitSlop={8} className="active:opacity-60">
      <Text className={`font-montserrat-medium text-sm text-primary ${className ?? ""}`}>
        {label}
      </Text>
    </Pressable>
  );
}
