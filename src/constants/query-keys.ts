import type { PetSpecies } from "@/types/pet";
import type {
  LostReportMapFilters,
  LostReportListFilters,
} from "@/types/pet-report";

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
    map: (filters: LostReportMapFilters) =>
      ["petReports", "map", filters] as const,
    list: (filters: LostReportListFilters) =>
      ["petReports", "list", filters] as const,
    detail: (id: number) => ["petReports", "detail", id] as const,
  },
} as const;
