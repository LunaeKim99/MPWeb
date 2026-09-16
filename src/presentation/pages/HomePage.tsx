import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import type { Track } from "@/domain/entities/Track.ts";
import type { Playlist } from "@/domain/entities/Playlist.ts";
import { getContainer } from "@/di/container.ts";
import TrackList from "@/presentation/components/library/TrackList.tsx";
import { toTrackListItemViewModel } from "@/presentation/view-models/TrackListItemViewModel.ts";
import { usePlayerStore } from "@/presentation/stores/playerStore.ts";

export function HomePage() {
  const [recent, setRecent] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  useEffect(() => {
    const load = async () => {
      try {
        setStatus("loading");
        const facade = getContainer().facade;
        const [library, history, list] = await Promise.all([
          facade.getLibrary({ sort: "recent" }),
          facade.getRecentHistory(5),
          facade.getPlaylists(),
        ]);
        const byId = new Map(library.map((t) => [t.id, t]));
        const recentTracks = history
          .map((entry) => byId.get(entry.trackId))
          .filter((t): t is Track => Boolean(t));
        setRecent(recentTracks.length > 0 ? recentTracks : library.slice(0, 5));
        setPlaylists(list.slice(-3).reverse());
        setStatus("ready");
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Home failed to load",
        );
      }
    };
    void load();
  }, []);

  return (
    <Stack spacing={3} sx={{ maxWidth: 960, mx: "auto", width: "100%" }}>
      <Box
        sx={{
          p: 4,
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Your local music, private by default
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Import audio from your device. Music is processed locally and never uploaded.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button component={Link} to="/library" variant="contained">
            Open Library
          </Button>
          <Button component={Link} to="/playlists" variant="outlined">
            View Playlists
          </Button>
        </Stack>
      </Box>
      {status === "loading" && <Typography>Loading…</Typography>}
      {status === "error" && errorMessage && (
        <Alert severity="error">{errorMessage}</Alert>
      )}
      {status === "ready" && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Recently played
          </Typography>
          <TrackList
            items={recent.map((track) => toTrackListItemViewModel(track))}
            onPlay={(id) => void playTrack(id, recent.map((t) => t.id))}
            onAddToQueue={(id) => void addToQueue([id])}
            emptyMessage="Nothing played yet — Import music and start listening."
          />
        </Box>
      )}
      {status === "ready" && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Latest playlists
          </Typography>
          {playlists.length === 0 ? (
            <Typography color="text.secondary">
              No playlists yet. Create one from the Playlists page.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {playlists.map((playlist) => (
                <Box
                  key={playlist.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                    <Typography sx={{ fontWeight: 600 }}>{playlist.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {playlist.description ?? "No description"}
                    </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Stack>
  );
}

export default HomePage;
