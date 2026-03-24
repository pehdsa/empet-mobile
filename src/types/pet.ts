import type { Breed } from "./breed";
import type { Characteristic } from "./characteristic";

export type PetSpecies = "DOG" | "CAT";
export type PetSize = "SMALL" | "MEDIUM" | "LARGE";
export type PetSex = "MALE" | "FEMALE" | "UNKNOWN";

export interface Pet {
  id: number;
  name: string;
  species: PetSpecies;
  size: PetSize;
  sex: PetSex;
  primaryColor: string | null;
  breedDescription: string | null;
  notes: string | null;
  isActive: boolean;
  breed: Breed | null;
  secondaryBreed: Breed | null;
  photos: PetPhoto[];
  characteristics: Characteristic[];
}

export interface PetPhoto {
  id: number;
  url: string;
  position: number;
}
