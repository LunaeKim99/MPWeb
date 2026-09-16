import type {
  Artwork,
  TrackAvailability,
  TrackId,
  TrackSourceType,
} from "@/domain/value-objects/ids.ts";

export interface Track {
  id: TrackId;
  sourceType: TrackSourceType;
  fileName: string;
  filePathHint?: string | undefined;
  fileSize: number;
  lastModified: number;
  fingerprint: string;
  mimeType: string;
  title: string;
  artist: string;
  album: string;
  albumArtist?: string | undefined;
  genre?: string[] | undefined;
  trackNumber?: number | undefined;
  discNumber?: number | undefined;
  year?: number | undefined;
  durationSeconds: number | null;
  artwork?: Artwork | undefined;
  availability: TrackAvailability;
  isFavorite: boolean;
  playCount: number;
  lastPlayedAt?: string | undefined;
  addedAt: string;
  updatedAt: string;
}
