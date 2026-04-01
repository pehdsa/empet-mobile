import type { PetSighting } from "./pet-sighting";

export type MatchStatus = "PENDING" | "CONFIRMED" | "DISMISSED";

export interface PetMatch {
  id: number;
  reportId: number;
  sightingId: number;
  score: number;
  distanceMeters: number;
  status: MatchStatus;
  sighting: PetSighting;
  isSightingDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
