import type { PetSpecies } from "@/types/pet";
import type { LostReportFilters } from "@/types/pet-report";

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
  petReports: {
    map: (filters: LostReportFilters) => ["petReports", "map", filters] as const,
  },
} as const;
