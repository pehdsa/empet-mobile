import { api } from "./client";
import type {
  PetReport,
  LostReportMapFilters,
  LostReportListFilters,
} from "@/types/pet-report";
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
};
