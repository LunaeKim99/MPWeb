import type { Track } from "@/domain/entities/Track.ts";
import type { TrackId } from "@/domain/value-objects/ids.ts";

export type AudioPlaybackStatus =
  "idle" | "loading" | "playing" | "paused" | "ended" | "error";

export interface AudioPlaybackEvent {
  status: AudioPlaybackStatus;
  positionSeconds: number;
  durationSeconds: number | null;
  errorMessage?: string;
}

export type AudioPlaybackListener = (event: AudioPlaybackEvent) => void;

export interface AudioPlayerPort {
  load(source: string): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(positionSeconds: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  setMuted(muted: boolean): Promise<void>;
  dispose(): Promise<void>;
  subscribe(listener: AudioPlaybackListener): () => void;
}

export interface TrackFileResolverPort {
  resolve(track: Track): Promise<string | null>;
}

export interface TrackMetadataInput {
  fileName: string;
  mimeType: string;
  buffer: ArrayBuffer;
}

export interface TrackMetadataResult {
  title: string;
  artist: string;
  album: string;
  durationSeconds: number | null;
  artworkDataUrl?: string | undefined;
  artworkMimeType?: string | undefined;
}

export interface MetadataReaderPort {
  read(input: TrackMetadataInput): Promise<TrackMetadataResult>;
}

export interface MediaSessionTrackInfo {
  title: string;
  artist: string;
  album: string;
  trackId: TrackId;
  artworkUrl?: string | undefined;
}

export interface MediaSessionPort {
  update(track: MediaSessionTrackInfo | null): void;
}
