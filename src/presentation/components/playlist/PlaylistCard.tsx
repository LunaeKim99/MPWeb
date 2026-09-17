import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import type { Playlist } from "@/domain/entities/Playlist.ts";

const gradients = [
  "linear-gradient(135deg,#1E5135,#8BE8A8)",
  "linear-gradient(135deg,#463D62,#C8BFFF)",
  "linear-gradient(135deg,#5A2A1A,#FF8A65)",
  "linear-gradient(135deg,#1A3A5A,#64B5F6)",
];

function pickGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return gradients[Math.abs(hash) % gradients.length]!;
}

interface PlaylistCardProps {
  playlist: Playlist;
  trackCount?: number;
}

export function PlaylistCard({ playlist, trackCount }: PlaylistCardProps) {
  return (
    <Box
      component={Link}
      to={`/playlists/${playlist.id}`}
      className="playlist-card"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        p: 1.5,
        borderRadius: 3,
        bgcolor: "surfaceContainer",
        textDecoration: "none",
        color: "inherit",
        "&:hover": { bgcolor: "surfaceContainerHigh" },
      }}
    >
      <Box
        className="playlist-card__cover"
        sx={{
          height: 140,
          borderRadius: 2,
          background: pickGradient(playlist.id),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 56,
            height: 56,
            bgcolor: "rgba(0,0,0,0.24)",
            fontSize: 28,
          }}
        >
          ♫
        </Avatar>
      </Box>
      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
        {playlist.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap>
        {playlist.description ??
          (trackCount !== undefined ? `${trackCount} songs` : "Playlist")}
      </Typography>
    </Box>
  );
}

export default PlaylistCard;
