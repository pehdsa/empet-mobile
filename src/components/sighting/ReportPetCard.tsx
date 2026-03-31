import { View, Text, Image } from "react-native";
import { speciesLabel, sizeLabel } from "@/constants/enums";
import type { Pet } from "@/types/pet";

interface ReportPetCardProps {
  pet: Pet;
}

export function ReportPetCard({ pet }: ReportPetCardProps) {
  const photoUrl = pet.photos?.[0]?.url;

  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-border bg-surface p-3">
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          className="h-12 w-12 rounded-xl"
          resizeMode="cover"
        />
      ) : (
        <View className="h-12 w-12 items-center justify-center rounded-xl bg-background">
          <Text className="font-montserrat-medium text-lg text-text-tertiary">
            {pet.name.charAt(0)}
          </Text>
        </View>
      )}

      <View className="flex-1 gap-0.5">
        <Text className="font-montserrat-medium text-sm text-text-primary">
          {pet.name}
        </Text>
        <Text className="font-montserrat text-[13px] text-text-secondary">
          {speciesLabel[pet.species]} · {sizeLabel[pet.size]}
        </Text>
      </View>
    </View>
  );
}
