import { CssBaseline, ThemeProvider } from "@mui/material";
import { useEffect, useMemo, type ReactNode } from "react";
import { useSettingsStore } from "@/presentation/stores/settingsStore.ts";
import { createAppTheme } from "@/presentation/theme/createAppTheme.ts";
import { usePlaybackShortcuts } from "@/presentation/hooks/usePlaybackShortcuts.ts";
import { usePlayerSync } from "@/presentation/hooks/usePlayerSync.ts";

export function AppProviders({ children }: { children: ReactNode }) {
  const settings = useSettingsStore((state) => state.settings);
  const loadSettings = useSettingsStore((state) => state.load);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  usePlaybackShortcuts(true);
  usePlayerSync();

  const theme = useMemo(
    () => createAppTheme(settings.theme, settings.reduceVisualEffects),
    [settings.theme, settings.reduceVisualEffects],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        className="app-shell"
        data-mica={settings.micaEnabled ? "true" : "false"}
        data-reduce-motion={settings.reduceVisualEffects ? "true" : "false"}
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {children}
      </div>
    </ThemeProvider>
  );
}

export default AppProviders;
