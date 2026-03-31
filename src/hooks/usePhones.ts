import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { phonesApi } from "@/services/api/phones";
import { queryKeys } from "@/constants/query-keys";

export function useUserPhones() {
  return useQuery({
    queryKey: queryKeys.phones.all,
    queryFn: () => phonesApi.list(),
    select: (r) => {
      const payload = r.data;
      return Array.isArray(payload)
        ? payload
        : (payload as { data: typeof payload }).data;
    },
  });
}

export function useCreatePhone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      phone: string;
      is_whatsapp?: boolean;
      label?: string;
    }) => phonesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.phones.all });
    },
  });
}

export function useUpdatePhone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { phone?: string; is_whatsapp?: boolean; label?: string };
    }) => phonesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.phones.all });
    },
  });
}

export function useDeletePhone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => phonesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.phones.all });
    },
  });
}
