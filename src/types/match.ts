import type { Pet } from "./pet";

export type MatchStatus = "PENDING" | "CONFIRMED" | "DISMISSED";

export interface PetMatch {
  id: number;
  reportId: number;
  matchedPetId: number;
  score: string;
  distanceMeters: string;
  status: MatchStatus;
  matchedPet: Pet;
}
