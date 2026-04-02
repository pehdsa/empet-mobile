import { View, Text, Switch } from "react-native";
import { colors } from "@/lib/colors";

interface NotificationToggleProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}

export function NotificationToggle({
  icon,
  title,
  description,
  value,
  onValueChange,
  disabled,
}: NotificationToggleProps) {
  return (
    <View className="gap-2 p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-[10px]">
          {icon}
          <Text className="font-montserrat-medium text-[15px] text-text-primary">
            {title}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ false: "#E2E2E2", true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>
      <Text className="font-montserrat text-xs leading-4 text-text-tertiary">
        {description}
      </Text>
    </View>
  );
}
