import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { petSightingsApi } from "@/services/api/pet-sightings";
import { queryKeys } from "@/constants/query-keys";
import type {
  PetSighting,
  PetSightingMapFilters,
  PetSightingListFilters,
} from "@/types/pet-sighting";

/** Avistamentos para o mapa (sem paginacao) */
export function usePetSightingsMap(filters: PetSightingMapFilters) {
  return useQuery({
    queryKey: queryKeys.petSightings.map(filters),
    queryFn: () => petSightingsApi.listMap(filters),
    select: (r) => {
      const payload = r.data;
      return Array.isArray(payload)
        ? payload
        : (payload as { data: PetSighting[] }).data;
    },
    placeholderData: keepPreviousData,
  });
}

/** Avistamentos em lista (paginado, infinite scroll) */
export function usePetSightingsList(filters: PetSightingListFilters) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.petSightings.list(filters),
    queryFn: ({ pageParam }) => petSightingsApi.list(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data.meta;
      return meta.current_page < meta.last_page
        ? meta.current_page + 1
        : undefined;
    },
  });

  const items = query.data?.pages.flatMap((page) => page.data.data) ?? [];

  return { ...query, items };
}

/** Detalhe de um avistamento */
export function usePetSightingDetail(id: number | null) {
  return useQuery({
    queryKey: queryKeys.petSightings.detail(id!),
    queryFn: () => petSightingsApi.getDetail(id!),
    select: (r) => r.data.data,
    enabled: id !== null,
  });
}

/** Criar avistamento independente */
export function useCreatePetSighting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => petSightingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.petSightings.all });
    },
  });
}

/** Excluir avistamento */
export function useDeletePetSighting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => petSightingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.petSightings.all });
    },
  });
}
