import { View, Text } from "react-native";
import { Marker } from "react-native-maps";


interface MarkerClusterProps {
  coordinate: { latitude: number; longitude: number };
  count: number;
  onPress: () => void;
}

export function MarkerCluster({ coordinate, count, onPress }: MarkerClusterProps) {
  return (
    <Marker
      coordinate={coordinate}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
        <Text className="font-montserrat-semibold text-xs text-text-inverse">
          {count > 99 ? "99+" : `${count}+`}
        </Text>
      </View>
    </Marker>
  );
}
