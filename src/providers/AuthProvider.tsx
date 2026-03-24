import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "@/stores/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, hasHydrated, hydrate } = useAuthStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hasHydrated) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (isAuthenticated && !inTabsGroup) {
      router.replace("/(tabs)");
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/welcome");
    }

    void SplashScreen.hideAsync();
  }, [hasHydrated, isAuthenticated, segments, router]);

  if (!hasHydrated) {
    return null;
  }

  return <>{children}</>;
}
