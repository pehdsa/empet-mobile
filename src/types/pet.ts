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
  activeReportId: number | null;
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

/** Estado de uma foto no formulario (misto: existente do backend + nova local) */
export interface PhotoFormItem {
  /** ID estavel para render key: "existing-{id}" ou "local-{uri}" */
  id: string;
  /** Foto existente do backend */
  existing?: PetPhoto;
  /** Nova foto escolhida localmente (ImagePicker asset) */
  local?: { uri: string; mimeType: string; fileName: string };
}
