import "@/styles/global.css";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { AppProviders } from "@/providers/AppProviders";
import { AuthProvider } from "@/providers/AuthProvider";

// Chamado fora do componente intencionalmente — executa uma unica vez no carregamento do modulo.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppProviders>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </AppProviders>
  );
}
