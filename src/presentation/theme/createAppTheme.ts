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

/**
 * Design tokens as CSS custom properties, emitted on [data-mica] root via
 * MuiCssBaseline styleOverrides. Values adapt to the resolved theme mode so
 * tokens never hard-force light/dark.
 */

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
            // Token overrides follow the resolved theme (dark/light) so the
            // existing theme toggle keeps working. Base values live in mica.css.
            "--color-bg":
              mode === "dark" ? "#0b0d12" : tokens.backgroundDefault,
            "--color-bg-elevated":
              mode === "dark" ? "#10131b" : tokens.surfaceContainer,
            "--color-surface":
              mode === "dark"
                ? "rgba(21, 24, 34, 0.72)"
                : "rgba(255, 251, 254, 0.72)",
            "--color-surface-hover":
              mode === "dark"
                ? "rgba(33, 38, 52, 0.82)"
                : "rgba(236, 230, 240, 0.82)",
            "--color-border":
              mode === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(29, 27, 32, 0.08)",
            "--color-border-strong":
              mode === "dark"
                ? "rgba(255, 255, 255, 0.14)"
                : "rgba(29, 27, 32, 0.14)",
            "--color-text-primary":
              mode === "dark" ? "#f5f7fb" : tokens.onSurface,
            "--color-text-secondary":
              mode === "dark" ? "#9ca3b3" : tokens.onSurfaceVariant,
            "--color-text-muted":
              mode === "dark" ? "#6d7484" : tokens.outline,
            "--color-accent": mode === "dark" ? "#a78bfa" : "#6750a4",
            "--color-accent-strong":
              mode === "dark" ? "#c4b5fd" : "#4f378b",
            "--color-accent-contrast":
              mode === "dark" ? "#17131f" : "#ffffff",
            "--color-accent-glow":
              mode === "dark"
                ? "rgba(167, 139, 250, 0.38)"
                : "rgba(103, 80, 164, 0.24)",
            "--color-success":
              mode === "dark" ? "#4fd1c5" : "#0f766e",
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
