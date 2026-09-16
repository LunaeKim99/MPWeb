import type { LocalMusicDatabase } from "./LocalMusicDatabase.ts";
import type {
  HistoryRepository,
  SettingsRepository,
} from "@/domain/repositories/repositories.ts";
import type { PlayHistoryEntry, PlayerSettings } from "@/domain/entities/Playlist.ts";
import {
  DEFAULT_PLAYER_SETTINGS,
} from "@/domain/entities/Playlist.ts";
import { HistoryMapper, SettingsMapper } from "@/infrastructure/persistence/dexie/mappers/mappers.ts";

export class DexieSettingsRepository implements SettingsRepository {
  constructor(private readonly db: LocalMusicDatabase) {}

  async get(): Promise<PlayerSettings> {
    const record = await this.db.settings.get("default");
    return record ? SettingsMapper.toDomain(record) : { ...DEFAULT_PLAYER_SETTINGS };
  }

  async save(settings: PlayerSettings): Promise<void> {
    await this.db.settings.put(SettingsMapper.toRecord(settings));
  }
}

export class DexieHistoryRepository implements HistoryRepository {
  constructor(private readonly db: LocalMusicDatabase) {}

  async add(entry: PlayHistoryEntry): Promise<void> {
    await this.db.history.put(HistoryMapper.toRecord(entry));
  }

  async findRecent(limit: number): Promise<PlayHistoryEntry[]> {
    return (await this.db.history.orderBy("playedAt").reverse().limit(limit).toArray()).map(
      HistoryMapper.toDomain,
    );
  }

  async clear(): Promise<void> {
    await this.db.history.clear();
  }
}