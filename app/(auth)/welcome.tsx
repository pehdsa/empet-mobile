import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";

export default function Welcome() {
  const router = useRouter();

  return (
    <Screen scroll={false}>
      <View className="flex-1 items-center justify-center gap-2">
        <Text className="font-montserrat-bold text-4xl text-primary">Empet</Text>
        <Text className="font-montserrat text-base text-text-secondary">
          Reencontre seu pet
        </Text>
      </View>

      <View className="gap-3 pb-8">
        <ButtonPrimary label="Entrar" onPress={() => router.push("/(auth)/login")} />
        <ButtonSecondary label="Criar conta" onPress={() => router.push("/(auth)/register")} />
      </View>
    </Screen>
  );
}
