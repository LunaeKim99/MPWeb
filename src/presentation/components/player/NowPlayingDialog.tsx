import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import PlaybackControls from "@/presentation/components/player/PlaybackControls.tsx";
import ProgressControl from "@/presentation/components/player/ProgressControl.tsx";
import type { AudioPlaybackStatus } from "@/domain/ports/ports.ts";
import type { RepeatMode } from "@/domain/value-objects/ids.ts";
import type { Track } from "@/domain/entities/Track.ts";

interface NowPlayingDialogProps {
  open: boolean;
  onClose: () => void;
  track: Track | null;
  status: AudioPlaybackStatus;
  positionSeconds: number;
  durationSeconds: number | null;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  onPrev: () => void;
  onTogglePlayPause: () => void;
  onNext: () => void;
  onRepeatCycle: () => void;
  onToggleShuffle: () => void;
  onSeek: (positionSeconds: number) => void;
}

export function NowPlayingDialog({
  open,
  onClose,
  track,
  status,
  positionSeconds,
  durationSeconds,
  repeatMode,
  shuffleEnabled,
  onPrev,
  onTogglePlayPause,
  onNext,
  onRepeatCycle,
  onToggleShuffle,
  onSeek,
}: NowPlayingDialogProps) {
  if (!track) return null;
  const hasDuration = durationSeconds !== null && durationSeconds > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-label="Now playing"
      fullScreen={typeof window !== "undefined" && window.innerWidth < 600}
      slotProps={{
        paper: {
          sx: {
            background: "linear-gradient(160deg, #1E5135 0%, #191B1F 60%)",
            color: "onSurface",
          },
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 1, pt: 1 }}>
        <IconButton
          className="float-icon-button"
          aria-label="Close"
          title="Close"
          onClick={onClose}
          sx={{ color: "inherit" }}
        >
          {"\u00D7"}
        </IconButton>
      </Box>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          alignItems: "center",
          pb: 4,
        }}
      >
        <Avatar
          variant="rounded"
          src={track.artwork?.dataUrl}
          alt={track.title}
          sx={{
            width: { xs: 220, sm: 280 },
            height: { xs: 220, sm: 280 },
            fontSize: 56,
            borderRadius: 4,
          }}
        >
          {track.title[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ textAlign: "center", width: "100%" }}>
          <Typography variant="h5" noWrap>
            {track.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "onSurfaceVariant", mt: 0.5 }}
          >
            {track.artist} — {track.album}
          </Typography>
        </Box>
        <ProgressControl
          positionSeconds={positionSeconds}
          durationSeconds={durationSeconds}
          onSeek={onSeek}
          disabled={!hasDuration}
        />
        <PlaybackControls
          status={status}
          repeatMode={repeatMode}
          shuffleEnabled={shuffleEnabled}
          onPrev={onPrev}
          onTogglePlayPause={onTogglePlayPause}
          onNext={onNext}
          onRepeatCycle={onRepeatCycle}
          onToggleShuffle={onToggleShuffle}
        />
      </DialogContent>
    </Dialog>
  );
}

export default NowPlayingDialog;
