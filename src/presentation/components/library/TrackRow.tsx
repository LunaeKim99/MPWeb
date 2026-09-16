import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { TrackListItemViewModel } from "@/presentation/view-models/TrackListItemViewModel.ts";

export interface TrackRowProps {
  index: number;
  track: TrackListItemViewModel;
  addedLabel?: string | undefined;
  albumLabel?: string;
  onPlay: () => void;
  onAddToQueue: () => void;
  onToggleFavorite?: () => void;
  onRemove?: () => void;
}

export function TrackRow({
  index,
  track,
  addedLabel,
  albumLabel,
  onPlay,
  onAddToQueue,
  onToggleFavorite,
  onRemove,
}: TrackRowProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const isActive = track.isActive;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1,
        px: 1.5,
        borderRadius: 2,
        bgcolor: isActive ? "primaryContainer" : "transparent",
        "&:hover": { bgcolor: isActive ? "primaryContainer" : "action.hover" },
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          width: 24,
          textAlign: "right",
          display: { xs: "none", md: "block" },
        }}
      >
        {isActive ? "▶" : String(index + 1)}
      </Typography>
      <Avatar
        variant="rounded"
        src={track.artworkUrl}
        alt={track.title}
        sx={{ width: 44, height: 44, flexShrink: 0 }}
      >
        {track.title[0]?.toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: isActive ? 700 : 500,
            color: isActive ? "primary.main" : "text.primary",
          }}
          noWrap
        >
          {track.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {track.artistLabel}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: { xs: "none", md: "block" }, minWidth: 140 }}
        noWrap
      >
        {albumLabel ?? track.albumLabel}
      </Typography>
      {addedLabel && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: "none", md: "block" }, minWidth: 80 }}
          noWrap
        >
          {addedLabel}
        </Typography>
      )}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ minWidth: 40, textAlign: "right" }}
      >
        {track.durationLabel}
      </Typography>
      <IconButton
        size="small"
        aria-label={track.isFavorite ? "Remove favorite" : "Add favorite"}
        onClick={onToggleFavorite}
        sx={{ display: { xs: "none", sm: "inline-flex" } }}
      >
        {track.isFavorite ? "★" : "☆"}
      </IconButton>
      <IconButton
        size="small"
        aria-label={`More options for ${track.title}`}
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        ⋮
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setAnchor(null);
            onPlay();
          }}
        >
          Play
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            onAddToQueue();
          }}
        >
          Add to queue
        </MenuItem>
        {onToggleFavorite && (
          <MenuItem
            onClick={() => {
              setAnchor(null);
              onToggleFavorite();
            }}
          >
            {track.isFavorite ? "Remove from favorites" : "Add to favorites"}
          </MenuItem>
        )}
        {onRemove && (
          <MenuItem
            onClick={() => {
              setAnchor(null);
              onRemove();
            }}
          >
            Remove from library
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}

export default TrackRow;
