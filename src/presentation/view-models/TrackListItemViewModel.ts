import type { Track } from "@/domain/entities/Track.ts";

export interface TrackListItemViewModel {
  id: string;
  title: string;
  artistLabel: string;
  albumLabel: string;
  durationLabel: string;
  artworkUrl?: string | undefined;
  isFavorite: boolean;
  isActive: boolean;
  isUnavailable: boolean;
  accessibilityLabel: string;
}

export function formatDuration(durationSeconds: number | null): string {
  if (durationSeconds === null || !Number.isFinite(durationSeconds)) return "--:--";
  const total = Math.max(0, Math.floor(durationSeconds));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function toTrackListItemViewModel(
  track: Track,
  activeTrackId?: string,
): TrackListItemViewModel {
  return {
    id: track.id,
    title: track.title,
    artistLabel: track.artist || "Unknown Artist",
    albumLabel: track.album || "Unknown Album",
    durationLabel: formatDuration(track.durationSeconds),
    artworkUrl: track.artwork?.dataUrl,
    isFavorite: track.isFavorite,
    isActive: track.id === activeTrackId,
    isUnavailable: track.availability !== "available",
    accessibilityLabel: `${track.title} by ${track.artist}`,
  };
}
