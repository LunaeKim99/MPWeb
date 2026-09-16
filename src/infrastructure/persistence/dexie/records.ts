import type {
  Artwork,
  ThemePreference,
  TrackAvailability,
  TrackSourceType,
} from "@/domain/value-objects/ids.ts";

export interface TrackRecord {
  id: string;
  sourceType: TrackSourceType;
  fileName: string;
  filePathHint?: string | undefined;
  fileSize: number;
  lastModified: number;
  fingerprint: string;
  mimeType: string;
  title: string;
  artist: string;
  album: string;
  albumArtist?: string | undefined;
  genre?: string[] | undefined;
  trackNumber?: number | undefined;
  discNumber?: number | undefined;
  year?: number | undefined;
  durationSeconds: number | null;
  artwork?: Artwork | undefined;
  availability: TrackAvailability;
  isFavorite: boolean;
  playCount: number;
  lastPlayedAt?: string | undefined;
  addedAt: string;
  updatedAt: string;
}

export interface PlaylistRecord {
  id: string;
  name: string;
  description?: string | undefined;
  coverTrackId?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistItemRecord {
  id: string;
  playlistId: string;
  trackId: string;
  position: number;
  addedAt: string;
}

export interface PlayHistoryEntryRecord {
  id: string;
  trackId: string;
  playedAt: string;
  completed: boolean;
  listenedSeconds: number;
}

export interface PlayerSettingsRecord {
  id: "default";
  theme: ThemePreference;
  micaEnabled: boolean;
  reduceVisualEffects: boolean;
  volume: number;
  muted: boolean;
  repeatMode: "off" | "all" | "one";
  shuffleEnabled: boolean;
  autoplayNext: boolean;
  persistQueue: boolean;
  visualizerEnabled: boolean;
  equalizerPreset: string;
  updatedAt: string;
}

export interface PersistedQueueRecord {
  id: "default";
  trackIds: string[];
  currentIndex: number;
  updatedAt: string;
}

export interface FileHandleRecord {
  trackId: string;
  handle: FileSystemFileHandle;
  savedAt: string;
}
