import type { PetSpecies } from "@/types/pet";
import type {
  LostReportMapFilters,
  LostReportListFilters,
} from "@/types/pet-report";
import type {
  PetSightingMapFilters,
  PetSightingListFilters,
} from "@/types/pet-sighting";
import type { MatchStatus } from "@/types/match";

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
  pets: {
    all: ["pets"] as const,
    list: () => ["pets", "list"] as const,
    detail: (id: number) => ["pets", "detail", id] as const,
  },
  petReports: {
    map: (filters: LostReportMapFilters) =>
      ["petReports", "map", filters] as const,
    list: (filters: LostReportListFilters) =>
      ["petReports", "list", filters] as const,
    detail: (id: number) => ["petReports", "detail", id] as const,
  },
  phones: {
    all: ["phones"] as const,
  },
  sightings: {
    byReport: (reportId: number) =>
      ["sightings", "byReport", reportId] as const,
  },
  petSightings: {
    all: ["petSightings"] as const,
    map: (filters: PetSightingMapFilters) =>
      ["petSightings", "map", filters] as const,
    list: (filters: PetSightingListFilters) =>
      ["petSightings", "list", filters] as const,
    detail: (id: number) => ["petSightings", "detail", id] as const,
  },
  matches: {
    byReport: (reportId: number, status?: MatchStatus) =>
      ["matches", "byReport", reportId, status] as const,
  },
} as const;
