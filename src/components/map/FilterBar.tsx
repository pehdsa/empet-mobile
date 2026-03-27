import { ScrollView } from "react-native";
import { Chip } from "@/components/ui/Chip";
import { useHomePetReportsStore } from "@/stores/home-pet-reports.store";
import { speciesLabel, sizeLabel } from "@/constants/enums";
import type { PetSpecies, PetSize } from "@/types/pet";

const speciesOptions: { value: PetSpecies | undefined; label: string }[] = [
  { value: undefined, label: "Todos" },
  ...Object.entries(speciesLabel).map(([value, label]) => ({
    value: value as PetSpecies,
    label,
  })),
];

const sizeOptions: { value: PetSize | undefined; label: string }[] = [
  { value: undefined, label: "Todos" },
  ...Object.entries(sizeLabel).map(([value, label]) => ({
    value: value as PetSize,
    label,
  })),
];

export function FilterBar() {
  const { species, size, setSpecies, setSize } = useHomePetReportsStore();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4"
      contentContainerClassName="gap-2 py-2"
    >
      {speciesOptions.map((opt) => (
        <Chip
          key={opt.label}
          label={opt.label}
          active={species === opt.value}
          onPress={() => setSpecies(opt.value)}
        />
      ))}
      {sizeOptions.map((opt) => (
        <Chip
          key={opt.label}
          label={opt.label}
          active={size === opt.value}
          onPress={() => setSize(opt.value)}
        />
      ))}
    </ScrollView>
  );
}
