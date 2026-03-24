import { useQuery } from "@tanstack/react-query";
import { breedsApi } from "@/services/api/breeds";
import { queryKeys } from "@/constants/query-keys";
import type { PetSpecies } from "@/types/pet";

export function useBreeds(species?: PetSpecies) {
  return useQuery({
    queryKey: species ? queryKeys.breeds.bySpecies(species) : queryKeys.breeds.all,
    queryFn: () => breedsApi.list(species),
    select: (response) => response.data.data,
  });
}
