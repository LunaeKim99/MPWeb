import type { Track } from "@/domain/entities/Track.ts";
import type { TrackRepository } from "@/domain/repositories/repositories.ts";

export type LibrarySort = "recent" | "title" | "artist" | "album";

export interface LibraryQuery {
  query?: string;
  sort?: LibrarySort;
  favoritesOnly?: boolean;
}

export class GetLibraryUseCase {
  constructor(private readonly trackRepository: TrackRepository) {}

  async execute(input: LibraryQuery = {}): Promise<Track[]> {
    const tracks = input.query?.trim()
      ? await this.trackRepository.search(input.query)
      : await this.trackRepository.findAll();
    const filtered = input.favoritesOnly
      ? tracks.filter((t) => t.isFavorite)
      : tracks;
    switch (input.sort ?? "recent") {
      case "title":
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      case "artist":
        return [...filtered].sort((a, b) => a.artist.localeCompare(b.artist));
      case "album":
        return [...filtered].sort((a, b) => a.album.localeCompare(b.album));
      case "recent":
      default:
        return [...filtered].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    }
  }
}

export class SearchTracksUseCase {
  constructor(private readonly trackRepository: TrackRepository) {}

  async execute(query: string): Promise<Track[]> {
    return this.trackRepository.search(query);
  }
}

export class ToggleFavoriteUseCase {
  constructor(private readonly trackRepository: TrackRepository) {}

  async execute(trackId: string): Promise<Track | null> {
    const track = await this.trackRepository.findById(trackId);
    if (!track) return null;
    const updated: Track = {
      ...track,
      isFavorite: !track.isFavorite,
      updatedAt: new Date().toISOString(),
    };
    await this.trackRepository.update(updated);
    return updated;
  }
}

export class RemoveTrackUseCase {
  constructor(private readonly trackRepository: TrackRepository) {}

  async execute(trackId: string): Promise<void> {
    await this.trackRepository.delete(trackId);
  }
}