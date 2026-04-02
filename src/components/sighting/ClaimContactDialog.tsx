import { View, Text, Pressable, Linking } from "react-native";
import { Phone, MessageCircle, BellRing, Lightbulb } from "lucide-react-native";
import { Dialog } from "@/components/ui/Dialog";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { colors } from "@/lib/colors";
import { formatPhone } from "@/utils/format-phone";
import { useToastStore } from "@/stores/toast";
import type { SightingOwner } from "@/types/pet-sighting";

interface ClaimContactDialogProps {
  visible: boolean;
  onClose: () => void;
  owner: SightingOwner | null;
}

export function ClaimContactDialog({
  visible,
  onClose,
  owner,
}: ClaimContactDialogProps) {
  const showToast = useToastStore((s) => s.show);

  if (!visible || !owner) return null;

  async function openLink(url: string, errorMsg: string) {
    try {
      await Linking.openURL(url);
    } catch {
      showToast(errorMsg, "error");
    }
  }

  const hasPhone = owner.phone != null;

  if (hasPhone) {
    return (
      <Dialog visible={visible} onClose={onClose}>
        <View className="items-center gap-5">
          {/* Icon */}
          <View
            className="h-14 w-14 items-center justify-center rounded-[28px]"
            style={{ backgroundColor: "#FFA00120" }}
          >
            <Phone size={28} color={colors.primary} />
          </View>

          {/* Title */}
          <Text className="text-center font-montserrat-bold text-xl text-text-primary">
            Dados de contato
          </Text>

          {/* Subtitle */}
          <Text
            className="text-center font-montserrat text-sm text-text-secondary"
            style={{ lineHeight: 20 }}
          >
            Entre em contato para saber mais detalhes sobre o pet avistado. O avistador também será notificado de que você reconheceu o animal.
          </Text>

          {/* Contact card */}
          <View className="w-full gap-3 rounded-xl bg-background p-4">
            {/* Name row */}
            <View className="flex-row items-center gap-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-[22px]"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="font-montserrat-bold text-lg text-white">
                  {owner.name?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="font-montserrat-semibold text-base text-text-primary">
                  {owner.name}
                </Text>
                <Text className="font-montserrat text-xs text-text-tertiary">
                  Criador do avistamento
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-border" />

            {/* Phone row */}
            <View className="flex-row items-center gap-3">
              <Phone size={18} color={colors.textTertiary} />
              <View className="flex-1 gap-0.5">
                <Text className="font-montserrat-medium text-[15px] text-text-primary">
                  {formatPhone(owner.phone!)}
                </Text>
                {owner.phoneIsWhatsapp === true && (
                  <View className="flex-row items-center gap-1">
                    <WhatsAppIcon size={12} />
                    <Text className="font-montserrat text-[11px] text-whatsapp">
                      WhatsApp
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Action buttons */}
          <View className="w-full gap-3">
            <View className="flex-row gap-3">
              <Pressable
                onPress={() =>
                  openLink(
                    `tel:${owner.phone}`,
                    "Não foi possível abrir o telefone",
                  )
                }
                className="h-[52px] flex-1 flex-row items-center justify-center gap-2 rounded-[14px] bg-primary active:opacity-80"
              >
                <Phone size={20} color="#FFFFFF" />
                <Text className="font-montserrat-semibold text-base text-white">
                  Ligar
                </Text>
              </Pressable>

              {owner.phoneIsWhatsapp === true && (
                <Pressable
                  onPress={() => {
                    const digits = owner.phone!.replace(/\D/g, "");
                    openLink(
                      `https://wa.me/${digits}`,
                      "Não foi possível abrir o WhatsApp",
                    );
                  }}
                  className="h-[52px] flex-1 flex-row items-center justify-center gap-2 rounded-[14px] bg-whatsapp active:opacity-80"
                >
                  <MessageCircle size={20} color="#FFFFFF" />
                  <Text className="font-montserrat-semibold text-base text-white">
                    WhatsApp
                  </Text>
                </Pressable>
              )}
            </View>

            <Pressable onPress={onClose} className="items-center active:opacity-60">
              <Text className="font-montserrat-medium text-[13px] text-text-tertiary">
                Fechar
              </Text>
            </Pressable>
          </View>
        </View>
      </Dialog>
    );
  }

  // Layout sem telefone
  return (
    <Dialog visible={visible} onClose={onClose}>
      <View className="items-center gap-5">
        {/* Icon */}
        <View
          className="h-14 w-14 items-center justify-center rounded-[28px]"
          style={{ backgroundColor: "#43A04720" }}
        >
          <BellRing size={28} color="#43A047" />
        </View>

        {/* Title */}
        <Text className="text-center font-montserrat-bold text-xl text-text-primary">
          Avistador notificado!
        </Text>

        {/* Description */}
        <Text
          className="text-center font-montserrat text-sm text-text-secondary"
          style={{ lineHeight: 21 }}
        >
          O avistador optou por não compartilhar o telefone, mas não se preocupe
          — ele já foi notificado de que você reconheceu o pet.
          {"\n\n"}
          Caso ele queira, entrará em contato diretamente com você.
        </Text>

        {/* Tip card */}
        <View
          className="w-full flex-row items-center gap-3 rounded-xl p-[14px]"
          style={{ backgroundColor: "#FFA00110" }}
        >
          <Lightbulb size={20} color={colors.primary} />
          <Text
            className="flex-1 font-montserrat text-xs text-text-secondary"
            style={{ lineHeight: 17 }}
          >
            Dica: mantenha seus telefones atualizados no app para facilitar o
            contato.
          </Text>
        </View>

        {/* Button */}
        <Pressable
          onPress={onClose}
          className="h-[52px] w-full items-center justify-center rounded-[14px] bg-primary active:opacity-80"
        >
          <Text className="font-montserrat-semibold text-base text-white">
            Entendi
          </Text>
        </Pressable>
      </View>
    </Dialog>
  );
}
