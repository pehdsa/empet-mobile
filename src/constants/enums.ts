import type { PetSpecies, PetSize, PetSex } from "@/types/pet";
import type { PetReportStatus } from "@/types/pet-report";
import type { MatchStatus } from "@/types/match";
import type { CharacteristicCategory } from "@/types/characteristic";
import type { NotificationType } from "@/types/notification";

export const speciesLabel: Record<PetSpecies, string> = {
  DOG: "Cachorro",
  CAT: "Gato",
};

export const sizeLabel: Record<PetSize, string> = {
  SMALL: "Pequeno",
  MEDIUM: "Médio",
  LARGE: "Grande",
};

export const sexLabel: Record<PetSex, string> = {
  MALE: "Macho",
  FEMALE: "Fêmea",
  UNKNOWN: "Não informado",
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
  IDENTIFICATION: "Identificação",
};

export const matchStatusLabel: Record<MatchStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  DISMISSED: "Descartado",
};

export const notificationTypeLabel: Record<NotificationType, string> = {
  pet_lost_nearby: "Pet perdido por perto",
  matches_found: "Matches encontrados",
  pet_report_sighting_reported: "Avistamento do seu pet",
  pet_sighting_claimed: "Alguém reconheceu seu avistamento",
};
