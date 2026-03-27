import type { CharacteristicCategory } from "@/types/characteristic";

/** Mapeamento de icone lucide por categoria de caracteristica */
export const characteristicCategoryIcon: Record<CharacteristicCategory, string> = {
  MARKING: "target",
  COAT: "paintbrush",
  BEHAVIOR: "heart",
  IDENTIFICATION: "tag",
};
