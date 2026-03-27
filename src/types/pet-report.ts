import type { Pet, PetSpecies, PetSize } from "./pet";

export type PetReportStatus = "LOST" | "FOUND" | "CANCELLED";

export interface PetReport {
  id: number;
  petId: number;
  status: PetReportStatus;
  location: { latitude: number; longitude: number };
  addressHint: string | null;
  description: string | null;
  lostAt: string;
  foundAt: string | null;
  isActive: boolean;
  pet: Pet;
  matchesCount: number;
  distanceMeters?: number;
  createdAt: string;
}

export interface PetReportFilters {
  status?: PetReportStatus;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  species?: PetSpecies;
  size?: PetSize;
  page?: number;
}

/** Filtros para o endpoint /pet-reports/lost/map */
export interface LostReportMapFilters {
  latitude: number;
  longitude: number;
  radius_km?: number;
  species?: PetSpecies;
  size?: PetSize;
}

/** Filtros para o endpoint /pet-reports/lost (lista paginada) */
export interface LostReportListFilters {
  latitude: number;
  longitude: number;
  species?: PetSpecies;
  size?: PetSize;
}
