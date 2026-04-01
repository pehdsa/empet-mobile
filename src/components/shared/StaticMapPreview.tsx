import { View, Text, Pressable, Linking, Platform } from "react-native";
import { MapPin, ExternalLink } from "lucide-react-native";
import { colors } from "@/lib/colors";

interface StaticMapPreviewProps {
  latitude: number;
  longitude: number;
  label?: string;
}

function openInMaps(latitude: number, longitude: number, label?: string) {
  const encodedLabel = encodeURIComponent(label ?? "Localização");
  const url = Platform.select({
    ios: `maps:0,0?q=${encodedLabel}&ll=${latitude},${longitude}`,
    android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`,
  });
  if (url) void Linking.openURL(url);
}

/**
 * Preview estático de localização no mapa — substitui MapView em telas
 * de detalhe para evitar corrupção dos gesture recognizers do MKMapView
 * no iOS quando a tela é desmontada (react-native-screens + RNGH #2688).
 */
export function StaticMapPreview({
  latitude,
  longitude,
  label,
}: StaticMapPreviewProps) {
  return (
    <Pressable
      onPress={() => openInMaps(latitude, longitude, label)}
      className="h-[140px] overflow-hidden rounded-xl border border-border bg-border/10 active:opacity-80"
    >
      <View className="flex-1 items-center justify-center gap-2">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MapPin size={24} color={colors.primary} />
        </View>
        <Text className="font-montserrat-medium text-xs text-text-secondary">
          Toque para abrir no mapa
        </Text>
        <View className="flex-row items-center gap-1">
          <ExternalLink size={10} color={colors.textTertiary} />
          <Text className="font-montserrat text-[10px] text-text-tertiary">
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
