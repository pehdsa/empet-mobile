import { View } from "react-native";
import { Dog, Cat } from "lucide-react-native";
import { colors } from "@/lib/colors";
import type { PetSpecies } from "@/types/pet";

interface PetPhotoPlaceholderProps {
  species: PetSpecies;
  iconSize: number;
  className?: string;
}

export function PetPhotoPlaceholder({
  species,
  iconSize,
  className = "",
}: PetPhotoPlaceholderProps) {
  const Icon = species === "DOG" ? Dog : Cat;

  return (
    <View
      className={`items-center justify-center rounded-xl bg-border/30 ${className}`}
    >
      <Icon size={iconSize} color={colors.textTertiary} />
    </View>
  );
}
