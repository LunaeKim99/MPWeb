import type {
  PlayHistoryEntry,
  PlayerSettings,
  Playlist,
  PlaylistItem,
} from "@/domain/entities/Playlist.ts";
import type {
  FileHandleRecord,
  PersistedQueueRecord,
  PlayerSettingsRecord,
  PlaylistItemRecord,
  PlaylistRecord,
} from "@/infrastructure/persistence/dexie/records.ts";

export const PlaylistMapper = {
  toDomain(record: PlaylistRecord): Playlist {
    return { ...record };
  },
  toRecord(entity: Playlist): PlaylistRecord {
    return { ...entity };
  },
};

export const PlaylistItemMapper = {
  toDomain(record: PlaylistItemRecord): PlaylistItem {
    return { ...record };
  },
  toRecord(entity: PlaylistItem): PlaylistItemRecord {
    return { ...entity };
  },
};

export const HistoryMapper = {
  toDomain(record: PlayHistoryEntry): PlayHistoryEntry {
    return { ...record };
  },
  toRecord(entity: PlayHistoryEntry): PlayHistoryEntry {
    return { ...entity };
  },
};

export const SettingsMapper = {
  toDomain(record: PlayerSettingsRecord): PlayerSettings {
    const { id: _id, ...settings } = record;
    return settings;
  },
  toRecord(entity: PlayerSettings): PlayerSettingsRecord {
    return { ...entity, id: "default" };
  },
};

export const QueueMapper = {
  toRecord(queue: {
    trackIds: string[];
    currentIndex: number;
  }): PersistedQueueRecord {
    return {
      id: "default",
      trackIds: queue.trackIds,
      currentIndex: queue.currentIndex,
      updatedAt: new Date().toISOString(),
    };
  },
};

export type { FileHandleRecord };
