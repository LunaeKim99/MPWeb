import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { isAcceptedAudioFile } from "@/infrastructure/files/BrowserFilePickerAdapter.ts";
import { useLibraryStore } from "@/presentation/stores/libraryStore.ts";

const ACCEPT = ".mp3,.m4a,.aac,.ogg,.oga,.wav,.flac,.opus,.webm,audio/*";

export function TrackListEmptyState() {
  const importFiles = useLibraryStore((s) => s.importFiles);
  const importStatus = useLibraryStore((s) => s.importStatus);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 8,
        px: 3,
        textAlign: "center",
        gap: 1.5,
      }}
    >
      <Box sx={{ fontSize: 56, color: "text.secondary" }}>♫</Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Your library is empty
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
        Add audio from your device to start listening. Your files are processed
        locally and never uploaded.
      </Typography>
      <Button
        component="label"
        variant="contained"
        sx={{ mt: 1 }}
        disabled={importStatus === "importing"}
      >
        Add music
        <input
          type="file"
          hidden
          multiple
          accept={ACCEPT}
          onChange={async (e) => {
            const files = e.target.files ? Array.from(e.target.files) : [];
            const accepted = files.filter((f) =>
              isAcceptedAudioFile(f.name, f.type),
            );
            if (accepted.length > 0) await importFiles(accepted);
            e.target.value = "";
          }}
        />
      </Button>
    </Box>
  );
}

export default TrackListEmptyState;
