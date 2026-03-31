import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { petReportsApi } from "@/services/api/pet-reports";
import { queryKeys } from "@/constants/query-keys";
import type {
  PetReport,
  LostReportMapFilters,
  LostReportListFilters,
} from "@/types/pet-report";

type CreatePetReportPayload = {
  pet_id: number;
  latitude: number;
  longitude: number;
  address_hint?: string;
  description?: string;
  lost_at: string;
};

type UpdatePetReportPayload = {
  latitude: number;
  longitude: number;
  address_hint?: string;
  description?: string;
  lost_at: string;
};

type CreateSightingPayload = {
  latitude: number;
  longitude: number;
  address_hint?: string;
  description?: string;
  sighted_at: string;
  share_phone: boolean;
};

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

/** Criar report de pet perdido */
export function useCreatePetReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePetReportPayload) =>
      petReportsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petReports"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
    },
  });
}

/** Atualizar report existente */
export function useUpdatePetReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePetReportPayload }) =>
      petReportsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petReports"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
    },
  });
}

/** Marcar report como encontrado */
export function useMarkPetFound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId }: { reportId: number; petId: number }) =>
      petReportsApi.markFound(reportId),
    onSuccess: (_response, { petId }) => {
      queryClient.invalidateQueries({ queryKey: ["petReports"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pets.detail(petId),
      });
    },
  });
}

/** Criar avistamento */
export function useCreateSighting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      data,
    }: {
      reportId: number;
      data: CreateSightingPayload;
    }) => petReportsApi.createSighting(reportId, data),
    onSuccess: (_response, { reportId }) => {
      // Intencional: invalida apenas o detalhe do report.
      // Sighting afeta primariamente a tela de detalhe. Mapa e lista nao dependem
      // de sightings nesta fase — expandir na Fase 10 se necessario.
      queryClient.invalidateQueries({
        queryKey: queryKeys.petReports.detail(reportId),
      });
    },
  });
}
