import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";

export default function SightingSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 items-center justify-center gap-5 px-6">
        <View
          className="h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: "#43A047" }}
        >
          <Check size={40} color="#FFFFFF" />
        </View>

        <Text className="font-montserrat-bold text-xl text-text-primary text-center">
          Obrigado pelo avistamento!
        </Text>

        <Text className="max-w-[300px] text-center font-montserrat text-sm leading-5 text-text-secondary">
          O dono será notificado sobre seu avistamento. Juntos podemos ajudar
          a reencontrar pets perdidos.
        </Text>
      </View>

      <View className="items-center gap-3 px-6 pb-6 pt-4">
        <Pressable
          onPress={() => router.replace("/(tabs)" as never)}
          className="h-[52px] w-full items-center justify-center rounded-[14px] bg-primary active:opacity-80"
        >
          <Text className="font-montserrat-medium text-base text-text-inverse">
            Voltar ao mapa
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
