import { View, Text, Pressable } from "react-native";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { Chip } from "@/components/ui/Chip";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { useSightingsFeedStore } from "@/stores/sightings-feed.store";
import { speciesLabel, sizeLabel } from "@/constants/enums";
import type { PetSpecies, PetSize } from "@/types/pet";

interface SightingsFilterModalProps {
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

export function SightingsFilterModal({ visible, onClose }: SightingsFilterModalProps) {
  const { species, size, setSpecies, setSize, resetFilters } =
    useSightingsFeedStore();

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Filtros">
      {/* Espécie */}
      <Text className="mb-3 font-montserrat-semibold text-sm text-text-primary">
        Espécie
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
      <View className="gap-3">
        <ButtonPrimary label="Aplicar" onPress={onClose} />
        <Pressable onPress={resetFilters} className="items-center py-1 active:opacity-60">
          <Text className="font-montserrat-medium text-sm text-text-secondary">
            Limpar
          </Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}
