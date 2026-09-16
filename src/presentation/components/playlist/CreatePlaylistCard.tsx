import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface CreatePlaylistCardProps {
  onClick: () => void;
}

export function CreatePlaylistCard({ onClick }: CreatePlaylistCardProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        minHeight: 200,
        border: "2px dashed",
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "transparent",
        cursor: "pointer",
        width: "100%",
        color: "text.secondary",
        "&:hover": {
          borderColor: "primary.main",
          color: "primary.main",
          bgcolor: "action.hover",
        },
      }}
    >
      <Box sx={{ fontSize: 32, lineHeight: 1 }}>＋</Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Create a playlist
      </Typography>
      <Typography variant="caption">Start a new collection</Typography>
    </Box>
  );
}

export default CreatePlaylistCard;
