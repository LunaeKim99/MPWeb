import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { TrackListItemViewModel } from "@/presentation/view-models/TrackListItemViewModel.ts";

interface TrackListProps {
  items: TrackListItemViewModel[];
  onPlay?: ((trackId: string) => void) | undefined;
  onAddToQueue?: ((trackId: string) => void) | undefined;
  onToggleFavorite?: ((trackId: string) => void) | undefined;
  onRemove?: ((trackId: string) => void) | undefined;
  emptyMessage?: string;
}

export function TrackList({
  items,
  onPlay,
  onAddToQueue,
  onToggleFavorite,
  onRemove,
  emptyMessage = "No tracks yet",
}: TrackListProps) {
  if (items.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 1 }}>
        <Typography variant="body1">{emptyMessage}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
          Choose audio files from your device. Music is processed locally and not uploaded.
        </Typography>
      </Box>
    );
  }
  return (
    <List aria-label="Track list">
      {items.map((item) => (
        <ListItem
          key={item.id}
          secondaryAction={
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {onPlay && (
                <IconButton
                  size="small"
                  aria-label={`Putar ${item.title}`}
                  title="Putar"
                  onClick={() => onPlay(item.id)}
                >
                  {"\u25B6"}
                </IconButton>
              )}
              {onAddToQueue && (
                <IconButton
                  size="small"
                  aria-label={`Tambahkan ke antrean ${item.title}`}
                  title="Tambah ke antrean"
                  onClick={() => onAddToQueue(item.id)}
                >
                  {"\u2261+"}
                </IconButton>
              )}
              {onToggleFavorite && (
                <IconButton
                  aria-label={item.isFavorite ? "Hapus favorit" : "Tambah favorit"}
                  title={item.isFavorite ? "Hapus favorit" : "Tambah favorit"}
                  onClick={() => onToggleFavorite(item.id)}
                >
                  {item.isFavorite ? "\u2605" : "\u2606"}
                </IconButton>
              )}
              {onRemove && (
                <IconButton
                  aria-label={`Hapus ${item.title}`}
                  title="Hapus dari library"
                  onClick={() => onRemove(item.id)}
                >
                  {"\u00D7"}
                </IconButton>
              )}
            </Box>
          }
        >
          <ListItemAvatar>
            <Avatar
              variant="rounded"
              src={item.artworkUrl}
              alt={item.title}
              sx={{ width: 44, height: 44 }}
            >
              {item.title.charAt(0).toUpperCase()}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={item.title}
            secondary={`${item.artistLabel} - ${item.albumLabel} - ${item.durationLabel}`}
          />
        </ListItem>
      ))}
    </List>
  );
}

export default TrackList;