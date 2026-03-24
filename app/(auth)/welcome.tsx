import { View, Text } from "react-native";

export default function Welcome() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="font-montserrat-bold text-2xl text-primary">Empet</Text>
      <Text className="font-montserrat mt-2 text-base text-gray-500">Bem-vindo</Text>
    </View>
  );
}
