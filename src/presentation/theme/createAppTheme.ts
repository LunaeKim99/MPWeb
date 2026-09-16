import { createTheme, type Theme } from "@mui/material/styles";
import type { ThemePreference } from "@/domain/value-objects/ids.ts";

export const darkTokens = {
  backgroundDefault: "#101114",
  surface: "#191B1F",
  surfaceContainer: "#202328",
  surfaceContainerHigh: "#292C31",
  primary: "#8BE8A8",
  primaryContainer: "#1E5135",
  secondary: "#C8BFFF",
  secondaryContainer: "#463D62",
  onSurface: "#E5E1E9",
  onSurfaceVariant: "#C9C4D0",
  outline: "#938F99",
  error: "#FFB4AB",
};

export const lightTokens = {
  backgroundDefault: "#FEF7FF",
  surface: "#FFFBFE",
  surfaceContainer: "#F3EDF7",
  surfaceContainerHigh: "#ECE6F0",
  primary: "#386A20",
  primaryContainer: "#B8F397",
  secondary: "#625B71",
  secondaryContainer: "#E8DEF8",
  onSurface: "#1D1B20",
  onSurfaceVariant: "#49454F",
  outline: "#79747E",
  error: "#BA1A1A",
};

export function resolveResolvedTheme(theme: ThemePreference): "light" | "dark" {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function createAppTheme(
  themePreference: ThemePreference,
  reduceVisualEffects: boolean,
): Theme {
  const mode = resolveResolvedTheme(themePreference);
  const tokens = mode === "dark" ? darkTokens : lightTokens;

  const base = createTheme({
    palette: {
      mode,
      primary: {
        main: tokens.primary,
        contrastText: mode === "dark" ? "#000000" : "#FFFFFF",
      },
      secondary: { main: tokens.secondary },
      background: { default: tokens.backgroundDefault, paper: tokens.surface },
      error: { main: tokens.error },
      text: { primary: tokens.onSurface, secondary: tokens.onSurfaceVariant },
      divider: tokens.outline + "40",
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: "'Roboto', 'Roboto Flex', system-ui, sans-serif",
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
  });

  return createTheme(base, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ":root": {
            colorScheme: mode,
            "--surface": tokens.surface,
            "--surface-container": tokens.surfaceContainer,
            "--surface-container-high": tokens.surfaceContainerHigh,
            "--on-surface": tokens.onSurface,
            "--on-surface-variant": tokens.onSurfaceVariant,
            "--outline": tokens.outline,
          },
          body: {
            background: tokens.backgroundDefault,
            color: tokens.onSurface,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: reduceVisualEffects
            ? {}
            : {
                transition: base.transitions.create([
                  "background",
                  "box-shadow",
                ]),
              },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none", borderRadius: 20 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 28,
          },
        },
      },
    },
  });
}
