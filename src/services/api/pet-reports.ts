import { api } from "./client";
import type {
  PetReport,
  LostReportMapFilters,
  LostReportListFilters,
} from "@/types/pet-report";
import type { ReportSighting } from "@/types/sighting";
import type { PaginatedResponse, ResourceResponse } from "@/types/api";

export const petReportsApi = {
  /** Lista reports LOST para o mapa (sem paginacao, com radius_km) */
  listLostMap: (filters: LostReportMapFilters) =>
    api.get<PetReport[]>("/pet-reports/lost/map", { params: filters }),

  /** Lista reports LOST paginada (infinite scroll, com distanceMeters) */
  listLost: (filters: LostReportListFilters, page: number = 1) =>
    api.get<PaginatedResponse<PetReport>>("/pet-reports/lost", {
      params: { ...filters, page },
    }),

  /** Detalhe publico de um report (Fase 7) */
  getDetail: (id: number) =>
    api.get<ResourceResponse<PetReport>>(`/pet-reports/${id}/detail`),

  /** Criar report de pet perdido */
  create: (data: {
    pet_id: number;
    latitude: number;
    longitude: number;
    address_hint?: string;
    description?: string;
    lost_at: string;
  }) => api.post<ResourceResponse<PetReport>>("/pet-reports", data),

  /** Atualizar report existente */
  update: (
    id: number,
    data: {
      latitude: number;
      longitude: number;
      address_hint?: string;
      description?: string;
      lost_at: string;
    },
  ) => api.put<ResourceResponse<PetReport>>(`/pet-reports/${id}`, data),

  /** Marcar report como encontrado */
  markFound: (id: number) =>
    api.patch<ResourceResponse<PetReport>>(`/pet-reports/${id}/found`),

  /** Criar avistamento */
  createSighting: (
    reportId: number,
    data: {
      latitude: number;
      longitude: number;
      address_hint?: string;
      description?: string;
      sighted_at: string;
      share_phone: boolean;
    },
  ) =>
    api.post<ResourceResponse<ReportSighting>>(
      `/pet-reports/${reportId}/sightings`,
      data,
    ),
};
