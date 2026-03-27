import { View, Text } from "react-native";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { Chip } from "@/components/ui/Chip";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import { useHomePetReportsStore } from "@/stores/home-pet-reports.store";
import { speciesLabel, sizeLabel } from "@/constants/enums";
import type { PetSpecies, PetSize } from "@/types/pet";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

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

export function FilterModal({ visible, onClose }: FilterModalProps) {
  const { species, size, setSpecies, setSize, resetFilters } =
    useHomePetReportsStore();

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Filtros">
      {/* Espécie */}
      <Text className="mb-3 font-montserrat-semibold text-sm text-text-primary">
        Especie
      </Text>
      <View className="mb-6 flex-row gap-2">
        {speciesOptions.map((opt) => (
          <Chip
            key={opt.label}
            label={opt.label}
            active={species === opt.value}
            onPress={() => setSpecies(opt.value)}
          />
        ))}
      </View>

      {/* Porte */}
      <Text className="mb-3 font-montserrat-semibold text-sm text-text-primary">
        Porte
      </Text>
      <View className="mb-8 flex-row gap-2">
        {sizeOptions.map((opt) => (
          <Chip
            key={opt.label}
            label={opt.label}
            active={size === opt.value}
            onPress={() => setSize(opt.value)}
          />
        ))}
      </View>

      {/* Actions */}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <ButtonSecondary label="Limpar" onPress={resetFilters} />
        </View>
        <View className="flex-1">
          <ButtonPrimary label="Aplicar" onPress={onClose} />
        </View>
      </View>
    </BottomSheetModal>
  );
}
