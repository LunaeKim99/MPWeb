import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Playlist, PlaylistItem } from "@/domain/entities/Playlist.ts";
import type { Track } from "@/domain/entities/Track.ts";
import { getContainer } from "@/di/container.ts";
import TrackList from "@/presentation/components/library/TrackList.tsx";
import { toTrackListItemViewModel } from "@/presentation/view-models/TrackListItemViewModel.ts";
import PlaylistHero from "@/presentation/components/playlist/PlaylistHero.tsx";
import { ConfirmDialog } from "@/presentation/components/common/ConfirmDialog.tsx";
import { usePlayerStore } from "@/presentation/stores/playerStore.ts";

export function PlaylistDetailPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const refresh = async (id: string) => {
    try {
      const facade = getContainer().facade;
      const list = await facade.getPlaylists();
      const found = list.find((p) => p.id === id) ?? null;
      if (!found) {
        setErrorMessage("Playlist not found");
        return;
      }
      setPlaylist(found);
      const [items, library]: [PlaylistItem[], Track[]] = await Promise.all([
        facade.getPlaylistItems(id),
        facade.getLibrary(),
      ]);
      const byId = new Map(library.map((t) => [t.id, t]));
      setTracks(
        items
          .map((item) => byId.get(item.trackId))
          .filter((t): t is Track => Boolean(t)),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Playlist failed to load",
      );
    }
  };

  useEffect(() => {
    if (playlistId) void refresh(playlistId);
  }, [playlistId]);

  const playTrack = usePlayerStore((s) => s.playTrack);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const activeTrackId = usePlayerStore((s) => s.currentTrackId);

  const toggleFavorite = async (trackId: string) => {
    await getContainer().facade.toggleFavorite(trackId);
    if (playlistId) await refresh(playlistId);
  };

  const remove = async (trackId: string) => {
    if (!playlistId) return;
    await getContainer().facade.removeTrackFromPlaylist(playlistId, trackId);
    await refresh(playlistId);
  };

  if (errorMessage) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 960, mx: "auto", width: "100%" }}>
        <Alert severity="error">{errorMessage}</Alert>
        <Button component={Link} to="/playlists">
          Back to playlists
        </Button>
      </Stack>
    );
  }

  if (!playlist) return <Typography>Loading…</Typography>;

  const ids = tracks.map((t) => t.id);
  const hasTracks = tracks.length > 0;

  return (
    <Stack spacing={3} sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          size="small"
          sx={{ alignSelf: "flex-start" }}
          onClick={() => void navigate("/playlists")}
        >
          ← Back
        </Button>
        <IconButton
          aria-label="Playlist options"
          onClick={(e) => setMenuAnchor(e.currentTarget)}
        >
          ⋯
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
            }}
          >
            Rename
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              setConfirmDelete(true);
            }}
            sx={{ color: "error.main" }}
          >
            Delete
          </MenuItem>
        </Menu>
      </Box>

      <PlaylistHero
        cover={
          <Avatar
            variant="rounded"
            sx={{
              width: 160,
              height: 160,
              fontSize: 48,
              borderRadius: 3,
              bgcolor: "primaryContainer",
            }}
          >
            ♫
          </Avatar>
        }
        title={playlist.name}
        description={playlist.description ?? "Your collection"}
        meta={`${tracks.length} track${tracks.length === 1 ? "" : "s"} · created ${new Date(playlist.createdAt).toLocaleDateString()}`}
        playDisabled={!hasTracks}
        onPlay={() => void playTrack(ids[0]!, ids)}
        onShuffle={() => {
          const shuffled = [...ids].sort(() => Math.random() - 0.5);
          void playTrack(shuffled[0]!, shuffled);
        }}
      />

      {!hasTracks ? (
        <Typography variant="body2" color="text.secondary">
          This playlist is empty — add tracks from Library or queue.
        </Typography>
      ) : (
        <TrackList
          items={tracks.map((t) =>
            toTrackListItemViewModel(t, activeTrackId ?? undefined),
          )}
          onPlay={(id) => void playTrack(id, ids)}
          onAddToQueue={(id) => void addToQueue([id])}
          onToggleFavorite={(id) => void toggleFavorite(id)}
          onRemove={(id) => void remove(id)}
        />
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete playlist"
        description={`Delete "${playlist.name}"? Tracks stay in Library. This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await getContainer().facade.deletePlaylist(playlist.id);
          setConfirmDelete(false);
          await navigate("/playlists");
        }}
      />
    </Stack>
  );
}

export default PlaylistDetailPage;
