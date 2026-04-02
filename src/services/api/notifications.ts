import { api } from "./client";
import type { Notification } from "@/types/notification";
import type { NotificationSettings } from "@/types/notification-settings";
import type { Device, DevicePlatform } from "@/types/device";
import type { PaginatedResponse, ResourceResponse } from "@/types/api";

export const notificationsApi = {
  /** Listar notificações (paginado) */
  list: (page: number = 1) =>
    api.get<PaginatedResponse<Notification>>("/user/notifications", {
      params: { page },
    }),

  /** Marcar como lida */
  markRead: (id: string) =>
    api.patch(`/user/notifications/${id}/read`),

  /** Marcar todas como lidas */
  markAllRead: () => api.patch("/user/notifications/read-all"),

  /** Contagem de não lidas */
  unreadCount: () =>
    api.get<ResourceResponse<{ count: number }>>(
      "/user/notifications/unread-count",
    ),

  /** Registrar device para push */
  registerDevice: (data: {
    deviceToken: string;
    platform: DevicePlatform;
    deviceName: string;
  }) =>
    api.post<ResourceResponse<Device>>("/user/devices", {
      device_token: data.deviceToken,
      platform: data.platform,
      device_name: data.deviceName,
    }),

  /** Remover device (logout) */
  removeDevice: (id: number) => api.delete(`/user/devices/${id}`),

  /** Ler preferências de notificação */
  getSettings: () =>
    api.get<ResourceResponse<NotificationSettings>>(
      "/user/notification-settings",
    ),

  /** Atualizar preferências (partial update, snake_case no body) */
  updateSettings: (data: {
    notify_lost_nearby?: boolean;
    notify_matches?: boolean;
    notify_sightings?: boolean;
  }) =>
    api.put<ResourceResponse<NotificationSettings>>(
      "/user/notification-settings",
      data,
    ),
};
