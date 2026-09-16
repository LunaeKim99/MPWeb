import { createTheme, type Theme } from "@mui/material/styles";
import type { ThemePreference } from "@/domain/value-objects/ids.ts";

export function resolveResolvedTheme(theme: ThemePreference): "light" | "dark" {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function createAppTheme(
  themePreference: ThemePreference,
  reduceVisualEffects: boolean,
): Theme {
  const mode = resolveResolvedTheme(themePreference);
  const base = createTheme({
    palette: {
      mode,
      ...(mode === "dark"
        ? {
            primary: { main: "#c8bfff" },
            background: { default: "#131218", paper: "#201f25" },
            text: { primary: "#e6e1e9", secondary: "#cac4d0" },
            divider: "rgba(255, 255, 255, 0.12)",
            error: { main: "#ffb4ab" },
          }
        : {
            primary: { main: "#40327a" },
            background: { default: "#fef7ff", paper: "#ffffff" },
            text: { primary: "#1d1b20", secondary: "#49454f" },
            divider: "rgba(0, 0, 0, 0.12)",
            error: { main: "#ba1a1a" },
          }),
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: "system-ui, sans-serif",
    },
  });

  return createTheme(base, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ":root": {
            colorScheme: mode,
          },
          body: {
            background: base.palette.background.default,
            color: base.palette.text.primary,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: reduceVisualEffects
            ? {}
            : {
                transition: base.transitions.create(["background", "box-shadow", "backdrop-filter"]),
              },
        },
      },
    },
  });
}