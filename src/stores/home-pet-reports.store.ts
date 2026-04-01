import { create } from "zustand";
import type { PetSpecies, PetSize } from "@/types/pet";

export type HomeViewMode = "map" | "list";

interface HomePetReportsState {
  viewMode: HomeViewMode;
  species: PetSpecies | undefined;
  size: PetSize | undefined;
  setViewMode: (mode: HomeViewMode) => void;
  setSpecies: (species: PetSpecies | undefined) => void;
  setSize: (size: PetSize | undefined) => void;
  resetFilters: () => void;
}

export const useHomePetReportsStore = create<HomePetReportsState>((set) => ({
  viewMode: "list",
  species: undefined,
  size: undefined,
  setViewMode: (viewMode) => set({ viewMode }),
  setSpecies: (species) => set({ species }),
  setSize: (size) => set({ size }),
  resetFilters: () => set({ species: undefined, size: undefined }),
}));
