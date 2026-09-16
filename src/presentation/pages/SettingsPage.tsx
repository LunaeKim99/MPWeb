import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import MenuItem from "@mui/material/MenuItem";
import Slider from "@mui/material/Slider";
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 4,
        bgcolor: "surfaceContainer",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export function SettingsPage() {
  const { settings, status, load, update } = useSettingsStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  if (status !== "ready")
    return (
      <Typography>
        {status === "error" ? "Settings failed to load" : "Loading…"}
      </Typography>
    );

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 640, mx: "auto", width: "100%" }}>
      <Typography variant="h4">Settings</Typography>
      <Typography variant="body2" color="text.secondary">
        Customize your listening experience.
      </Typography>
      {feedback && <Alert severity="success">{feedback}</Alert>}

      <Section title="Appearance">
        <TextField
          select
          label="Theme"
          value={settings.theme}
          onChange={(e) => void update({ theme: e.target.value as never })}
          fullWidth
        >
          {THEME_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.micaEnabled}
                onChange={(e) => void update({ micaEnabled: e.target.checked })}
              />
            }
            label="Use translucent surfaces"
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
      </Section>

      <Section title="Playback">
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Default volume — {Math.round(settings.volume * 100)}%
          </Typography>
          <Slider
            value={settings.volume}
            min={0}
            max={1}
            step={0.05}
            onChange={(_, v) => void update({ volume: v as number })}
          />
        </Box>
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
            label="Keep queue after restart"
          />
        </FormGroup>
      </Section>

      <Section title="Audio">
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
            label="Visualizer"
          />
        </FormGroup>
        <TextField
          select
          label="Equalizer preset"
          value={settings.equalizerPreset}
          onChange={(e) => void update({ equalizerPreset: e.target.value })}
          fullWidth
        >
          {EQUALIZER_PRESETS.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>
      </Section>

      <Section title="Data">
        <Typography variant="body2" color="text.secondary">
          Your music data remains in this browser.
        </Typography>
        <Button
          variant="outlined"
          color="error"
          sx={{ alignSelf: "flex-start" }}
          onClick={() => setConfirmClear(true)}
        >
          Clear playback history
        </Button>
      </Section>

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
