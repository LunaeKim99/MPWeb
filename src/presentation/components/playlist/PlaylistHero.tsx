import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

interface PlaylistHeroProps {
  cover: ReactNode;
  title: string;
  description?: string;
  meta?: string;
  playDisabled?: boolean;
  onPlay: () => void;
  onShuffle: () => void;
}

export function PlaylistHero({
  cover,
  title,
  description,
  meta,
  playDisabled,
  onPlay,
  onShuffle,
}: PlaylistHeroProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 3,
        p: { xs: 3, md: 4 },
        borderRadius: 6,
        bgcolor: "surfaceContainer",
        background:
          "linear-gradient(145deg, var(--surface-container-high), var(--surface-container))",
      }}
    >
      {cover}
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
        {meta && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            {meta}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 1.5, mt: 2, flexWrap: "wrap" }}>
          <Button variant="contained" onClick={onPlay} disabled={playDisabled}>
            Play
          </Button>
          <Button
            variant="outlined"
            onClick={onShuffle}
            disabled={playDisabled}
          >
            Shuffle
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default PlaylistHero;
