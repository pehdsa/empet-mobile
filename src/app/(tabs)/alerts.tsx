import { View, Text, FlatList, ActivityIndicator, Pressable, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BellOff } from "lucide-react-native";

import { colors } from "@/lib/colors";
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
} from "@/hooks/useNotifications";
import { useToastStore } from "@/stores/toast";
import { getNotificationRoute } from "@/utils/notification-route";
import { NotificationCard } from "@/components/notification/NotificationCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import type { Notification } from "@/types/notification";

export default function Alerts() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);

  const {
    notifications,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useNotifications();

  const { data: unreadCount = 0 } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  function handleNotificationPress(notification: Notification) {
    if (!notification.readAt) {
      markRead.mutate(notification.id);
    }

    const route = getNotificationRoute(notification.type, notification.data);

    if (!route) {
      showToast("Não foi possível abrir esta notificação", "error");
      return;
    }

    router.push(route as never);
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-3">
        <Text className="font-montserrat-medium text-lg text-text-primary">
          Notificações
        </Text>
        {unreadCount > 0 && (
          <Pressable
            onPress={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="active:opacity-60"
          >
            <Text className="font-montserrat-medium text-[13px] text-primary">
              {markAllRead.isPending ? "Marcando..." : "Marcar todas"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Loading */}
      {isLoading && (
        <View className="gap-3 px-4 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} className="flex-row gap-3 px-4 py-3">
              <Skeleton width={40} height={40} borderRadius={20} />
              <View className="flex-1 gap-2">
                <Skeleton width="60%" height={14} />
                <Skeleton width="90%" height={12} />
                <Skeleton width="30%" height={10} />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center font-montserrat text-sm text-text-secondary">
            Erro ao carregar notificações
          </Text>
          <ButtonSecondary
            label="Tentar novamente"
            onPress={() => refetch()}
            className="w-48"
          />
        </View>
      )}

      {/* Empty */}
      {!isLoading && !isError && notifications.length === 0 && (
        <View className="flex-1 items-center justify-center gap-4 px-12">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-background">
            <BellOff size={40} color="#E2E2E2" />
          </View>
          <Text className="text-center font-montserrat-bold text-base text-text-primary">
            Nenhuma notificação
          </Text>
          <Text className="text-center font-montserrat text-[13px] text-text-secondary">
            Quando algo importante acontecer, você verá aqui
          </Text>
        </View>
      )}

      {/* List */}
      {!isLoading && !isError && notifications.length > 0 && (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard
              notification={item}
              onPress={() => handleNotificationPress(item)}
            />
          )}
          ItemSeparatorComponent={() => (
            <View className="h-px bg-border" />
          )}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={() => refetch()}
              tintColor={colors.primary}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        />
      )}
    </View>
  );
}
