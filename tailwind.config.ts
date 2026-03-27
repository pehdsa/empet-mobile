import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#AD4FFF",
          light: "#C98AFF",
          dark: "#8A2BE2",
        },
        secondary: {
          DEFAULT: "#FFA001",
          light: "#FFBE4D",
          dark: "#CC8000",
        },
        text: {
          primary: "#313233",
          secondary: "#6B6C6D",
          tertiary: "#9B9C9D",
          inverse: "#FFFFFF",
        },
        background: "#F8F8F8",
        surface: "#FFFFFF",
        border: "#E2E2E2",
        error: "#E53935",
        success: "#43A047",
        whatsapp: "#25D366",
      },
      fontFamily: {
        montserrat: ["Montserrat_400Regular"],
        "montserrat-medium": ["Montserrat_500Medium"],
        "montserrat-semibold": ["Montserrat_600SemiBold"],
        "montserrat-bold": ["Montserrat_700Bold"],
      },
      boxShadow: {
        soft: "0 2px 8px 0 rgba(0, 0, 0, 0.08)",
        "soft-lg": "0 4px 16px 0 rgba(0, 0, 0, 0.10)",
      },
    },
  },
  plugins: [],
} satisfies Config;
