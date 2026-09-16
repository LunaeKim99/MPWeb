import { useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import { useLibraryStore } from "@/presentation/stores/libraryStore.ts";
import { usePlayerStore } from "@/presentation/stores/playerStore.ts";
import TrackList from "@/presentation/components/library/TrackList.tsx";
import { toTrackListItemViewModel } from "@/presentation/view-models/TrackListItemViewModel.ts";
import { formatDuration } from "@/presentation/view-models/TrackListItemViewModel.ts";
import EmptyCollectionCard from "@/presentation/components/common/EmptyCollectionCard.tsx";

function totalDuration(tracks: { durationSeconds: number | null }[]): string {
  const total = tracks.reduce((sum, t) => sum + (t.durationSeconds ?? 0), 0);
  if (!total) return "0 min";
  return formatDuration(total);
}

export function FavoritesPage() {
  const { tracks, refresh, setFavoritesOnly, toggleFavorite } =
    useLibraryStore();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const activeTrackId = usePlayerStore((s) => s.currentTrackId);

  useEffect(() => {
    void setFavoritesOnly(true);
    void refresh();
  }, [refresh, setFavoritesOnly]);

  const hasTracks = tracks.length > 0;

  const handlePlayAll = () => {
    if (!hasTracks) return;
    void playTrack(
      tracks[0]!.id,
      tracks.map((t) => t.id),
    );
  };

  const handleShuffle = () => {
    if (!hasTracks) return;
    const ids = [...tracks.map((t) => t.id)].sort(() => Math.random() - 0.5);
    void playTrack(ids[0]!, ids);
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          p: { xs: 3, md: 4 },
          borderRadius: 6,
          background:
            "linear-gradient(135deg,#3A2A6B 0%,#1E5135 55%,#8BE8A8 100%)",
          color: "#E5E1E9",
        }}
      >
        <Box
          sx={{
            width: 160,
            height: 160,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            bgcolor: "rgba(0,0,0,0.22)",
          }}
        >
          ♥
        </Box>
        <Box
          sx={{
            flex: 1,
            minWidth: 220,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Liked songs
          </Typography>
          <Typography sx={{ opacity: 0.9, mt: 0.5 }}>
            Songs you love, all in one place.
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, mt: 1 }}>
            {tracks.length} songs · {totalDuration(tracks)}
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, mt: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={handlePlayAll}
              disabled={!hasTracks}
            >
              Play
            </Button>
            <Button
              variant="outlined"
              onClick={handleShuffle}
              disabled={!hasTracks}
              sx={{ borderColor: "rgba(255,255,255,0.5)", color: "#E5E1E9" }}
            >
              Shuffle
            </Button>
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Your liked songs
        </Typography>
        {!hasTracks ? (
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <EmptyCollectionCard
              icon="♥"
              title="No favorites yet"
              description="Tap the heart on any track to add it here."
            />
            <Button component={Link} to="/library" variant="outlined">
              Browse library
            </Button>
          </Stack>
        ) : (
          <TrackList
            items={tracks.map((t) =>
              toTrackListItemViewModel(t, activeTrackId ?? undefined),
            )}
            onPlay={(id) =>
              void playTrack(
                id,
                tracks.map((t) => t.id),
              )
            }
            onAddToQueue={(id) => void addToQueue([id])}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </Box>
    </Stack>
  );
}

export default FavoritesPage;
