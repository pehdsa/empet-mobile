import { Animated } from "react-native";
import { Marker } from "react-native-maps";
import { Dog, Cat } from "lucide-react-native";
import { colors } from "@/lib/colors";
import type { PetReport } from "@/types/pet-report";

interface PetMarkerProps {
  report: PetReport;
  selected?: boolean;
  onPress: () => void;
  opacity?: Animated.Value;
}

export function PetMarker({ report, selected, onPress, opacity }: PetMarkerProps) {
  const isDog = report.pet.species === "DOG";
  const markerColor = isDog ? colors.primary : colors.secondary;

  return (
    <Marker
      coordinate={report.location}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <Animated.View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: markerColor,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: selected ? 3 : 0,
          borderColor: "white",
          opacity: opacity ?? 1,
        }}
      >
        {isDog ? (
          <Dog size={18} color={colors.textInverse} />
        ) : (
          <Cat size={18} color={colors.textInverse} />
        )}
      </Animated.View>
    </Marker>
  );
}
