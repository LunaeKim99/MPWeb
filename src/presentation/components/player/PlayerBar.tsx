import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import PlaybackControls from "@/presentation/components/player/PlaybackControls.tsx";
import ProgressControl from "@/presentation/components/player/ProgressControl.tsx";
import QueueDrawer, { type QueueEntry } from "@/presentation/components/player/QueueDrawer.tsx";
import NowPlayingDialog from "@/presentation/components/player/NowPlayingDialog.tsx";
import { usePlayerStore } from "@/presentation/stores/playerStore.ts";
import { useLibraryStore } from "@/presentation/stores/libraryStore.ts";
import { getContainer } from "@/di/container.ts";

export function PlayerBar() {
  const {
    currentTrackId,
    currentTrack,
    status,
    positionSeconds,
    durationSeconds,
    volume,
    muted,
    repeatMode,
    shuffleEnabled,
    queueTrackIds,
    isQueueOpen,
    isNowPlayingOpen,
    errorMessage,
    playTrack,
    togglePlayPause,
    pause,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    cycleRepeat,
    toggleShuffle,
    removeFromQueue,
    setQueueOpen,
    setNowPlayingOpen,
  } = usePlayerStore();

  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const libraryTracks = useLibraryStore((s) => s.tracks);

  const [queueItems, setQueueItems] = useState<QueueEntry[]>([]);
  const [showError, setShowError] = useState(false);

  const hasTrack = currentTrack !== null;
  const isMutedVisual = muted || volume === 0;

  const libraryMap = useMemo(
    () => new Map(libraryTracks.map((t) => [t.id, t])),
    [libraryTracks],
  );

  // Resolve queue titles: in-memory library map, Dexie fallback for misses
  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      if (queueTrackIds.length === 0) {
        setQueueItems([]);
        return;
      }
      const entries: QueueEntry[] = [];
      const missing: string[] = [];
      for (const id of queueTrackIds) {
        const cached = libraryMap.get(id);
        if (cached) entries.push({ trackId: id, title: cached.title, artistLabel: cached.artist });
        else missing.push(id);
      }
      if (missing.length > 0) {
        try {
          const facade = getContainer().facade;
          const lib = await facade.getLibrary();
          const byId = new Map(lib.map((t) => [t.id, t]));
          for (const id of missing) {
            const t = byId.get(id);
            if (t) entries.push({ trackId: id, title: t.title, artistLabel: t.artist });
          }
        } catch {
          // Ignore resolution failures
        }
      }
      if (!cancelled) setQueueItems(entries);
    };
    void resolve();
    return () => {
      cancelled = true;
    };
  }, [queueTrackIds, libraryMap]);

  useEffect(() => {
    setShowError(status === "error" && errorMessage !== null);
  }, [status, errorMessage]);

  if (!hasTrack || !currentTrack) return null;

  const favorite = libraryMap.get(currentTrack.id)?.isFavorite ?? currentTrack.isFavorite;
  const subtitle = `${currentTrack.artist} — ${currentTrack.album}`;

  const openNowPlaying = () => setNowPlayingOpen(true);

  const handleNext = () => {
    void (async () => {
      await next();
      const after = usePlayerStore.getState().currentTrack;
      if (!after) await pause();
    })();
  };

  return (
    <Box
      className="mica-surface"
      component="footer"
      role="region"
      aria-label="Player bar"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 1.5,
        py: 1,
      }}
    >
      <Avatar
        variant="rounded"
        src={currentTrack.artwork?.dataUrl}
        alt={currentTrack.title}
        sx={{ width: 44, height: 44, cursor: "pointer" }}
        onClick={openNowPlaying}
      >
        {currentTrack.title.charAt(0).toUpperCase()}
      </Avatar>

      <Box
        component="button"
        type="button"
        onClick={openNowPlaying}
        aria-label="Buka Now Playing"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          border: "none",
          background: "none",
          cursor: "pointer",
          padding: 0,
          minWidth: 0,
          maxWidth: 220,
          color: "inherit",
        }}
      >
        <Typography variant="subtitle2" noWrap sx={{ maxWidth: "100%" }}>
          {currentTrack.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: "100%" }}>
          {subtitle}
        </Typography>
      </Box>

      <IconButton
        size="small"
        aria-label={favorite ? "Hapus favorit" : "Tambah favorit"}
        title={favorite ? "Hapus favorit" : "Tambah favorit"}
        onClick={() => void toggleFavorite(currentTrack.id)}
      >
        {favorite ? "\u2605" : "\u2606"}
      </IconButton>

      <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
        <PlaybackControls
          status={status}
          repeatMode={repeatMode}
          shuffleEnabled={shuffleEnabled}
          onPrev={() => void previous()}
          onTogglePlayPause={() => void togglePlayPause()}
          onNext={handleNext}
          onRepeatCycle={() => void cycleRepeat()}
          onToggleShuffle={() => void toggleShuffle()}
        />
      </Box>
      <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}>
        <IconButton
          aria-label="Sebelumnya"
          title="Sebelumnya"
          onClick={() => void previous()}
          size="small"
        >
          {"\u23EE"}
        </IconButton>
        <IconButton
          aria-label={status === "playing" ? "Jeda" : "Putar"}
          title={status === "playing" ? "Jeda" : "Putar"}
          onClick={() => void togglePlayPause()}
          disabled={status === "loading"}
        >
          {status === "loading" ? "\u23F3" : status === "playing" ? "\u23F8" : "\u25B6"}
        </IconButton>
        <IconButton aria-label="Berikutnya" title="Berikutnya" onClick={handleNext} size="small">
          {"\u23ED"}
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, display: { xs: "none", sm: "flex" } }}>
        <ProgressControl
          positionSeconds={positionSeconds}
          durationSeconds={durationSeconds}
          onSeek={(pos) => void seek(pos)}
          disabled={status === "loading"}
        />
      </Box>

      <Box sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", gap: 1, minWidth: 150 }}>
        <IconButton
          size="small"
          aria-label={isMutedVisual ? "Aktifkan suara" : "Bisukan"}
          title={isMutedVisual ? "Aktifkan suara" : "Bisukan"}
          onClick={() => void toggleMute()}
        >
          {isMutedVisual ? "\uD83D\uDD07" : "\uD83D\uDD0A"}
        </IconButton>
        <Slider
          size="small"
          aria-label="Volume"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(_e, val) => void setVolume(val as number)}
          sx={{ width: 90 }}
        />
      </Box>

      <IconButton
        aria-label="Antrean"
        title="Buka antrean"
        onClick={() => setQueueOpen(true)}
      >
        {"\u2630"}
      </IconButton>

      <QueueDrawer
        open={isQueueOpen}
        onClose={() => setQueueOpen(false)}
        items={queueItems}
        currentTrackId={currentTrackId}
        onPlay={(id) => void playTrack(id, queueTrackIds)}
        onRemove={(id) => void removeFromQueue(id)}
      />

      <NowPlayingDialog
        open={isNowPlayingOpen}
        onClose={() => setNowPlayingOpen(false)}
        track={currentTrack}
        status={status}
        positionSeconds={positionSeconds}
        durationSeconds={durationSeconds}
        repeatMode={repeatMode}
        shuffleEnabled={shuffleEnabled}
        onPrev={() => void previous()}
        onTogglePlayPause={() => void togglePlayPause()}
        onNext={handleNext}
        onRepeatCycle={() => void cycleRepeat()}
        onToggleShuffle={() => void toggleShuffle()}
        onSeek={(pos) => void seek(pos)}
      />

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setShowError(false)}>
          {errorMessage ?? "Playback error"}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PlayerBar;
