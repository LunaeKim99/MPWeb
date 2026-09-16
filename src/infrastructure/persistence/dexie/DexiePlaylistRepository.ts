import type { LocalMusicDatabase } from "./LocalMusicDatabase.ts";
import type { PlaylistRepository } from "@/domain/repositories/repositories.ts";
import type { Playlist, PlaylistItem } from "@/domain/entities/Playlist.ts";
import type { PlaylistId } from "@/domain/value-objects/ids.ts";
import {
  PlaylistMapper,
  PlaylistItemMapper,
} from "@/infrastructure/persistence/dexie/mappers/mappers.ts";

export class DexiePlaylistRepository implements PlaylistRepository {
  constructor(private readonly db: LocalMusicDatabase) {}

  async save(playlist: Playlist): Promise<void> {
    await this.db.playlists.put(PlaylistMapper.toRecord(playlist));
  }

  async findById(id: PlaylistId): Promise<Playlist | null> {
    const record = await this.db.playlists.get(id);
    return record ? PlaylistMapper.toDomain(record) : null;
  }

  async findAll(): Promise<Playlist[]> {
    const records = await this.db.playlists.toArray();
    return records.map(PlaylistMapper.toDomain);
  }

  async findItems(playlistId: PlaylistId): Promise<PlaylistItem[]> {
    const records = await this.db.playlistItems
      .where("playlistId")
      .equals(playlistId)
      .toArray();
    return records
      .map(PlaylistItemMapper.toDomain)
      .sort((a, b) => a.position - b.position);
  }

  async replaceItems(
    playlistId: PlaylistId,
    items: PlaylistItem[],
  ): Promise<void> {
    await this.db.transaction(
      "rw",
      this.db.playlistItems,
      async () => {
        const existing = await this.db.playlistItems
          .where("playlistId")
          .equals(playlistId)
          .toArray();
        for (const r of existing) await this.db.playlistItems.delete(r.id);
        if (items.length > 0) {
          await this.db.playlistItems.bulkPut(
            items.map(PlaylistItemMapper.toRecord),
          );
        }
      },
    );
  }

  async delete(id: PlaylistId): Promise<void> {
    await this.db.transaction(
      "rw",
      this.db.playlists,
      this.db.playlistItems,
      async () => {
        await this.db.playlists.delete(id);
        const items = await this.db.playlistItems.where("playlistId").equals(id).toArray();
        for (const r of items) await this.db.playlistItems.delete(r.id);
      },
    );
  }
}