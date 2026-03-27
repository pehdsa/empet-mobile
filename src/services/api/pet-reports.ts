import { api } from "./client";
import type { PetReport, LostReportFilters } from "@/types/pet-report";

export const petReportsApi = {
  /** Lista reports LOST de todos os usuarios (mapa) */
  listLost: (filters: LostReportFilters) =>
    api.get<PetReport[]>("/pet-reports/lost", { params: filters }),

  /** Detalhe publico de um report (Fase 7) */
  getDetail: (id: number) =>
    api.get<PetReport>(`/pet-reports/${id}/detail`),
};
