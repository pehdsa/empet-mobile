import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config";

const fullConfig = resolveConfig(tailwindConfig);
const themeColors = fullConfig.theme.colors;

export const colors = {
  primary: themeColors.primary.DEFAULT,
  primaryLight: themeColors.primary.light,
  primaryDark: themeColors.primary.dark,
  secondary: themeColors.secondary.DEFAULT,
  textPrimary: themeColors.text.primary,
  textSecondary: themeColors.text.secondary,
  textTertiary: themeColors.text.tertiary,
  textInverse: themeColors.text.inverse,
  background: themeColors.background,
  surface: themeColors.surface,
  border: themeColors.border,
  error: themeColors.error,
  success: themeColors.success,
} as const;
