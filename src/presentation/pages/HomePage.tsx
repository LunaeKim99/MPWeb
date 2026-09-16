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
import PlaylistCard from "@/presentation/components/playlist/PlaylistCard.tsx";
import CreatePlaylistCard from "@/presentation/components/playlist/CreatePlaylistCard.tsx";
import SectionHeader from "@/presentation/components/common/SectionHeader.tsx";
import EmptyCollectionCard from "@/presentation/components/common/EmptyCollectionCard.tsx";
import { toTrackListItemViewModel } from "@/presentation/view-models/TrackListItemViewModel.ts";
import { usePlayerStore } from "@/presentation/stores/playerStore.ts";

export function HomePage() {
  const [recent, setRecent] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
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
          .map((e) => byId.get(e.trackId))
          .filter((t): t is Track => Boolean(t));
        setRecent(recentTracks.length > 0 ? recentTracks : library.slice(0, 5));
        setPlaylists(list.slice(-6).reverse());
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
    <Stack spacing={4} sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
      <Box
        sx={{
          p: { xs: 3, md: 5 },
          minHeight: { xs: 220, md: 300 },
          borderRadius: 6,
          background:
            "linear-gradient(135deg,#1B4A35 0%,#191B1F 55%,#463D62 100%)",
          color: "#E5E1E9",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -20,
            fontSize: 180,
            opacity: 0.08,
          }}
        >
          ♫
        </Box>
        <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.9 }}>
          Good afternoon
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, maxWidth: 520 }}>
          Your local music, private by default
        </Typography>
        <Typography sx={{ opacity: 0.9, maxWidth: 480 }}>
          Build your personal listening space. Files stay on device.
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ mt: 1.5, flexWrap: "wrap" }}>
          <Button
            component={Link}
            to="/library"
            variant="contained"
            sx={{ borderRadius: 20, px: 3 }}
          >
            Add music
          </Button>
          <Button
            component={Link}
            to="/library"
            variant="outlined"
            sx={{
              borderRadius: 20,
              px: 3,
              borderColor: "rgba(255,255,255,0.4)",
              color: "#E5E1E9",
            }}
          >
            Open library
          </Button>
        </Stack>
      </Box>

      {status === "loading" && (
        <Typography color="text.secondary">Loading…</Typography>
      )}
      {status === "error" && errorMessage && (
        <Alert severity="error">{errorMessage}</Alert>
      )}

      {status === "ready" && (
        <Box>
          <SectionHeader title="Recently played" seeAllTo="/library" />
          {recent.length === 0 ? (
            <EmptyCollectionCard
              icon="♪"
              title="Nothing played yet"
              description="Import music and start listening."
            />
          ) : (
            <TrackList
              items={recent.map((t) => toTrackListItemViewModel(t))}
              onPlay={(id) =>
                void playTrack(
                  id,
                  recent.map((t) => t.id),
                )
              }
              onAddToQueue={(id) => void addToQueue([id])}
            />
          )}
        </Box>
      )}

      {status === "ready" && (
        <Box>
          <SectionHeader title="Your playlists" seeAllTo="/playlists" />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" },
              gap: 2,
            }}
          >
            <CreatePlaylistCard
              onClick={() => {
                window.location.hash = "/playlists";
              }}
            />
            {playlists.map((p) => (
              <PlaylistCard key={p.id} playlist={p} />
            ))}
          </Box>
        </Box>
      )}
    </Stack>
  );
}

export default HomePage;
