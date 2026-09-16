import type {
  HistoryRepository,
  PlaylistRepository,
  SettingsRepository,
  TrackRepository,
} from "@/domain/repositories/repositories.ts";
import type { Track } from "@/domain/entities/Track.ts";
import type {
  PlayHistoryEntry,
  PlayerSettings,
  Playlist,
  PlaylistItem,
} from "@/domain/entities/Playlist.ts";
import type { PlaylistId, TrackId } from "@/domain/value-objects/ids.ts";
import { DEFAULT_PLAYER_SETTINGS } from "@/domain/entities/Playlist.ts";

export class InMemoryTrackRepository implements TrackRepository {
  private readonly tracks = new Map<string, Track>();

  async saveMany(tracks: Track[]): Promise<void> {
    for (const track of tracks) this.tracks.set(track.id, track);
  }

  async findById(id: TrackId): Promise<Track | null> {
    return this.tracks.get(id) ?? null;
  }

  async findByFingerprint(fingerprint: string): Promise<Track | null> {
    for (const track of this.tracks.values()) {
      if (track.fingerprint === fingerprint) return track;
    }
    return null;
  }

  async findAll(): Promise<Track[]> {
    return [...this.tracks.values()];
  }

  async search(query: string): Promise<Track[]> {
    const lower = query.trim().toLowerCase();
    if (lower.length === 0) return this.findAll();
    return [...this.tracks.values()].filter(
      (track) =>
        track.title.toLowerCase().includes(lower) ||
        track.artist.toLowerCase().includes(lower) ||
        track.album.toLowerCase().includes(lower) ||
        track.fileName.toLowerCase().includes(lower),
    );
  }

  async update(track: Track): Promise<void> {
    this.tracks.set(track.id, track);
  }

  async delete(id: TrackId): Promise<void> {
    this.tracks.delete(id);
  }
}

export class InMemoryPlaylistRepository implements PlaylistRepository {
  private readonly playlists = new Map<string, Playlist>();
  private readonly items = new Map<string, PlaylistItem[]>();

  async save(playlist: Playlist): Promise<void> {
    this.playlists.set(playlist.id, playlist);
  }

  async findById(id: PlaylistId): Promise<Playlist | null> {
    return this.playlists.get(id) ?? null;
  }

  async findAll(): Promise<Playlist[]> {
    return [...this.playlists.values()];
  }

  async findItems(playlistId: PlaylistId): Promise<PlaylistItem[]> {
    return this.items.get(playlistId) ?? [];
  }

  async replaceItems(
    playlistId: PlaylistId,
    items: PlaylistItem[],
  ): Promise<void> {
    this.items.set(playlistId, items);
  }

  async delete(id: PlaylistId): Promise<void> {
    this.playlists.delete(id);
    this.items.delete(id);
  }
}

export class InMemorySettingsRepository implements SettingsRepository {
  private settings: PlayerSettings = { ...DEFAULT_PLAYER_SETTINGS };

  async get(): Promise<PlayerSettings> {
    return { ...this.settings };
  }

  async save(settings: PlayerSettings): Promise<void> {
    this.settings = { ...settings };
  }
}

export class InMemoryHistoryRepository implements HistoryRepository {
  private readonly history: PlayHistoryEntry[] = [];

  async add(entry: PlayHistoryEntry): Promise<void> {
    this.history.push(entry);
  }

  async findRecent(limit: number): Promise<PlayHistoryEntry[]> {
    return [...this.history].slice(-limit).reverse();
  }

  async clear(): Promise<void> {
    this.history.length = 0;
  }
}
