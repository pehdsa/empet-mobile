import type { Characteristic } from "./characteristic";
import type { PetSpecies, PetSize, PetSex } from "./pet";

export interface PetSightingPhoto {
  id: number;
  url: string;
  position: number;
}

export interface PetSightingBreed {
  id: number;
  name: string;
  species: PetSpecies;
}

export interface PetSightingUser {
  id: number;
  name: string;
  avatarUrl: string | null;
}

export interface PetSighting {
  id: number;
  userId: number;
  title: string;
  species: PetSpecies;
  size: PetSize | null;
  sex: PetSex | null;
  color: string | null;
  breed: PetSightingBreed | null;
  photos: PetSightingPhoto[];
  characteristics: Characteristic[];
  location: { latitude: number; longitude: number };
  addressHint: string | null;
  description: string | null;
  sightedAt: string;
  sharePhone: boolean;
  contactPhone: string | null;
  user: PetSightingUser;
  distanceMeters?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SightingOwner {
  name: string;
  phone: string | null;
  phoneIsWhatsapp: boolean | null;
}

export interface SightingClaimResponse {
  sightingId: number;
  sightingOwner: SightingOwner;
}

/** Filtros para GET /pet-sightings/map (sem paginacao, com radius_km) */
export interface PetSightingMapFilters {
  latitude: number;
  longitude: number;
  radius_km?: number;
  species?: PetSpecies;
  size?: PetSize;
}

/** Filtros para GET /pet-sightings (lista paginada, sem radius_km) */
export interface PetSightingListFilters {
  latitude: number;
  longitude: number;
  species?: PetSpecies;
  size?: PetSize;
}
