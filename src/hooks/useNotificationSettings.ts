import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/services/api/notifications";
import { queryKeys } from "@/constants/query-keys";
import type { NotificationSettings } from "@/types/notification-settings";

/** Ler preferências de notificação */
export function useNotificationSettings() {
  return useQuery({
    queryKey: queryKeys.notificationSettings.all,
    queryFn: () => notificationsApi.getSettings(),
    select: (r) => r.data.data,
  });
}

/** Atualizar preferências com optimistic update */
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      notify_lost_nearby?: boolean;
      notify_matches?: boolean;
      notify_sightings?: boolean;
    }) => notificationsApi.updateSettings(data),

    onMutate: async (newData) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notificationSettings.all,
      });

      const previous = queryClient.getQueryData(
        queryKeys.notificationSettings.all,
      );

      queryClient.setQueryData(
        queryKeys.notificationSettings.all,
        (old: { data: { data: NotificationSettings } } | undefined) => {
          if (!old) return old;
          const settings = old.data.data;
          return {
            ...old,
            data: {
              ...old.data,
              data: {
                ...settings,
                ...(newData.notify_lost_nearby !== undefined && {
                  notifyLostNearby: newData.notify_lost_nearby,
                }),
                ...(newData.notify_matches !== undefined && {
                  notifyMatches: newData.notify_matches,
                }),
                ...(newData.notify_sightings !== undefined && {
                  notifySightings: newData.notify_sightings,
                }),
              },
            },
          };
        },
      );

      return { previous };
    },

    onError: (_err, _newData, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.notificationSettings.all,
          context.previous,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notificationSettings.all,
      });
    },
  });
}
