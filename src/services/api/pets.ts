import { api } from "./client";
import type { Pet } from "@/types/pet";
import type { PaginatedResponse, ResourceResponse } from "@/types/api";

export const petsApi = {
  /** Lista paginada dos pets do usuario autenticado */
  list: (page: number = 1) =>
    api.get<PaginatedResponse<Pet>>("/pets", { params: { page } }),

  /** Detalhe de um pet */
  getDetail: (id: number) =>
    api.get<ResourceResponse<Pet>>(`/pets/${id}`),

  /** Criar pet (multipart/form-data) */
  create: (data: FormData) =>
    api.post<ResourceResponse<Pet>>("/pets", data),

  /** Atualizar pet (multipart/form-data) */
  update: (id: number, data: FormData) =>
    api.put<ResourceResponse<Pet>>(`/pets/${id}`, data),

  /** Excluir pet */
  delete: (id: number) => api.delete(`/pets/${id}`),

  /** Toggle ativo/inativo */
  toggleActive: (id: number) =>
    api.patch<ResourceResponse<Pet>>(`/pets/${id}/toggle-active`),
};
