import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TrackRow from "@/presentation/components/library/TrackRow.tsx";
import TrackListEmptyState from "@/presentation/components/library/TrackListEmptyState.tsx";
import type { TrackListItemViewModel } from "@/presentation/view-models/TrackListItemViewModel.ts";

export interface TrackListProps {
  items: TrackListItemViewModel[];
  addedLabels?: Map<string, string>;
  onPlay: (trackId: string) => void;
  onAddToQueue: (trackId: string) => void;
  onToggleFavorite?: ((trackId: string) => void) | undefined;
  onRemove?: ((trackId: string) => void) | undefined;
}

export function TrackList({
  items,
  addedLabels,
  onPlay,
  onAddToQueue,
  onToggleFavorite,
  onRemove,
}: TrackListProps) {
  if (items.length === 0) return <TrackListEmptyState />;
  return (
    <Box
      component="ul"
      aria-label="Track list"
      sx={{
        listStyle: "none",
        m: 0,
        p: 0,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          gap: 1.5,
          px: 1.5,
          pb: 0.5,
          color: "text.secondary",
        }}
      >
        <Typography variant="caption" sx={{ width: 24, textAlign: "right" }}>
          #
        </Typography>
        <Box sx={{ width: 44 }} />
        <Typography variant="caption" sx={{ flex: 1 }}>
          Title
        </Typography>
        <Typography variant="caption" sx={{ minWidth: 140 }}>
          Album
        </Typography>
        {addedLabels && (
          <Typography variant="caption" sx={{ minWidth: 80 }}>
            Added
          </Typography>
        )}
        <Typography variant="caption" sx={{ minWidth: 40, textAlign: "right" }}>
          Time
        </Typography>
        <Box sx={{ width: 70 }} />
      </Box>
      {items.map((track, index) => (
        <li key={track.id} style={{ listStyle: "none" }}>
          <TrackRow
            index={index}
            track={track}
            {...(addedLabels?.get(track.id) !== undefined
              ? { addedLabel: addedLabels.get(track.id)! }
              : {})}
            onPlay={() => onPlay(track.id)}
            onAddToQueue={() => onAddToQueue(track.id)}
            {...(onToggleFavorite
              ? { onToggleFavorite: () => onToggleFavorite(track.id) }
              : {})}
            {...(onRemove ? { onRemove: () => onRemove(track.id) } : {})}
          />
        </li>
      ))}
    </Box>
  );
}

export default TrackList;
