import { api } from "./client";
import type { MatchStatus, PetMatch } from "@/types/match";
import type { ResourceResponse } from "@/types/api";

export const matchesApi = {
  list: (reportId: number, status?: MatchStatus) =>
    api.get<ResourceResponse<PetMatch[]>>(
      `/pet-reports/${reportId}/matches`,
      { params: { status } },
    ),
  confirm: (reportId: number, matchId: number) =>
    api.patch<ResourceResponse<PetMatch>>(
      `/pet-reports/${reportId}/matches/${matchId}/confirm`,
    ),
  dismiss: (reportId: number, matchId: number) =>
    api.patch<ResourceResponse<PetMatch>>(
      `/pet-reports/${reportId}/matches/${matchId}/dismiss`,
    ),
};
