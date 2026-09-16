import Avatar from "@mui/material/Avatar";
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
      <Box
        className="mica-surface"
        sx={{
          width: { xs: "100vw", sm: 360 },
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minHeight: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">Queue</Typography>
          <IconButton aria-label="Close queue" onClick={onClose}>
            {"\u00D7"}
          </IconButton>
        </Box>
        {items.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ py: 6, textAlign: "center" }}
          >
            Queue is empty — play a track or add one.
          </Typography>
        ) : (
          <List>
            {items.map((entry) => (
              <ListItem
                key={entry.trackId}
                secondaryAction={
                  <IconButton
                    size="small"
                    aria-label={`Remove ${entry.title} from queue`}
                    title="Remove from queue"
                    onClick={() => onRemove(entry.trackId)}
                  >
                    {"\u00D7"}
                  </IconButton>
                }
              >
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 36,
                    height: 36,
                    mr: 1.5,
                    bgcolor: "primaryContainer",
                  }}
                >
                  ♫
                </Avatar>
                <Box
                  component="button"
                  type="button"
                  onClick={() => onPlay(entry.trackId)}
                  aria-label={`Play ${entry.title}`}
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
                    sx={{
                      fontWeight: entry.trackId === currentTrackId ? 700 : 400,
                    }}
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
