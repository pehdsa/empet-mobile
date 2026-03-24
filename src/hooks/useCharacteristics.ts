import { useQuery } from "@tanstack/react-query";
import { characteristicsApi } from "@/services/api/characteristics";
import { queryKeys } from "@/constants/query-keys";

export function useCharacteristics() {
  return useQuery({
    queryKey: queryKeys.characteristics.all,
    queryFn: () => characteristicsApi.list(),
    select: (response) => response.data.data,
  });
}
