import type {
  PlaylistId,
  RepeatMode,
  ThemePreference,
  TrackId,
} from "@/domain/value-objects/ids.ts";

export interface Playlist {
  id: PlaylistId;
  name: string;
  description?: string | undefined;
  coverTrackId?: TrackId | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistItem {
  id: string;
  playlistId: PlaylistId;
  trackId: TrackId;
  position: number;
  addedAt: string;
}

export interface PlayHistoryEntry {
  id: string;
  trackId: TrackId;
  playedAt: string;
  completed: boolean;
  listenedSeconds: number;
}

export interface PlayerSettings {
  theme: ThemePreference;
  micaEnabled: boolean;
  reduceVisualEffects: boolean;
  volume: number;
  muted: boolean;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  autoplayNext: boolean;
  persistQueue: boolean;
  visualizerEnabled: boolean;
  equalizerPreset: string;
  updatedAt: string;
}

export interface PlaybackQueue {
  trackIds: TrackId[];
  currentIndex: number;
}

export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  theme: "dark",
  micaEnabled: true,
  reduceVisualEffects: false,
  volume: 0.8,
  muted: false,
  repeatMode: "off",
  shuffleEnabled: false,
  autoplayNext: true,
  persistQueue: false,
  visualizerEnabled: false,
  equalizerPreset: "flat",
  updatedAt: new Date().toISOString(),
};
