import { View, Text } from "react-native";
import { Dog, Cat } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { speciesLabel, sizeLabel, sexLabel, reportStatusLabel } from "@/constants/enums";
import type { Pet } from "@/types/pet";
import type { PetReportStatus } from "@/types/pet-report";

const STATUS_COLORS: Record<PetReportStatus, { text: string; bg: string }> = {
  LOST: { text: colors.error, bg: "#E5393520" },
  FOUND: { text: colors.success, bg: "#43A04720" },
  CANCELLED: { text: colors.textTertiary, bg: colors.background },
};

interface PetInfoSectionProps {
  pet: Pet;
  status: PetReportStatus;
}

function getBreedLine(pet: Pet): string | null {
  if (!pet.breed) return null;
  if (pet.secondaryBreed) {
    return `${pet.breed.name} • Mix com ${pet.secondaryBreed.name}`;
  }
  return pet.breed.name;
}

export function PetInfoSection({ pet, status }: PetInfoSectionProps) {
  const SpeciesIcon = pet.species === "DOG" ? Dog : Cat;
  const breedLine = getBreedLine(pet);
  const statusColor = STATUS_COLORS[status];

  return (
    <View className="gap-3 rounded-t-2xl bg-surface px-4 py-4">
      {/* Nome + Status badge */}
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 font-montserrat-bold text-[22px] text-text-primary">
          {pet.name}
        </Text>
        <View
          className="ml-2 flex-row items-center gap-1.5 rounded-lg px-2.5 py-[3px]"
          style={{ backgroundColor: statusColor.bg }}
        >
          <View
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: statusColor.text }}
          />
          <Text
            className="font-montserrat-semibold text-xs"
            style={{ color: statusColor.text }}
          >
            {reportStatusLabel[status]}
          </Text>
        </View>
      </View>

      {/* Badges */}
      <View className="flex-row flex-wrap gap-2">
        {/* Especie */}
        <View className="flex-row items-center gap-1 rounded-full bg-background px-2.5 py-1">
          <SpeciesIcon size={14} color={colors.textSecondary} />
          <Text className="font-montserrat-medium text-[13px] text-text-secondary">
            {speciesLabel[pet.species]}
          </Text>
        </View>

        {/* Porte */}
        <View className="items-center rounded-full bg-background px-2.5 py-1">
          <Text className="font-montserrat-medium text-[13px] text-text-secondary">
            {sizeLabel[pet.size]}
          </Text>
        </View>

        {/* Sexo */}
        <View className="items-center rounded-full bg-background px-2.5 py-1">
          <Text className="font-montserrat-medium text-[13px] text-text-secondary">
            {sexLabel[pet.sex]}
          </Text>
        </View>
      </View>

      {/* Raca */}
      {breedLine && (
        <Text className="font-montserrat text-sm text-text-secondary">
          {breedLine}
        </Text>
      )}

      {/* Descricao de raca */}
      {pet.breedDescription && (
        <Text className="font-montserrat text-[13px] italic text-text-tertiary">
          {pet.breedDescription}
        </Text>
      )}

      {/* Cor */}
      {pet.primaryColor && (
        <View className="self-start rounded-full bg-background px-2.5 py-1">
          <Text className="font-montserrat-medium text-[13px] text-text-secondary">
            {pet.primaryColor}
          </Text>
        </View>
      )}
    </View>
  );
}
