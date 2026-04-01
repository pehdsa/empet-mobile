import { create } from "zustand";
import type { PetSpecies, PetSize } from "@/types/pet";

export type SightingsViewMode = "map" | "list";

interface SightingsFeedState {
  viewMode: SightingsViewMode;
  species: PetSpecies | undefined;
  size: PetSize | undefined;
  setViewMode: (mode: SightingsViewMode) => void;
  setSpecies: (species: PetSpecies | undefined) => void;
  setSize: (size: PetSize | undefined) => void;
  resetFilters: () => void;
}

export const useSightingsFeedStore = create<SightingsFeedState>((set) => ({
  viewMode: "list",
  species: undefined,
  size: undefined,
  setViewMode: (viewMode) => set({ viewMode }),
  setSpecies: (species) => set({ species }),
  setSize: (size) => set({ size }),
  resetFilters: () => set({ species: undefined, size: undefined }),
}));
