import { MessageCircle } from "lucide-react-native";
import { colors } from "@/lib/colors";

interface WhatsAppIconProps {
  size: number;
}

export function WhatsAppIcon({ size }: WhatsAppIconProps) {
  return <MessageCircle size={size} color={colors.whatsapp} />;
}
