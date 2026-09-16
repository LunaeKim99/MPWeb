import type {
  ImportFileInput,
  ImportOutcome,
} from "@/application/dto/ImportOutcome.ts";
import type {
  LibraryQuery,
  LibrarySort,
} from "@/application/use-cases/library/LibraryUseCases.ts";
import type { Track } from "@/domain/entities/Track.ts";
import type {
  PlaybackQueue,
  PlayHistoryEntry,
  PlayerSettings,
  Playlist,
  PlaylistItem,
} from "@/domain/entities/Playlist.ts";
import type { AudioPlaybackEvent } from "@/domain/ports/ports.ts";
import type { RepeatMode } from "@/domain/value-objects/ids.ts";

/** Presentation boundary: stores/components call this, never Dexie or use cases directly. */
export interface AppFacade {
  // Library
  getLibrary(query?: LibraryQuery): Promise<Track[]>;
  searchTracks(query: string): Promise<Track[]>;
  importTracks(files: ImportFileInput[]): Promise<ImportOutcome>;
  toggleFavorite(trackId: string): Promise<Track | null>;
  removeTrack(trackId: string): Promise<void>;

  // Playlists
  getPlaylists(): Promise<Playlist[]>;
  getPlaylistItems(playlistId: string): Promise<PlaylistItem[]>;
  createPlaylist(name: string, description?: string): Promise<Playlist>;
  renamePlaylist(playlistId: string, name: string): Promise<Playlist | null>;
  addTrackToPlaylist(playlistId: string, trackId: string): Promise<void>;
  removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void>;
  reorderPlaylist(playlistId: string, orderedTrackIds: string[]): Promise<void>;
  deletePlaylist(playlistId: string): Promise<void>;

  // History
  getRecentHistory(limit: number): Promise<PlayHistoryEntry[]>;
  clearHistory(): Promise<void>;

  // Playback
  playTrack(trackId: string, queueIds?: string[]): Promise<Track>;
  togglePlayPause(): Promise<void>;
  pausePlayback(): Promise<void>;
  seekTo(positionSeconds: number): Promise<void>;
  playNextTrack(): Promise<Track | null>;
  playPreviousTrack(): Promise<Track | null>;
  setVolume(volume: number): Promise<void>;
  setMuted(muted: boolean): Promise<void>;
  setRepeatMode(mode: RepeatMode): Promise<void>;
  setShuffleEnabled(enabled: boolean): Promise<void>;
  addToQueue(trackIds: string[]): Promise<void>;
  playTrackNext(trackId: string): Promise<void>;
  removeFromQueue(trackId: string): Promise<void>;
  getPlaybackQueue(): Promise<PlaybackQueue>;
  getCurrentTrack(): Promise<Track | null>;
  subscribePlayback(listener: (event: AudioPlaybackEvent) => void): () => void;

  // Settings
  getSettings(): Promise<PlayerSettings>;
  updateSettings(patch: Partial<PlayerSettings>): Promise<PlayerSettings>;
}

export type { LibraryQuery, LibrarySort };
