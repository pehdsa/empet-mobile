import React, { useRef, useCallback } from "react";
import { View, type ViewStyle } from "react-native";
import MapView, { type Region } from "react-native-maps";
import { MapPin } from "lucide-react-native";
import { DEFAULT_LOCATION } from "@/constants/defaults";
import { colors } from "@/lib/colors";

interface MapPickerInlineProps {
  initialRegion?: Region;
  onRegionChange: (coords: { latitude: number; longitude: number }) => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  height?: number;
}

/**
 * Mapa inline com pin fixo no centro. Semi-controlado:
 * - initialRegion usado apenas no mount
 * - Nao tenta sincronizar de volta depois
 * - A tela recebe coordenadas via onRegionChange e as armazena em useState local
 * - onTouchStart/onTouchEnd permitem ao pai desabilitar scroll enquanto o mapa é arrastado
 */
export function MapPickerInline({
  initialRegion,
  onRegionChange,
  onTouchStart,
  onTouchEnd,
  height = 200,
}: MapPickerInlineProps) {
  const mapRef = useRef<MapView>(null);

  const region = initialRegion ?? {
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    latitudeDelta: DEFAULT_LOCATION.latitudeDelta,
    longitudeDelta: DEFAULT_LOCATION.longitudeDelta,
  };

  const handleRegionChangeComplete = useCallback(
    (r: Region) => {
      onRegionChange({ latitude: r.latitude, longitude: r.longitude });
    },
    [onRegionChange],
  );

  return (
    <View
      className="overflow-hidden rounded-xl border border-border"
      style={{ height }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <MapView
        ref={mapRef}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
      />

      {/* Pin fixo no centro */}
      <View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center"
      >
        <View className="items-center" style={{ marginTop: -31 }}>
          <View
            className="items-center justify-center rounded-full border-[3px] border-primary bg-white"
            style={[ringStyle, ringShadowStyle]}
          >
            <View className="h-8 w-8 items-center justify-center rounded-2xl bg-primary">
              <MapPin size={18} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          </View>
          <View
            className="bg-primary"
            style={pinTipStyle}
          />
        </View>
      </View>
    </View>
  );
}

const ringStyle: ViewStyle = {
  width: 44,
  height: 44,
};

const ringShadowStyle: ViewStyle = {
  width: 44,
  height: 44,
  shadowColor: colors.primary,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 6,
};

const pinTipStyle: ViewStyle = {
  width: 12,
  height: 12,
  transform: [{ rotate: "45deg" }],
  marginTop: -7,
};
