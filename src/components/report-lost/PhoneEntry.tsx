import { View, Text, Pressable, Switch } from "react-native";
import { Phone, Trash2, MessageCircle } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { phoneMask } from "@/utils/phone-mask";
import type { UserPhone } from "@/types/phone";

interface PhoneEntryProps {
  phone: UserPhone;
  onWhatsappToggle: (value: boolean) => void;
  onDelete: () => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export function PhoneEntry({
  phone,
  onWhatsappToggle,
  onDelete,
  isDeleting,
  isUpdating,
}: PhoneEntryProps) {
  const disabled = isDeleting || isUpdating;

  return (
    <View className="gap-2 rounded-xl border border-border bg-surface p-3">
      <View className="flex-row items-center gap-2">
        <View className="h-11 flex-1 flex-row items-center gap-2 rounded-[10px] border border-border bg-background px-3">
          <Phone size={16} color={colors.textTertiary} />
          <Text className="font-montserrat text-sm text-text-primary">
            {phoneMask(phone.phone)}
          </Text>
        </View>

        <Pressable
          onPress={onDelete}
          disabled={disabled}
          className="h-9 w-9 items-center justify-center rounded-lg active:opacity-60"
          style={{ opacity: disabled ? 0.5 : 1 }}
        >
          <Trash2 size={16} color={colors.textTertiary} />
        </Pressable>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <MessageCircle size={18} color="#25D366" />
          <Text className="font-montserrat-medium text-[13px] text-text-secondary">
            WhatsApp
          </Text>
        </View>

        <Switch
          value={phone.isWhatsapp}
          onValueChange={onWhatsappToggle}
          disabled={disabled}
          trackColor={{ false: "#E2E2E2", true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}
