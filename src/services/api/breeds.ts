import { api } from "./client";
import type { Breed } from "@/types/breed";
import type { PetSpecies } from "@/types/pet";

export const breedsApi = {
  list: (species?: PetSpecies) =>
    api.get<{ data: Breed[] }>("/breeds", {
      params: species ? { species } : undefined,
    }),
};
