import type { PetSpecies } from "./pet";

export interface Breed {
  id: number;
  name: string;
  species: PetSpecies;
}
