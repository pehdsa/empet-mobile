import {
  useQuery,
  useInfiniteQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import { petReportsApi } from "@/services/api/pet-reports";
import { queryKeys } from "@/constants/query-keys";
import type {
  PetReport,
  LostReportMapFilters,
  LostReportListFilters,
} from "@/types/pet-report";

/** Hook para reports no mapa (sem paginacao, com radius_km) */
export function useLostReportsMap(filters: LostReportMapFilters) {
  return useQuery({
    queryKey: queryKeys.petReports.map(filters),
    queryFn: () => petReportsApi.listLostMap(filters),
    select: (r) => {
      const payload = r.data;
      return Array.isArray(payload) ? payload : (payload as { data: PetReport[] }).data;
    },
    placeholderData: keepPreviousData,
  });
}

/** Hook para reports em lista (paginado, infinite scroll) */
export function useLostReportsList(filters: LostReportListFilters) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.petReports.list(filters),
    queryFn: ({ pageParam }) => petReportsApi.listLost(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data.meta;
      return meta.current_page < meta.last_page ? meta.current_page + 1 : undefined;
    },
  });

  const items = query.data?.pages.flatMap((page) => page.data.data) ?? [];

  return { ...query, items };
}

/** Hook para detalhe de um report */
export function usePetReportDetail(id: number | null) {
  return useQuery({
    queryKey: queryKeys.petReports.detail(id!),
    queryFn: () => petReportsApi.getDetail(id!),
    enabled: id !== null,
    select: (r) => r.data.data,
  });
}
