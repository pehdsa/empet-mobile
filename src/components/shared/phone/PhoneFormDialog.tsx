import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Switch,
  TextInput as RNTextInput,
} from "react-native";
import { Phone } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { phoneMask } from "@/utils/phone-mask";
import { Dialog } from "@/components/ui/Dialog";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface PhoneFormDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { phone: string; is_whatsapp: boolean }) => void;
  isSaving?: boolean;
  error?: string;
  initialData?: { phone: string; isWhatsapp: boolean };
  title?: string;
}

export function PhoneFormDialog({
  visible,
  onClose,
  onSave,
  isSaving,
  error,
  initialData,
  title,
}: PhoneFormDialogProps) {
  const [rawPhone, setRawPhone] = useState("");
  const [isWhatsapp, setIsWhatsapp] = useState(false);

  useEffect(() => {
    if (visible) {
      setRawPhone(initialData?.phone ?? "");
      setIsWhatsapp(initialData?.isWhatsapp ?? false);
    }
  }, [visible, initialData]);

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

  const dialogTitle = title ?? (initialData ? "Editar telefone" : "Adicionar telefone");

  return (
    <Dialog visible={visible} onClose={onClose}>
      <View className="items-center gap-5">
        {/* Icon */}
        <View
          className="h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: `${colors.primary}20` }}
        >
          <Phone size={28} color={colors.primary} />
        </View>

        {/* Title */}
        <Text className="font-montserrat-bold text-xl text-text-primary">
          {dialogTitle}
        </Text>

        {/* Description */}
        <Text className="text-center font-montserrat text-sm leading-5 text-text-secondary">
          Insira o número e indique se possui WhatsApp.
        </Text>

        {/* Phone input */}
        <View className="w-full gap-1.5">
          <Text className="font-montserrat-medium text-sm text-text-primary">
            Número *
          </Text>
          <View
            className={`h-12 flex-row items-center rounded-[10px] border px-4 ${
              error ? "border-error" : "border-border"
            }`}
          >
            <RNTextInput
              value={phoneMask(rawPhone)}
              onChangeText={handleChangeText}
              placeholder="(00) 00000-0000"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
              maxLength={15}
              className="flex-1 font-montserrat text-[15px] text-text-primary"
              editable={!isSaving}
            />
          </View>
          {error && <ErrorMessage message={error} />}
        </View>

        {/* WhatsApp toggle */}
        <View className="w-full gap-1">
          <View className="flex-row items-center justify-between">
            <Text className="font-montserrat-medium text-sm text-text-primary">
              Este número tem WhatsApp?
            </Text>
            <Switch
              value={isWhatsapp}
              onValueChange={setIsWhatsapp}
              disabled={isSaving}
              trackColor={{ false: "#E2E2E2", true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text className="font-montserrat text-xs text-text-tertiary">
            Facilita o contato com quem avistar seu pet
          </Text>
        </View>

        {/* Actions */}
        <View className="w-full items-center gap-3">
          <ButtonPrimary
            label="Salvar"
            onPress={handleSave}
            disabled={!isValid}
            loading={isSaving}
            className="w-full"
          />
          <Pressable
            onPress={onClose}
            disabled={isSaving}
            className="w-full h-[42px] items-center justify-center active:opacity-60"
          >
            <Text className="font-montserrat-medium text-[13px] text-text-tertiary">
              Cancelar
            </Text>
          </Pressable>
        </View>
      </View>
    </Dialog>
  );
}
