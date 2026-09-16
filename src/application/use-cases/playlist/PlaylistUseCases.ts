import type {
  Playlist,
  PlaylistItem,
} from "@/domain/entities/Playlist.ts";
import type { PlaylistRepository } from "@/domain/repositories/repositories.ts";
import { createPlaylistName, normalizePlaylistPositions } from "@/domain/services/policies.ts";

export class GetPlaylistsUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(): Promise<Playlist[]> {
    return this.playlistRepository.findAll();
  }
}

export class CreatePlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(input: {
    name: string;
    description?: string | undefined;
    createId?: (() => string) | undefined;
    now?: (() => string) | undefined;
  }): Promise<Playlist> {
    const name = createPlaylistName(input.name);
    const now = input.now ?? (() => new Date().toISOString());
    const createId =
      input.createId ??
      (() =>
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `playlist-${Date.now()}-${Math.floor(Math.random() * 1e6)}`);
    const timestamp = now();
    const playlist: Playlist = {
      id: createId(),
      name,
      description: input.description?.trim() || undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await this.playlistRepository.save(playlist);
    return playlist;
  }
}

export class AddTrackToPlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(input: {
    playlistId: string;
    trackId: string;
    createId?: (() => string) | undefined;
    now?: (() => string) | undefined;
  }): Promise<void> {
    const items = await this.playlistRepository.findItems(input.playlistId);
    if (items.some((item) => item.trackId === input.trackId)) return;
    const createId =
      input.createId ??
      (() =>
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `playlist-item-${Date.now()}-${Math.floor(Math.random() * 1e6)}`);
    const now = input.now ?? (() => new Date().toISOString());
    const next: PlaylistItem = {
      id: createId(),
      playlistId: input.playlistId,
      trackId: input.trackId,
      position: items.length,
      addedAt: now(),
    };
    await this.playlistRepository.replaceItems(input.playlistId, [...items, next]);
  }
}

export class RemoveTrackFromPlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(input: { playlistId: string; trackId: string }): Promise<void> {
    const items = await this.playlistRepository.findItems(input.playlistId);
    const filtered = items.filter((item) => item.trackId !== input.trackId);
    if (filtered.length === items.length) return;
    const normalized = normalizePlaylistPositions(filtered);
    await this.playlistRepository.replaceItems(input.playlistId, normalized);
  }
}

export class ReorderPlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(input: {
    playlistId: string;
    orderedTrackIds: string[];
  }): Promise<void> {
    const items = await this.playlistRepository.findItems(input.playlistId);
    const byTrackId = new Map(items.map((item) => [item.trackId, item]));
    const reordered: PlaylistItem[] = [];
    for (let position = 0; position < input.orderedTrackIds.length; position++) {
      const trackId = input.orderedTrackIds[position]!;
      const existing = byTrackId.get(trackId);
      if (existing) {
        reordered.push({ ...existing, position });
      }
    }
    const normalized = normalizePlaylistPositions(reordered);
    await this.playlistRepository.replaceItems(input.playlistId, normalized);
  }
}

export class RenamePlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(input: { playlistId: string; name: string }): Promise<Playlist | null> {
    const playlist = await this.playlistRepository.findById(input.playlistId);
    if (!playlist) return null;
    const name = createPlaylistName(input.name);
    const updated: Playlist = { ...playlist, name, updatedAt: new Date().toISOString() };
    await this.playlistRepository.save(updated);
    return updated;
  }
}

export class DeletePlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(playlistId: string): Promise<void> {
    await this.playlistRepository.delete(playlistId);
  }
}