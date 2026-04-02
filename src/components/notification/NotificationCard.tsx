import { View, Text, Pressable } from "react-native";
import { MapPin, Sparkles, Eye, Heart } from "lucide-react-native";
import { notificationTypeLabel } from "@/constants/enums";
import { relativeTime } from "@/utils/relative-time";
import type { Notification, NotificationType } from "@/types/notification";

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
}

const ICON_CONFIG: Record<
  NotificationType,
  { Icon: typeof MapPin; color: string; bg: string }
> = {
  pet_lost_nearby: { Icon: MapPin, color: "#E53935", bg: "#E5393515" },
  matches_found: { Icon: Sparkles, color: "#FFA001", bg: "#AD4FFF15" },
  pet_report_sighting_reported: { Icon: Eye, color: "#FFA001", bg: "#FFA00115" },
  pet_sighting_claimed: { Icon: Heart, color: "#43A047", bg: "#43A04715" },
};

function getTitle(notification: Notification): string {
  const { type, data } = notification;
  if (type === "pet_report_sighting_reported") {
    return "Alguém avistou seu pet!";
  }
  return notificationTypeLabel[type];
}

function getBody(notification: Notification): string {
  const { type, data } = notification;
  switch (type) {
    case "pet_lost_nearby":
      return `${data.pet_name ?? "Um pet"} foi reportado como perdido próximo à sua localização`;
    case "matches_found":
      return `Encontramos ${data.matches_count ?? ""} possíveis matches para ${data.pet_name ?? "seu pet"}`;
    case "pet_report_sighting_reported":
      return `Um usuário reportou ter visto ${data.pet_name ?? "seu pet"}${data.address_hint ? ` próximo à ${data.address_hint}` : ""}`;
    case "pet_sighting_claimed":
      return `${data.claimer_name ?? "Alguém"} reconheceu o pet que você avistou`;
    default:
      return "";
  }
}

export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const isUnread = notification.readAt === null;
  const config = ICON_CONFIG[notification.type];
  const { Icon } = config;

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row gap-3 px-4 py-3 active:opacity-80 ${
        isUnread ? "bg-surface" : "bg-background"
      }`}
      style={isUnread ? { borderLeftWidth: 3, borderLeftColor: "#FFA001" } : undefined}
    >
      {/* Icon */}
      <View
        className="h-10 w-10 items-center justify-center rounded-[20px]"
        style={{ backgroundColor: config.bg }}
      >
        <Icon size={20} color={config.color} />
      </View>

      {/* Content */}
      <View className="flex-1 gap-1">
        <Text
          className={`font-montserrat-medium text-sm ${
            isUnread ? "text-text-primary" : "text-text-secondary"
          }`}
        >
          {getTitle(notification)}
        </Text>
        <Text
          className={`font-montserrat text-[13px] ${
            isUnread ? "text-text-secondary" : "text-text-tertiary"
          }`}
          style={{ lineHeight: 17 }}
          numberOfLines={2}
        >
          {getBody(notification)}
        </Text>
        <Text className="font-montserrat text-xs text-text-tertiary">
          {relativeTime(notification.createdAt)}
        </Text>
      </View>

      {/* Unread dot */}
      {isUnread && (
        <View className="self-center">
          <View className="h-2 w-2 rounded-[4px] bg-primary" />
        </View>
      )}
    </Pressable>
  );
}
