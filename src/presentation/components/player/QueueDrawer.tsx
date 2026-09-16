import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";

export interface QueueEntry {
  trackId: string;
  title: string;
  artistLabel: string;
}

interface QueueDrawerProps {
  open: boolean;
  onClose: () => void;
  items: QueueEntry[];
  currentTrackId: string | null;
  onPlay: (trackId: string) => void;
  onRemove: (trackId: string) => void;
}

export function QueueDrawer({
  open,
  onClose,
  items,
  currentTrackId,
  onPlay,
  onRemove,
}: QueueDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ backdrop: { onClick: onClose } }}
    >
      <Box sx={{ width: 340, p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">Antrean</Typography>
          <IconButton aria-label="Tutup antrean" onClick={onClose}>
            {"\u00D7"}
          </IconButton>
        </Box>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            Antrean masih kosong — Putar lagu atau tambahkan ke antrean.
          </Typography>
        ) : (
          <List>
            {items.map((entry) => (
              <ListItem
                key={entry.trackId}
                secondaryAction={
                  <IconButton
                    size="small"
                    aria-label={`Hapus ${entry.title} dari antrean`}
                    title="Hapus dari antrean"
                    onClick={() => onRemove(entry.trackId)}
                  >
                    {"\u00D7"}
                  </IconButton>
                }
              >
                <Box
                  component="button"
                  onClick={() => onPlay(entry.trackId)}
                  type="button"
                  aria-label={`Putar ${entry.title}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: entry.trackId === currentTrackId ? 700 : 400 }}
                  >
                    {entry.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entry.artistLabel}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
}

export default QueueDrawer;
