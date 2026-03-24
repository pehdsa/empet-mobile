import type { PetSpecies } from "@/types/pet";

export const queryKeys = {
  auth: {
    user: ["auth", "user"] as const,
  },
  breeds: {
    all: ["breeds"] as const,
    bySpecies: (species: PetSpecies) => ["breeds", species] as const,
  },
  characteristics: {
    all: ["characteristics"] as const,
  },
} as const;
