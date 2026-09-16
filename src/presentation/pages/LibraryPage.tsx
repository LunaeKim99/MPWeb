import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useLibraryStore } from "@/presentation/stores/libraryStore.ts";
import { usePlayerStore } from "@/presentation/stores/playerStore.ts";
import { isAcceptedAudioFile } from "@/infrastructure/files/BrowserFilePickerAdapter.ts";
import TrackList from "@/presentation/components/library/TrackList.tsx";
import LibraryToolbar, {
  type LibraryFilter,
} from "@/presentation/components/library/LibraryToolbar.tsx";
import PageHeader from "@/presentation/components/common/PageHeader.tsx";
import { toTrackListItemViewModel } from "@/presentation/view-models/TrackListItemViewModel.ts";

const ACCEPT_AUDIO = ".mp3,.m4a,.aac,.ogg,.oga,.wav,.flac,.opus,.webm,audio/*";

export function LibraryPage({
  favoritesOnly = false,
}: {
  favoritesOnly?: boolean;
}) {
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
  const [filter, setFilter] = useState<LibraryFilter>("all");

  useEffect(() => {
    void setFavoritesOnly(favoritesOnly);
    void refresh();
  }, [favoritesOnly, refresh, setFavoritesOnly]);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const playTrack = usePlayerStore((s) => s.playTrack);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const activeTrackId = usePlayerStore((s) => s.currentTrackId);

  const visibleTracks =
    filter === "favorites" ? tracks.filter((t) => t.isFavorite) : tracks;
  const items = visibleTracks.map((t) =>
    toTrackListItemViewModel(t, activeTrackId ?? undefined),
  );

  const handleSearch = () => {
    void setQuery(localQuery.trim());
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
      <PageHeader
        title={favoritesOnly ? "Favorites" : "Library"}
        subtitle={
          favoritesOnly
            ? "Songs you love, all in one place."
            : "All your local tracks, ready to play."
        }
        action={
          <Button
            component="label"
            variant="contained"
            disabled={importStatus === "importing"}
          >
            Add music
            <input
              type="file"
              hidden
              multiple
              accept={ACCEPT_AUDIO}
              onChange={async (event) => {
                const files = event.target.files
                  ? Array.from(event.target.files)
                  : [];
                const accepted = files.filter((f) =>
                  isAcceptedAudioFile(f.name, f.type),
                );
                if (accepted.length > 0) await importFiles(accepted);
                event.target.value = "";
              }}
            />
          </Button>
        }
      />
      <LibraryToolbar
        query={localQuery}
        onQueryChange={setLocalQuery}
        onSearch={handleSearch}
        sort={sort}
        onSortChange={(v) => void setSort(v)}
        filter={filter}
        onFilterChange={setFilter}
      />
      {status === "loading" && <Typography>Loading…</Typography>}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {lastImport && (
        <Alert severity="info">
          Imported {lastImport.imported} · Skipped duplicate{" "}
          {lastImport.skippedDuplicate} · Skipped unsupported{" "}
          {lastImport.skippedUnsupported} · Failed {lastImport.failed}
        </Alert>
      )}
      {status !== "loading" && (
        <TrackList
          items={items}
          onPlay={(id) =>
            void playTrack(
              id,
              visibleTracks.map((t) => t.id),
            )
          }
          onAddToQueue={(id) => void addToQueue([id])}
          onToggleFavorite={toggleFavorite}
          {...(!favoritesOnly
            ? { onRemove: (t: string) => void removeTrack(t) }
            : {})}
        />
      )}
    </Stack>
  );
}

export default LibraryPage;
