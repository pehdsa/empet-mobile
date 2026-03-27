import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function PetReportDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="font-montserrat-bold text-2xl text-primary">
        Report #{id}
      </Text>
    </View>
  );
}
