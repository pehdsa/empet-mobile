import { useRef, useEffect } from "react";
import { Animated } from "react-native";
import { Marker } from "react-native-maps";
import { Dog, Cat } from "lucide-react-native";
import { colors } from "@/lib/colors";
import type { PetSighting } from "@/types/pet-sighting";

interface SightingMarkerProps {
  sighting: PetSighting;
  selected?: boolean;
  onPress: () => void;
  delay?: number;
}

export function SightingMarker({ sighting, selected, onPress, delay = 0 }: SightingMarkerProps) {
  const isDog = sighting.species === "DOG";
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
      coordinate={sighting.location}
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
