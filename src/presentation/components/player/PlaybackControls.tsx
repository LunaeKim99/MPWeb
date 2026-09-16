import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import type { AudioPlaybackStatus } from "@/domain/ports/ports.ts";
import type { RepeatMode } from "@/domain/value-objects/ids.ts";

interface PlaybackControlsProps {
  status: AudioPlaybackStatus;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  onPrev: () => void;
  onTogglePlayPause: () => void;
  onNext: () => void;
  onRepeatCycle: () => void;
  onToggleShuffle: () => void;
  disabled?: boolean | undefined;
}

export function PlaybackControls({
  status,
  repeatMode,
  shuffleEnabled,
  onPrev,
  onTogglePlayPause,
  onNext,
  onRepeatCycle,
  onToggleShuffle,
  disabled = false,
}: PlaybackControlsProps) {
  const isPlaying = status === "playing";
  const isLoading = status === "loading";

  const repeatLabel =
    repeatMode === "one" ? "Ulangi 1" : repeatMode === "all" ? "Ulangi Semua" : "Ulangi";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <IconButton
        size="small"
        aria-label="Acak"
        title={shuffleEnabled ? "Acak (Aktif)" : "Acak (Nonaktif)"}
        onClick={onToggleShuffle}
        disabled={disabled}
        color={shuffleEnabled ? "primary" : "default"}
      >
        <span style={{ fontSize: "1.1rem" }}>{"\u21C4"}</span>
      </IconButton>

      <IconButton
        aria-label="Sebelumnya"
        title="Sebelumnya"
        onClick={onPrev}
        disabled={disabled}
      >
        <span style={{ fontSize: "1.2rem" }}>{"\u23EE"}</span>
      </IconButton>

      <IconButton
        aria-label={isPlaying ? "Jeda" : "Putar"}
        title={isLoading ? "Memuat..." : isPlaying ? "Jeda" : "Putar"}
        onClick={onTogglePlayPause}
        disabled={disabled || isLoading}
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          "&:hover": { bgcolor: "primary.dark" },
          width: 42,
          height: 42,
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>
          {isLoading ? "\u23F3" : isPlaying ? "\u23F8" : "\u25B6"}
        </span>
      </IconButton>

      <IconButton
        aria-label="Berikutnya"
        title="Berikutnya"
        onClick={onNext}
        disabled={disabled}
      >
        <span style={{ fontSize: "1.2rem" }}>{"\u23ED"}</span>
      </IconButton>

      <IconButton
        size="small"
        aria-label={repeatLabel}
        title={`Ulangi (${repeatMode})`}
        onClick={onRepeatCycle}
        disabled={disabled}
        color={repeatMode !== "off" ? "primary" : "default"}
      >
        <span style={{ fontSize: "1.1rem", fontWeight: repeatMode === "one" ? "bold" : "normal" }}>
          {repeatMode === "one" ? "\uD83D\uDD02" : "\uD83D\uDD01"}
        </span>
      </IconButton>
    </Box>
  );
}

export default PlaybackControls;
