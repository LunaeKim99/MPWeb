import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Playlist, PlaylistItem } from "@/domain/entities/Playlist.ts";
import type { Track } from "@/domain/entities/Track.ts";
import { getContainer } from "@/di/container.ts";
import TrackList from "@/presentation/components/library/TrackList.tsx";
import { toTrackListItemViewModel } from "@/presentation/view-models/TrackListItemViewModel.ts";
import { usePlayerStore } from "@/presentation/stores/playerStore.ts";

export function PlaylistDetailPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  const toggleFavorite = async (trackId: string) => {
    await getContainer().facade.toggleFavorite(trackId);
    if (playlistId) await refresh(playlistId);
  };

  const move = async (index: number, delta: -1 | 1) => {
    if (!playlistId) return;
    const next = [...tracks];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const a = next[index]!;
    const b = next[target]!;
    next[index] = b;
    next[target] = a;
    await getContainer().facade.reorderPlaylist(
      playlistId,
      next.map((t) => t.id),
    );
    await refresh(playlistId);
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

  return (
    <Stack spacing={2} sx={{ maxWidth: 960, mx: "auto", width: "100%" }}>
      <Button
        size="small"
        sx={{ alignSelf: "flex-start" }}
        onClick={() => void navigate("/playlists")}
      >
        ← Back
      </Button>
      <Typography variant="h5">{playlist.name}</Typography>
      <Typography variant="body2" color="text.secondary">
        {tracks.length} track{tracks.length === 1 ? "" : "s"}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          disabled={tracks.length === 0}
          onClick={() => void playTrack(ids[0]!, ids)}
        >
          Play all
        </Button>
        <Button
          variant="outlined"
          disabled={tracks.length === 0}
          onClick={() => {
            const shuffled = [...ids].sort(() => Math.random() - 0.5);
            void playTrack(shuffled[0]!, shuffled);
          }}
        >
          Shuffle
        </Button>
      </Box>
      {tracks.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Playlist ini masih kosong — Tambahkan lagu dari Library atau queue.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {tracks.map((track, index) => (
            <Box
              key={track.id}
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                p: 1,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <TrackList
                  items={[toTrackListItemViewModel(track)]}
                  onPlay={(id) => void playTrack(id, ids)}
                  onAddToQueue={(id) => void addToQueue([id])}
                  onToggleFavorite={(id) => void toggleFavorite(id)}
                  onRemove={(id) => void remove(id)}
                />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Button
                  size="small"
                  aria-label={`Move ${track.title} up`}
                  disabled={index === 0}
                  onClick={() => void move(index, -1)}
                >
                  ↑
                </Button>
                <Button
                  size="small"
                  aria-label={`Move ${track.title} down`}
                  disabled={index === tracks.length - 1}
                  onClick={() => void move(index, 1)}
                >
                  ↓
                </Button>
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export default PlaylistDetailPage;
