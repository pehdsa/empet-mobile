import { View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <View className={`rounded-2xl border border-border bg-surface p-4 shadow-soft ${className ?? ""}`}>
      {children}
    </View>
  );
}
