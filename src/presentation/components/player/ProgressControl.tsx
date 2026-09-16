import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import { formatDuration } from "@/presentation/view-models/TrackListItemViewModel.ts";

interface ProgressControlProps {
  positionSeconds: number;
  durationSeconds: number | null;
  onSeek: (positionSeconds: number) => void;
  disabled?: boolean | undefined;
}

export function ProgressControl({
  positionSeconds,
  durationSeconds,
  onSeek,
  disabled = false,
}: ProgressControlProps) {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(positionSeconds);

  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(positionSeconds);
    }
  }, [positionSeconds, isSeeking]);

  const max = durationSeconds && durationSeconds > 0 ? durationSeconds : 100;
  const current = isSeeking ? seekValue : positionSeconds;

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}
    >
      <Typography
        variant="caption"
        sx={{ minWidth: 40, textAlign: "right", color: "text.secondary" }}
      >
        {formatDuration(current)}
      </Typography>
      <Slider
        size="small"
        aria-label="Progress bar"
        min={0}
        max={max}
        step={0.5}
        value={Math.min(current, max)}
        disabled={disabled || !durationSeconds}
        onChange={(_e, val) => {
          setIsSeeking(true);
          setSeekValue(val as number);
        }}
        onChangeCommitted={(_e, val) => {
          setIsSeeking(false);
          onSeek(val as number);
        }}
        sx={{ flex: 1 }}
      />
      <Typography
        variant="caption"
        sx={{ minWidth: 40, color: "text.secondary" }}
      >
        {formatDuration(durationSeconds)}
      </Typography>
    </Box>
  );
}

export default ProgressControl;
