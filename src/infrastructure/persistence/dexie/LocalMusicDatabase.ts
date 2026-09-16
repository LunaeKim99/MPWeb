import Dexie, { type EntityTable } from "dexie";
import type {
  FileHandleRecord,
  PersistedQueueRecord,
  PlayHistoryEntryRecord,
  PlayerSettingsRecord,
  PlaylistItemRecord,
  PlaylistRecord,
  TrackRecord,
} from "@/infrastructure/persistence/dexie/records.ts";

export class LocalMusicDatabase extends Dexie {
  tracks!: EntityTable<TrackRecord, "id">;
  playlists!: EntityTable<PlaylistRecord, "id">;
  playlistItems!: EntityTable<PlaylistItemRecord, "id">;
  history!: EntityTable<PlayHistoryEntryRecord, "id">;
  settings!: EntityTable<PlayerSettingsRecord, "id">;
  queues!: EntityTable<PersistedQueueRecord, "id">;
  fileHandles!: EntityTable<FileHandleRecord, "trackId">;

  constructor(name = "localMusicPlayerDB") {
    super(name);
    this.version(1).stores({
      tracks:
        "id, fingerprint, title, artist, album, isFavorite, availability, addedAt, lastPlayedAt, *genre",
      playlists: "id, name, createdAt, updatedAt",
      playlistItems:
        "id, playlistId, trackId, [playlistId+position], [playlistId+trackId]",
      history: "id, trackId, playedAt, [trackId+playedAt]",
      settings: "id",
      queues: "id",
      fileHandles: "trackId, savedAt",
    });
  }
}
