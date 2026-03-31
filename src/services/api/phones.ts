import { api } from "./client";
import type { UserPhone } from "@/types/phone";
import type { ResourceResponse, MessageResponse } from "@/types/api";

export const phonesApi = {
  list: () => api.get<UserPhone[]>("/user/phones"),

  create: (data: { phone: string; is_whatsapp?: boolean; label?: string }) =>
    api.post<ResourceResponse<UserPhone>>("/user/phones", data),

  update: (
    id: number,
    data: { phone?: string; is_whatsapp?: boolean; label?: string },
  ) => api.put<ResourceResponse<UserPhone>>(`/user/phones/${id}`, data),

  delete: (id: number) =>
    api.delete<MessageResponse>(`/user/phones/${id}`),
};
