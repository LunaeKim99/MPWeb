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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-label="Now playing">
      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 1, pt: 1 }}>
        <IconButton aria-label="Tutup" title="Tutup" onClick={onClose}>
          {"\u00D7"}
        </IconButton>
      </Box>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
        <Avatar
          variant="rounded"
          src={track.artwork?.dataUrl}
          alt={track.title}
          sx={{ width: 180, height: 180, fontSize: 48 }}
        >
          {track.title.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ textAlign: "center", width: "100%" }}>
          <Typography variant="h6" noWrap>{track.title}</Typography>
          <Typography variant="body2" color="text.secondary">{track.artist} — {track.album}</Typography>
        </Box>
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
        <ProgressControl
          positionSeconds={positionSeconds}
          durationSeconds={durationSeconds}
          onSeek={onSeek}
          disabled={!hasDuration}
        />
      </DialogContent>
    </Dialog>
  );
}

export default NowPlayingDialog;
