import { api } from "./client";
import type {
  PetSighting,
  PetSightingMapFilters,
  PetSightingListFilters,
  SightingClaimResponse,
} from "@/types/pet-sighting";
import type { PaginatedResponse, ResourceResponse } from "@/types/api";

export const petSightingsApi = {
  /** Lista paginada de avistamentos (ordenada por distancia) */
  list: (filters: PetSightingListFilters, page: number = 1) =>
    api.get<PaginatedResponse<PetSighting>>("/pet-sightings", {
      params: { ...filters, page },
    }),

  /** Avistamentos para o mapa (sem paginacao, com radius_km) */
  listMap: (filters: PetSightingMapFilters) =>
    api.get<PetSighting[]>("/pet-sightings/map", { params: filters }),

  /** Detalhe de um avistamento */
  getDetail: (id: number) =>
    api.get<ResourceResponse<PetSighting>>(`/pet-sightings/${id}`),

  /** Criar avistamento independente */
  create: (data: FormData) =>
    api.post<ResourceResponse<PetSighting>>("/pet-sightings", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /** Excluir avistamento */
  delete: (id: number) => api.delete(`/pet-sightings/${id}`),

  /** Listar avistamentos do usuário autenticado */
  listMySightings: (page: number = 1) =>
    api.get<PaginatedResponse<PetSighting>>("/pet-sightings/my", {
      params: { page },
    }),

  /** Clamar avistamento — idempotente */
  claim: (sightingId: number) =>
    api.post<ResourceResponse<SightingClaimResponse>>(
      `/pet-sightings/${sightingId}/claim`,
    ),
};
