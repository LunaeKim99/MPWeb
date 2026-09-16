import type {
  PlaybackQueue,
  Playlist,
  PlaylistItem,
} from "@/domain/entities/Playlist.ts";
import type { RepeatMode, TrackId } from "@/domain/value-objects/ids.ts";
import { InvalidPlaylistNameError } from "@/domain/errors/errors.ts";

export type RandomFn = () => number;

export interface NextTrackInput {
  queue: PlaybackQueue;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  random?: RandomFn;
  history: TrackId[];
  available: Set<TrackId>;
}

export function selectNextTrack(input: NextTrackInput): TrackId | null {
  const { queue, repeatMode, shuffleEnabled, available } = input;
  const random = input.random ?? Math.random;
  const ids = queue.trackIds.filter((id) => available.has(id));
  if (ids.length === 0) return null;

  const currentId = queue.trackIds[queue.currentIndex] ?? null;

  if (shuffleEnabled) {
    if (ids.length === 1) {
      if (repeatMode === "off" && input.history.includes(ids[0]!)) return null;
      return ids[0]!;
    }
    const pool =
      repeatMode === "off"
        ? ids.filter((id) => !input.history.includes(id))
        : ids;
    const candidates = pool.length > 0 ? pool : ids;
    let pick = candidates[Math.floor(random() * candidates.length)]!;
    if (candidates.length > 1 && pick === currentId) {
      pick = candidates[(candidates.indexOf(pick) + 1) % candidates.length]!;
    }
    return pick;
  }

  if (queue.currentIndex < 0) return ids[0]!;

  if (repeatMode === "one" && currentId && available.has(currentId))
    return currentId;

  const currentPos = ids.indexOf(currentId ?? ("" as TrackId));
  if (currentPos === -1) return ids[0]!;
  if (currentPos + 1 < ids.length) return ids[currentPos + 1]!;
  if (repeatMode === "all") return ids[0]!;
  return null;
}

export interface PreviousTrackInput {
  queue: PlaybackQueue;
  available: Set<TrackId>;
}

export function selectPreviousTrack(input: PreviousTrackInput): TrackId | null {
  const ids = input.queue.trackIds.filter((id) => input.available.has(id));
  if (ids.length === 0) return null;
  if (input.queue.currentIndex <= 0) return ids[0]!;
  const currentId = input.queue.trackIds[input.queue.currentIndex] ?? null;
  const currentPos = ids.indexOf(currentId ?? ("" as TrackId));
  if (currentPos <= 0) return ids[0]!;
  return ids[currentPos - 1]!;
}

export function normalizePlaylistPositions(
  items: PlaylistItem[],
): PlaylistItem[] {
  return [...items]
    .sort((a, b) => a.position - b.position)
    .map((item, index) => ({ ...item, position: index }));
}

export function validatePlaylistName(name: string): void {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new InvalidPlaylistNameError("Playlist name must not be empty");
  }
  if (trimmed.length > 120) {
    throw new InvalidPlaylistNameError(
      "Playlist name must be at most 120 characters",
    );
  }
}

export function createPlaylistName(name: string): string {
  validatePlaylistName(name);
  return name.trim();
}

export function isUniqueTrackInPlaylist(
  items: PlaylistItem[],
  trackId: TrackId,
): boolean {
  return !items.some((item) => item.trackId === trackId);
}

export type { Playlist, PlaylistItem };
