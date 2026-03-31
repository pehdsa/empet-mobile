import { useState } from "react";
import { View, Text, Pressable, Switch, TextInput as RNTextInput } from "react-native";
import { Phone, MessageCircle } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { phoneMask } from "@/utils/phone-mask";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface NewPhoneEntryProps {
  onSave: (data: { phone: string; is_whatsapp: boolean }) => void;
  onCancel: () => void;
  isSaving?: boolean;
  error?: string;
}

export function NewPhoneEntry({
  onSave,
  onCancel,
  isSaving,
  error,
}: NewPhoneEntryProps) {
  const [rawPhone, setRawPhone] = useState("");
  const [isWhatsapp, setIsWhatsapp] = useState(false);

  const digits = rawPhone.replace(/\D/g, "");
  const isValid = digits.length >= 10 && digits.length <= 11;

  const handleChangeText = (text: string) => {
    const onlyDigits = text.replace(/\D/g, "").slice(0, 11);
    setRawPhone(onlyDigits);
  };

  const handleSave = () => {
    if (!isValid || isSaving) return;
    onSave({ phone: digits, is_whatsapp: isWhatsapp });
  };

  return (
    <View className="gap-2 rounded-xl border border-border bg-surface p-3">
      <View className="flex-row items-center gap-2">
        <View
          className={`h-11 flex-1 flex-row items-center gap-2 rounded-[10px] border bg-background px-3 ${
            error ? "border-error" : "border-border"
          }`}
        >
          <Phone size={16} color={colors.textTertiary} />
          <RNTextInput
            value={phoneMask(rawPhone)}
            onChangeText={handleChangeText}
            placeholder="(00) 00000-0000"
            placeholderTextColor={colors.textTertiary}
            keyboardType="phone-pad"
            maxLength={15}
            className="flex-1 font-montserrat text-sm text-text-primary"
            editable={!isSaving}
          />
        </View>
      </View>

      {error && <ErrorMessage message={error} />}

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <MessageCircle size={18} color="#25D366" />
          <Text className="font-montserrat-medium text-[13px] text-text-secondary">
            WhatsApp
          </Text>
        </View>

        <Switch
          value={isWhatsapp}
          onValueChange={setIsWhatsapp}
          disabled={isSaving}
          trackColor={{ false: "#E2E2E2", true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View className="flex-row items-center justify-end gap-3">
        <Pressable onPress={onCancel} disabled={isSaving}>
          <Text className="font-montserrat-medium text-[13px] text-text-tertiary">
            Cancelar
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSave}
          disabled={!isValid || isSaving}
          className="active:opacity-80"
          style={{ opacity: !isValid || isSaving ? 0.5 : 1 }}
        >
          <Text className="font-montserrat-semibold text-sm text-primary">
            Salvar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
