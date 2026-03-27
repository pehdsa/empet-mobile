import { create } from "zustand";
import type { PetSpecies, PetSize } from "@/types/pet";

interface MapFiltersState {
  species: PetSpecies | undefined;
  size: PetSize | undefined;
  setSpecies: (species: PetSpecies | undefined) => void;
  setSize: (size: PetSize | undefined) => void;
  resetFilters: () => void;
}

export const useMapFiltersStore = create<MapFiltersState>((set) => ({
  species: undefined,
  size: undefined,
  setSpecies: (species) => set({ species }),
  setSize: (size) => set({ size }),
  resetFilters: () => set({ species: undefined, size: undefined }),
}));
