import type { Pet } from "./pet";
import type { PetSpecies, PetSize } from "./pet";

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
