import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useLibraryStore } from "@/presentation/stores/libraryStore.ts";
import { usePlayerStore } from "@/presentation/stores/playerStore.ts";
import { isAcceptedAudioFile } from "@/infrastructure/files/BrowserFilePickerAdapter.ts";
import TrackList from "@/presentation/components/library/TrackList.tsx";
import { toTrackListItemViewModel } from "@/presentation/view-models/TrackListItemViewModel.ts";

const ACCEPT_AUDIO = ".mp3,.m4a,.aac,.ogg,.oga,.wav,.flac,.opus,.webm,audio/*";

export function LibraryPage({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const {
    tracks,
    query,
    sort,
    status,
    importStatus,
    errorMessage,
    lastImport,
    refresh,
    setQuery,
    setSort,
    setFavoritesOnly,
    importFiles,
    toggleFavorite,
    removeTrack,
  } = useLibraryStore();
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    void setFavoritesOnly(favoritesOnly);
    void refresh();
  }, [favoritesOnly, refresh, setFavoritesOnly]);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const playTrack = usePlayerStore((s) => s.playTrack);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  const items = tracks.map((track) => toTrackListItemViewModel(track, undefined));

  const handleSearchSubmit = () => {
    void setQuery(localQuery.trim());
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 960, mx: "auto", width: "100%" }}>
      <Typography variant="h5">
        {favoritesOnly ? "Favorites" : "Library"}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
        <Button component="label" variant="contained" disabled={importStatus === "importing"}>
          Add music
          <input
            type="file"
            hidden
            multiple
            accept={ACCEPT_AUDIO}
            onChange={async (event) => {
              const files = event.target.files ? Array.from(event.target.files) : [];
              const accepted = files.filter((f) => isAcceptedAudioFile(f.name, f.type));
              if (accepted.length > 0) await importFiles(accepted);
              event.target.value = "";
            }}
          />
        </Button>
        <TextField
          size="small"
          placeholder="Search title, artist, album"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearchSubmit();
          }}
          aria-label="Search tracks"
        />
        <Button size="small" onClick={handleSearchSubmit}>
          Search
        </Button>
        {!favoritesOnly && (
          <>
            <Button
              size="small"
              variant={sort === "recent" ? "contained" : "outlined"}
              onClick={() => void setSort("recent")}
            >
              Recent
            </Button>
            <Button
              size="small"
              variant={sort === "title" ? "contained" : "outlined"}
              onClick={() => void setSort("title")}
            >
              Title
            </Button>
            <Button
              size="small"
              variant={sort === "artist" ? "contained" : "outlined"}
              onClick={() => void setSort("artist")}
            >
              Artist
            </Button>
          </>
        )}
      </Box>
      {status === "loading" && <Typography>Loading…</Typography>}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {lastImport && (
        <Alert severity="info">
          Imported {lastImport.imported} · Skipped duplicate {lastImport.skippedDuplicate} ·
          Skipped unsupported {lastImport.skippedUnsupported} · Failed {lastImport.failed}
        </Alert>
      )}
      {status !== "loading" && (
        <TrackList
          items={items}
          onPlay={(id) => void playTrack(id, tracks.map((t) => t.id))}
          onAddToQueue={(id) => void addToQueue([id])}
          onToggleFavorite={toggleFavorite}
          onRemove={!favoritesOnly ? (t: string) => void removeTrack(t) : undefined}
          emptyMessage={
            favoritesOnly
              ? "No favorites yet"
              : "No music in library — Add music from your device. Music is processed locally."
          }
        />
      )}
    </Stack>
  );
}

export default LibraryPage;