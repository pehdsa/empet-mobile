export type CharacteristicCategory = "MARKING" | "COAT" | "BEHAVIOR" | "IDENTIFICATION";

export interface Characteristic {
  id: number;
  name: string;
  category: CharacteristicCategory;
}
