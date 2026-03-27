import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { petReportsApi } from "@/services/api/pet-reports";
import { queryKeys } from "@/constants/query-keys";
import type { PetReport, LostReportFilters } from "@/types/pet-report";

export function useLostReports(filters: LostReportFilters) {
  return useQuery({
    queryKey: queryKeys.petReports.map(filters),
    queryFn: () => petReportsApi.listLost(filters),
    select: (r) => {
      const payload = r.data;
      return Array.isArray(payload) ? payload : (payload as { data: PetReport[] }).data;
    },
    placeholderData: keepPreviousData,
  });
}
