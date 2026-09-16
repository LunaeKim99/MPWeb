import type { LocalMusicDatabase } from "./LocalMusicDatabase.ts";
import type { TrackRepository } from "@/domain/repositories/repositories.ts";
import type { Track } from "@/domain/entities/Track.ts";
import type { TrackId } from "@/domain/value-objects/ids.ts";
import { TrackMapper } from "@/infrastructure/persistence/dexie/mappers/TrackMapper.ts";

export class DexieTrackRepository implements TrackRepository {
  constructor(private readonly db: LocalMusicDatabase) {}

  async saveMany(tracks: Track[]): Promise<void> {
    await this.db.tracks.bulkPut(
      tracks.map((track) => TrackMapper.toRecord(track)),
    );
  }

  async findById(id: TrackId): Promise<Track | null> {
    const record = await this.db.tracks.get(id);
    return record ? TrackMapper.toDomain(record) : null;
  }

  async findByFingerprint(fingerprint: string): Promise<Track | null> {
    const record = await this.db.tracks.where("fingerprint").equals(fingerprint).first();
    return record ? TrackMapper.toDomain(record) : null;
  }

  async findAll(): Promise<Track[]> {
    const records = await this.db.tracks.toArray();
    return records.map(TrackMapper.toDomain);
  }

  async search(query: string): Promise<Track[]> {
    const lower = query.trim().toLowerCase();
    if (lower.length === 0) return this.findAll();
    const records = await this.db.tracks.toArray();
    return records
      .filter(
        (r) =>
          r.title.toLowerCase().includes(lower) ||
          r.artist.toLowerCase().includes(lower) ||
          r.album.toLowerCase().includes(lower) ||
          r.fileName.toLowerCase().includes(lower),
      )
      .map(TrackMapper.toDomain);
  }

  async update(track: Track): Promise<void> {
    await this.db.tracks.put(TrackMapper.toRecord(track));
  }

  async delete(id: TrackId): Promise<void> {
    await this.db.tracks.delete(id);
  }
}