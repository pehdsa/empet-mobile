import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, Sparkles, Eye } from "lucide-react-native";

import { colors } from "@/lib/colors";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "@/hooks/useNotificationSettings";
import { useToastStore } from "@/stores/toast";
import { NavHeader } from "@/components/ui/NavHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { NotificationToggle } from "@/components/menu/NotificationToggle";

type SettingsField = "notifyLostNearby" | "notifyMatches" | "notifySightings";

const FIELD_TO_API: Record<SettingsField, string> = {
  notifyLostNearby: "notify_lost_nearby",
  notifyMatches: "notify_matches",
  notifySightings: "notify_sightings",
};

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);

  const { data: settings, isLoading } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();
  const [pendingField, setPendingField] = useState<SettingsField | null>(null);

  function handleToggle(field: SettingsField, value: boolean) {
    setPendingField(field);
    updateSettings.mutate(
      { [FIELD_TO_API[field]]: value },
      {
        onError: () => showToast("Erro ao atualizar preferência", "error"),
        onSettled: () => setPendingField(null),
      },
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="bg-background">
        <NavHeader title="Notificações" className="px-6" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: 16 + insets.bottom,
        }}
      >
        {isLoading ? (
          <View className="gap-2 overflow-hidden rounded-xl bg-white">
            {Array.from({ length: 3 }).map((_, i) => (
              <View key={i} className="p-4">
                <Skeleton width="60%" height={16} />
                <View className="mt-2">
                  <Skeleton width="90%" height={12} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="overflow-hidden rounded-xl bg-white">
            <NotificationToggle
              icon={<Bell size={24} color={colors.primary} />}
              title="Pet perdido próximo"
              description="Receba avisos quando um pet for reportado como perdido na sua região"
              value={settings?.notifyLostNearby ?? true}
              onValueChange={(v) => handleToggle("notifyLostNearby", v)}
              disabled={pendingField === "notifyLostNearby"}
            />
            <View className="h-px bg-background" />
            <NotificationToggle
              icon={<Sparkles size={24} color={colors.primary} />}
              title="Matches encontrados"
              description="Receba avisos quando o sistema encontrar matches para seus reports"
              value={settings?.notifyMatches ?? true}
              onValueChange={(v) => handleToggle("notifyMatches", v)}
              disabled={pendingField === "notifyMatches"}
            />
            <View className="h-px bg-background" />
            <NotificationToggle
              icon={<Eye size={24} color={colors.primary} />}
              title="Avistamento reportado"
              description="Receba avisos quando alguém reportar ter visto seu pet perdido"
              value={settings?.notifySightings ?? true}
              onValueChange={(v) => handleToggle("notifySightings", v)}
              disabled={pendingField === "notifySightings"}
            />
          </View>
        )}

        <Text className="text-center font-montserrat text-xs text-text-tertiary">
          As notificações push dependem das permissões do dispositivo
        </Text>
      </ScrollView>
    </View>
  );
}
