import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useSettingsStore } from "@/presentation/stores/settingsStore.ts";
import { getContainer } from "@/di/container.ts";
import { ConfirmDialog } from "@/presentation/components/common/ConfirmDialog.tsx";

const THEME_OPTIONS = [
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
] as const;

const EQUALIZER_PRESETS = ["flat", "bass", "treble", "vocal", "rock"] as const;

export function SettingsPage() {
  const { settings, status, load, update } = useSettingsStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  if (status !== "ready") {
    return (
      <Typography>
        {status === "error" ? "Settings failed to load" : "Loading\u2026"}
      </Typography>
    );
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 640, mx: "auto", width: "100%" }}>
      <Typography variant="h5">Settings</Typography>

      {feedback && <Alert severity="success">{feedback}</Alert>}

      <TextField
        select
        label="Theme"
        value={settings.theme}
        onChange={(e) =>
          void update({
            theme: e.target.value as (typeof THEME_OPTIONS)[number]["value"],
          })
        }
        fullWidth
      >
        {THEME_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={settings.micaEnabled}
              onChange={(e) =>
                void update({ micaEnabled: e.target.checked })
              }
            />
          }
          label="Mica / translucency"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.reduceVisualEffects}
              onChange={(e) =>
                void update({ reduceVisualEffects: e.target.checked })
              }
            />
          }
          label="Reduce visual effects"
        />
      </FormGroup>

      <Divider />

      <Typography variant="subtitle1">Playback</Typography>
      <TextField
        type="number"
        label="Default volume"
        value={settings.volume}
        slotProps={{ htmlInput: { min: 0, max: 1, step: 0.1 } }}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (Number.isFinite(value))
            void update({ volume: Math.min(1, Math.max(0, value)) });
        }}
        fullWidth
      />
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={settings.autoplayNext}
              onChange={(e) =>
                void update({ autoplayNext: e.target.checked })
              }
            />
          }
          label="Autoplay next track"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.persistQueue}
              onChange={(e) =>
                void update({ persistQueue: e.target.checked })
              }
            />
          }
          label="Persist queue across restarts"
        />
      </FormGroup>

      <Divider />

      <Typography variant="subtitle1">Audio</Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={settings.visualizerEnabled}
              onChange={(e) =>
                void update({ visualizerEnabled: e.target.checked })
              }
            />
          }
          label="Visualizer (placeholder — engine ready, UI pending)"
        />
      </FormGroup>
      <TextField
        select
        label="Equalizer preset"
        value={settings.equalizerPreset}
        onChange={(e) => void update({ equalizerPreset: e.target.value })}
        fullWidth
      >
        {EQUALIZER_PRESETS.map((preset) => (
          <MenuItem key={preset} value={preset}>
            {preset}
          </MenuItem>
        ))}
      </TextField>

      <Divider />

      <Typography variant="subtitle1">Data</Typography>
      <Typography variant="body2" color="text.secondary">
        All data stays in your browser. Imported files are never uploaded.
      </Typography>
      <Button
        variant="outlined"
        color="error"
        sx={{ alignSelf: "flex-start" }}
        onClick={() => setConfirmClear(true)}
      >
        Clear playback history
      </Button>

      <ConfirmDialog
        open={confirmClear}
        title="Clear playback history"
        description="Delete all playback history? Library, playlists, and settings stay. This cannot be undone."
        confirmLabel="Clear"
        confirmColor="error"
        onCancel={() => setConfirmClear(false)}
        onConfirm={async () => {
          await getContainer().facade.clearHistory();
          setConfirmClear(false);
          setFeedback("Playback history cleared.");
        }}
      />
    </Stack>
  );
}

export default SettingsPage;
