import { useRef, useEffect } from "react";
import { Animated } from "react-native";
import { Marker } from "react-native-maps";
import { Dog, Cat } from "lucide-react-native";
import { colors } from "@/lib/colors";
import type { PetReport } from "@/types/pet-report";

interface PetMarkerProps {
  report: PetReport;
  selected?: boolean;
  onPress: () => void;
  delay?: number;
}

export function PetMarker({ report, selected, onPress, delay = 0 }: PetMarkerProps) {
  const isDog = report.pet.species === "DOG";
  const markerColor = isDog ? colors.primary : colors.secondary;

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });
  const animatedOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Marker
      coordinate={report.location}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges
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
          opacity: animatedOpacity,
          transform: [{ translateY }],
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
