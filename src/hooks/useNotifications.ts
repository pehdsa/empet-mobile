import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { notificationsApi } from "@/services/api/notifications";
import { queryKeys } from "@/constants/query-keys";

/** Lista paginada de notificações (infinite scroll) */
export function useNotifications() {
  const query = useInfiniteQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ pageParam }) => notificationsApi.list(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data.meta;
      return meta.current_page < meta.last_page
        ? meta.current_page + 1
        : undefined;
    },
  });

  const notifications =
    query.data?.pages.flatMap((page) => page.data.data) ?? [];

  return { ...query, notifications };
}

/** Contagem de não lidas (polling 30s como fallback) */
export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationsApi.unreadCount(),
    select: (r) => r.data.data.count,
    refetchInterval: 30_000,
  });
}

/** Marcar notificação como lida */
export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}

/** Marcar todas como lidas (sem update otimista) */
export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}
