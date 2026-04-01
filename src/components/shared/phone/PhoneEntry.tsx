import { View, Text, Pressable } from "react-native";
import { Phone, Pencil, Trash2, MessageCircle } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { phoneMask } from "@/utils/phone-mask";
import type { UserPhone } from "@/types/phone";

interface PhoneEntryProps {
  phone: UserPhone;
  onEdit: () => void;
  onDelete: () => void;
}

export function PhoneEntry({ phone, onEdit, onDelete }: PhoneEntryProps) {
  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
      <Phone size={16} color={colors.textTertiary} />

      <View className="flex-1 gap-0.5">
        <Text className="font-montserrat text-sm text-text-primary">
          {phoneMask(phone.phone)}
        </Text>
        {phone.isWhatsapp && (
          <View className="flex-row items-center gap-1">
            <MessageCircle size={12} color="#25D366" />
            <Text style={{ color: "#25D366" }} className="font-montserrat text-[11px]">
              WhatsApp
            </Text>
          </View>
        )}
      </View>

      <Pressable onPress={onEdit} className="p-1 active:opacity-60">
        <Pencil size={18} color={colors.textTertiary} />
      </Pressable>

      <Pressable onPress={onDelete} className="p-1 active:opacity-60">
        <Trash2 size={18} color={colors.error} />
      </Pressable>
    </View>
  );
}
