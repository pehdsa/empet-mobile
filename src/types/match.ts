import type { PetSighting } from "./pet-sighting";

export type MatchStatus = "PENDING" | "CONFIRMED" | "DISMISSED";

export type MatchAiStatus = "SUCCESS" | "FAILED";

export interface PetMatch {
  id: number;
  reportId: number;
  sightingId: number;
  baseScore: number;
  finalScore: number;
  aiStatus: MatchAiStatus | null;
  aiSummary: string | null;
  distanceMeters: number;
  status: MatchStatus;
  sighting: PetSighting;
  isSightingDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
