import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MicaSurface from "@/presentation/components/common/MicaSurface.tsx";
import type { Track } from "@/domain/entities/Track.ts";
import type { AudioPlaybackStatus } from "@/domain/ports/ports.ts";

interface MiniPlayerProps {
  track: Track;
  status: AudioPlaybackStatus;
  onTogglePlayPause: () => void;
  onOpen: () => void;
}

export function MiniPlayer({
  track,
  status,
  onTogglePlayPause,
  onOpen,
}: MiniPlayerProps) {
  return (
    <MicaSurface
      component="footer"
      sx={{
        display: { xs: "flex", sm: "none" },
        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        py: 1,
        position: "fixed",
        bottom: 56,
        left: 8,
        right: 8,
        zIndex: 1100,
        borderRadius: 4,
      }}
    >
      <Avatar
        variant="rounded"
        src={track.artwork?.dataUrl}
        alt={track.title}
        sx={{ width: 40, height: 40 }}
        onClick={onOpen}
      >
        {track.title[0]?.toUpperCase()}
      </Avatar>
      <Box onClick={onOpen} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
          {track.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {track.artist}
        </Typography>
      </Box>
      <IconButton
        className="float-icon-button"
        aria-label={status === "playing" ? "Pause" : "Play"}
        onClick={onTogglePlayPause}
      >
        {status === "playing" ? "⏸" : "▶"}
      </IconButton>
    </MicaSurface>
  );
}

export default MiniPlayer;
