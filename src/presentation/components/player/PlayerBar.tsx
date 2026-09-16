import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import MicaSurface from "@/presentation/components/common/MicaSurface.tsx";
import MiniPlayer from "@/presentation/components/player/MiniPlayer.tsx";
import PlaybackControls from "@/presentation/components/player/PlaybackControls.tsx";
import ProgressControl from "@/presentation/components/player/ProgressControl.tsx";
import QueueDrawer, {
  type QueueEntry,
} from "@/presentation/components/player/QueueDrawer.tsx";
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
        if (cached)
          entries.push({
            trackId: id,
            title: cached.title,
            artistLabel: cached.artist,
          });
        else missing.push(id);
      }
      if (missing.length > 0) {
        try {
          const lib = await getContainer().facade.getLibrary();
          const byId = new Map(lib.map((t) => [t.id, t]));
          for (const id of missing) {
            const t = byId.get(id);
            if (t)
              entries.push({
                trackId: id,
                title: t.title,
                artistLabel: t.artist,
              });
          }
        } catch {}
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
  const favorite =
    libraryMap.get(currentTrack.id)?.isFavorite ?? currentTrack.isFavorite;
  const openNowPlaying = () => setNowPlayingOpen(true);
  const handleNext = () => {
    void (async () => {
      await next();
      const after = usePlayerStore.getState().currentTrack;
      if (!after) await pause();
    })();
  };

  return (
    <>
      <MicaSurface
        component="footer"
        sx={{
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          gap: 2,
          px: 2,
          py: 1.5,
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          borderRadius: 0,
          borderLeft: 0,
          borderRight: 0,
          borderBottom: 0,
        }}
      >
        <Avatar
          variant="rounded"
          src={currentTrack.artwork?.dataUrl}
          alt={currentTrack.title}
          sx={{ width: 52, height: 52, cursor: "pointer" }}
          onClick={openNowPlaying}
        >
          {currentTrack.title[0]?.toUpperCase()}
        </Avatar>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            maxWidth: 200,
          }}
        >
          <Typography variant="subtitle2" noWrap>
            {currentTrack.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {currentTrack.artist} — {currentTrack.album}
          </Typography>
        </Box>
        <IconButton
          size="small"
          aria-label={favorite ? "Remove favorite" : "Add favorite"}
          onClick={() => void toggleFavorite(currentTrack.id)}
        >
          {favorite ? "★" : "☆"}
        </IconButton>
        <Box sx={{ flex: 1, maxWidth: 560, mx: 1 }}>
          <ProgressControl
            positionSeconds={positionSeconds}
            durationSeconds={durationSeconds}
            onSeek={(pos) => void seek(pos)}
            disabled={status === "loading"}
          />
        </Box>
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
        <Box
          sx={{
            display: { xs: "none", lg: "flex" },
            alignItems: "center",
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            aria-label={isMutedVisual ? "Unmute" : "Mute"}
            onClick={() => void toggleMute()}
          >
            {isMutedVisual ? "🔇" : "🔊"}
          </IconButton>
          <Slider
            size="small"
            aria-label="Volume"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(_, v) => void setVolume(v as number)}
            sx={{ width: 90 }}
          />
        </Box>
        <IconButton
          aria-label="Queue"
          title="Queue"
          onClick={() => setQueueOpen(true)}
        >
          ☰
        </IconButton>
      </MicaSurface>
      <MiniPlayer
        track={currentTrack}
        status={status}
        onTogglePlayPause={() => void togglePlayPause()}
        onOpen={openNowPlaying}
      />
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
    </>
  );
}

export default PlayerBar;
