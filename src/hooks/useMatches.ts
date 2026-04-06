import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchesApi } from "@/services/api/matches";
import { queryKeys } from "@/constants/query-keys";
import type { MatchStatus } from "@/types/match";

/** Lista matches de um report, opcionalmente filtrados por status.
 *  O select normaliza baseScore, finalScore e distanceMeters de string → number
 *  (API retorna decimal cast como string). */
export function useMatches(reportId: number | null, status?: MatchStatus) {
  return useQuery({
    queryKey: queryKeys.matches.byReport(reportId!, status),
    queryFn: () => matchesApi.list(reportId!, status),
    enabled: reportId != null,
    select: (r) =>
      r.data.data.map((m) => ({
        ...m,
        baseScore: Number(m.baseScore),
        finalScore: Number(m.finalScore),
        distanceMeters: Number(m.distanceMeters),
      })),
  });
}

/** Confirmar match — report vira FOUND, invalida matches + petReports */
export function useConfirmMatch() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, matchId }: { reportId: number; matchId: number }) =>
      matchesApi.confirm(reportId, matchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["petReports"] });
      qc.invalidateQueries({ queryKey: ["pets"] });
    },
  });
}

/** Dismiss match — invalida todas as tabs de matches */
export function useDismissMatch() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, matchId }: { reportId: number; matchId: number }) =>
      matchesApi.dismiss(reportId, matchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}
