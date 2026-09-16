import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { type Playlist } from "@/domain/entities/Playlist.ts";
import { getContainer } from "@/di/container.ts";
import { ConfirmDialog } from "@/presentation/components/common/ConfirmDialog.tsx";
import PageHeader from "@/presentation/components/common/PageHeader.tsx";
import PlaylistCard from "@/presentation/components/playlist/PlaylistCard.tsx";
import CreatePlaylistCard from "@/presentation/components/playlist/CreatePlaylistCard.tsx";
import CreatePlaylistDialog from "@/presentation/components/playlist/CreatePlaylistDialog.tsx";
import EmptyCollectionCard from "@/presentation/components/common/EmptyCollectionCard.tsx";

export function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Playlist | null>(null);
  const [renameName, setRenameName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Playlist | null>(null);

  const refresh = async () => {
    try {
      const list = await getContainer().facade.getPlaylists();
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
    <Stack spacing={3} sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
      <PageHeader
        title="Your playlists"
        subtitle="Create collections for study, coding, travel, or any mood."
        action={
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            Create playlist
          </Button>
        }
      />
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {playlists.length === 0 ? (
        <EmptyCollectionCard
          icon="≡"
          title="No playlists yet"
          description="Start a new collection for your local music."
        />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3,1fr)",
              md: "repeat(4,1fr)",
            },
            gap: 2,
          }}
        >
          <CreatePlaylistCard onClick={() => setCreateOpen(true)} />
          {playlists.map((p) => (
            <PlaylistCard key={p.id} playlist={p} />
          ))}
        </Box>
      )}

      <CreatePlaylistDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={async (name, description) => {
          await getContainer().facade.createPlaylist(name.trim(), description);
          await refresh();
        }}
      />

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
                await getContainer().facade.renamePlaylist(
                  renameTarget.id,
                  renameName,
                );
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
