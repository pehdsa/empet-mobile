import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { petsApi } from "@/services/api/pets";
import { queryKeys } from "@/constants/query-keys";

/** Lista paginada dos pets do usuario (infinite scroll) */
export function usePets() {
  const query = useInfiniteQuery({
    queryKey: queryKeys.pets.list(),
    queryFn: ({ pageParam }) => petsApi.list(pageParam),
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

/** Detalhe de um pet */
export function usePet(id: number | null) {
  return useQuery({
    queryKey: queryKeys.pets.detail(id!),
    queryFn: () => petsApi.getDetail(id!),
    enabled: id !== null,
    select: (r) => r.data.data,
  });
}

/** Criar pet */
export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => petsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
    },
  });
}

/** Atualizar pet */
export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      petsApi.update(id, data),
    onSuccess: (_response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pets.detail(id),
      });
    },
  });
}

/** Excluir pet */
export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => petsApi.delete(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
      queryClient.removeQueries({ queryKey: queryKeys.pets.detail(id) });
    },
  });
}

/** Toggle ativo/inativo */
export function useTogglePetActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => petsApi.toggleActive(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pets.detail(id),
      });
    },
  });
}
