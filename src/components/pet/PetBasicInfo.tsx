import { View, Text } from "react-native";
import { Dog, Cat } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { speciesLabel, sizeLabel, sexLabel } from "@/constants/enums";
import type { Pet } from "@/types/pet";

interface PetBasicInfoProps {
  pet: Pet;
}

function getBreedLine(pet: Pet): string | null {
  if (!pet.breed) return null;
  if (pet.secondaryBreed) {
    return `${pet.breed.name} · Mix com ${pet.secondaryBreed.name}`;
  }
  return pet.breed.name;
}

export function PetBasicInfo({ pet }: PetBasicInfoProps) {
  const SpeciesIcon = pet.species === "DOG" ? Dog : Cat;
  const breedLine = getBreedLine(pet);

  return (
    <View className="gap-3 rounded-t-2xl bg-surface px-6 py-6">
      {/* Nome + badge seguro/perdido */}
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 font-montserrat-bold text-[22px] text-text-primary">
          {pet.name}
        </Text>
        {pet.activeReportId ? (
          <View
            className="ml-2 flex-row items-center gap-1.5 rounded-lg px-2.5 py-[3px]"
            style={{ backgroundColor: "#E5393515" }}
          >
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: "#E53935" }} />
            <Text className="font-montserrat-semibold text-xs" style={{ color: "#E53935" }}>
              Perdido
            </Text>
          </View>
        ) : (
          <View
            className="ml-2 flex-row items-center gap-1.5 rounded-xl px-3 py-1"
            style={{ backgroundColor: "#43A04715" }}
          >
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: "#43A047" }} />
            <Text className="font-montserrat-semibold text-xs" style={{ color: "#43A047" }}>
              Seguro
            </Text>
          </View>
        )}
      </View>

      {/* Badges */}
      <View className="flex-row flex-wrap gap-2">
        <View className="flex-row items-center gap-1 rounded-full bg-background px-2.5 py-1">
          <SpeciesIcon size={14} color={colors.textSecondary} />
          <Text className="font-montserrat-medium text-[13px] text-text-secondary">
            {speciesLabel[pet.species]}
          </Text>
        </View>
        <View className="items-center rounded-full bg-background px-2.5 py-1">
          <Text className="font-montserrat-medium text-[13px] text-text-secondary">
            {sizeLabel[pet.size]}
          </Text>
        </View>
        <View className="items-center rounded-full bg-background px-2.5 py-1">
          <Text className="font-montserrat-medium text-[13px] text-text-secondary">
            {sexLabel[pet.sex]}
          </Text>
        </View>
      </View>

      {/* Raca */}
      {breedLine ? (
        <Text className="font-montserrat text-sm text-text-secondary">{breedLine}</Text>
      ) : (
        <Text className="font-montserrat text-sm text-text-tertiary">Sem raça definida</Text>
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
