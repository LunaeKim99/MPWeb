import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Playlist } from "@/domain/entities/Playlist.ts";
import { getContainer } from "@/di/container.ts";
import { ConfirmDialog } from "@/presentation/components/common/ConfirmDialog.tsx";

export function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<Playlist | null>(null);
  const [renameName, setRenameName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Playlist | null>(null);

  const refresh = async () => {
    try {
      const facade = getContainer().facade;
      const list = await facade.getPlaylists();
      setPlaylists(list);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Playlists failed to load",
      );
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <Stack spacing={2} sx={{ maxWidth: 960, mx: "auto", width: "100%" }}>
      <Typography variant="h5">Playlists</Typography>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <TextField
          size="small"
          label="New playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={async () => {
            if (!name.trim()) return;
            try {
              await getContainer().facade.createPlaylist(name.trim());
              setName("");
              await refresh();
            } catch (error) {
              setErrorMessage(
                error instanceof Error ? error.message : "Failed to create playlist",
              );
            }
          }}
        >
          Create
        </Button>
      </Stack>
      {playlists.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Belum ada playlist — buat playlist baru di atas.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {playlists.map((playlist) => (
            <Box
              key={playlist.id}
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                p: 1.5,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Button
                  component={Link}
                  to={`/playlists/${playlist.id}`}
                  sx={{ justifyContent: "flex-start", textTransform: "none" }}
                >
                  {playlist.name}
                </Button>
              </Box>
              <Button
                size="small"
                onClick={() => {
                  setRenameTarget(playlist);
                  setRenameName(playlist.name);
                }}
              >
                Rename
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => setDeleteTarget(playlist)}
              >
                Delete
              </Button>
            </Box>
          ))}
        </Stack>
      )}

      <Dialog
        open={Boolean(renameTarget)}
        onClose={() => setRenameTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Rename playlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Playlist name"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!renameTarget || !renameName.trim()) return;
              try {
                await getContainer().facade.renamePlaylist(renameTarget.id, renameName);
                setRenameTarget(null);
                await refresh();
              } catch (error) {
                setErrorMessage(
                  error instanceof Error ? error.message : "Rename failed",
                );
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete playlist"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? Tracks stay in Library. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        confirmColor="error"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await getContainer().facade.deletePlaylist(deleteTarget.id);
          setDeleteTarget(null);
          await refresh();
        }}
      />
    </Stack>
  );
}

export default PlaylistsPage;
