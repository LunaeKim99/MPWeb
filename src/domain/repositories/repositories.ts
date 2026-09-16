import type { PlayHistoryEntry } from "@/domain/entities/Playlist.ts";
import type { PlayerSettings } from "@/domain/entities/Playlist.ts";
import type { Track } from "@/domain/entities/Track.ts";
import type { TrackId, PlaylistId } from "@/domain/value-objects/ids.ts";

export interface TrackRepository {
  saveMany(tracks: Track[]): Promise<void>;
  findById(id: TrackId): Promise<Track | null>;
  findByFingerprint(fingerprint: string): Promise<Track | null>;
  findAll(): Promise<Track[]>;
  search(query: string): Promise<Track[]>;
  update(track: Track): Promise<void>;
  delete(id: TrackId): Promise<void>;
}

export interface PlaylistRepository {
  save(
    playlist: import("@/domain/entities/Playlist.ts").Playlist,
  ): Promise<void>;
  findById(
    id: PlaylistId,
  ): Promise<import("@/domain/entities/Playlist.ts").Playlist | null>;
  findAll(): Promise<import("@/domain/entities/Playlist.ts").Playlist[]>;
  findItems(
    playlistId: PlaylistId,
  ): Promise<import("@/domain/entities/Playlist.ts").PlaylistItem[]>;
  replaceItems(
    playlistId: PlaylistId,
    items: import("@/domain/entities/Playlist.ts").PlaylistItem[],
  ): Promise<void>;
  delete(id: PlaylistId): Promise<void>;
}

export interface SettingsRepository {
  get(): Promise<PlayerSettings>;
  save(settings: PlayerSettings): Promise<void>;
}

export interface HistoryRepository {
  add(entry: PlayHistoryEntry): Promise<void>;
  findRecent(limit: number): Promise<PlayHistoryEntry[]>;
  clear(): Promise<void>;
}
