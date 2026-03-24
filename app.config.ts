import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Empet",
  slug: "empet",
  scheme: "empet",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#AD4FFF",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.empet.app",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#AD4FFF",
    },
    package: "com.empet.app",
  },
  plugins: ["expo-router", "expo-secure-store", "expo-font", "expo-splash-screen"],
  experiments: {
    typedRoutes: true,
  },
});
