import type { PetSpecies, PetSize, PetSex } from "@/types/pet";
import type { PetReportStatus } from "@/types/pet-report";
import type { MatchStatus } from "@/types/match";
import type { CharacteristicCategory } from "@/types/characteristic";

export const speciesLabel: Record<PetSpecies, string> = {
  DOG: "Cachorro",
  CAT: "Gato",
};

export const sizeLabel: Record<PetSize, string> = {
  SMALL: "Pequeno",
  MEDIUM: "Medio",
  LARGE: "Grande",
};

export const sexLabel: Record<PetSex, string> = {
  MALE: "Macho",
  FEMALE: "Femea",
  UNKNOWN: "Nao informado",
};

export const reportStatusLabel: Record<PetReportStatus, string> = {
  LOST: "Perdido",
  FOUND: "Encontrado",
  CANCELLED: "Cancelado",
};

export const characteristicCategoryLabel: Record<CharacteristicCategory, string> = {
  MARKING: "Marcas",
  COAT: "Pelagem",
  BEHAVIOR: "Comportamento",
  IDENTIFICATION: "Identificacao",
};

export const matchStatusLabel: Record<MatchStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  DISMISSED: "Descartado",
};
