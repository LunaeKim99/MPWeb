import type {
  AudioPlayerPort,
  AudioPlaybackEvent,
  AudioPlaybackListener,
  MediaSessionPort,
  MediaSessionTrackInfo,
  MetadataReaderPort,
  TrackFileResolverPort,
  TrackMetadataInput,
  TrackMetadataResult,
} from "@/domain/ports/ports.ts";
import type { Track } from "@/domain/entities/Track.ts";

export class FakeAudioPlayer implements AudioPlayerPort {
  loadedSource: string | null = null;
  playing = false;
  positionSeconds = 0;
  volume = 0.8;
  muted = false;
  failPlay = false;
  private readonly listeners = new Set<AudioPlaybackListener>();

  private emit(event: AudioPlaybackEvent): void {
    for (const listener of this.listeners) listener(event);
  }

  async load(source: string): Promise<void> {
    this.loadedSource = source;
    this.playing = false;
    this.emit({ status: "loading", positionSeconds: 0, durationSeconds: null });
  }

  async play(): Promise<void> {
    if (this.failPlay) {
      this.emit({
        status: "error",
        positionSeconds: 0,
        durationSeconds: null,
        errorMessage: "play failed",
      });
      throw new Error("play failed");
    }
    this.playing = true;
    this.emit({
      status: "playing",
      positionSeconds: this.positionSeconds,
      durationSeconds: null,
    });
  }

  async pause(): Promise<void> {
    this.playing = false;
    this.emit({
      status: "paused",
      positionSeconds: this.positionSeconds,
      durationSeconds: null,
    });
  }

  async seek(positionSeconds: number): Promise<void> {
    this.positionSeconds = Math.max(0, positionSeconds);
    this.emit({
      status: this.playing ? "playing" : "paused",
      positionSeconds: this.positionSeconds,
      durationSeconds: null,
    });
  }

  async setVolume(volume: number): Promise<void> {
    this.volume = volume;
  }

  async setMuted(muted: boolean): Promise<void> {
    this.muted = muted;
  }

  async dispose(): Promise<void> {
    this.listeners.clear();
  }

  /** Simulate natural track end (DOM "ended") for autoplay wiring. */
  emitEnded(): void {
    this.playing = false;
    this.emit({
      status: "ended",
      positionSeconds: this.positionSeconds,
      durationSeconds: null,
    });
  }

  subscribe(listener: AudioPlaybackListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export class FakeTrackFileResolver implements TrackFileResolverPort {
  private readonly sources = new Map<string, string>();

  set(track: Track, source: string): void {
    this.sources.set(track.id, source);
  }

  async resolve(track: Track): Promise<string | null> {
    return this.sources.get(track.id) ?? null;
  }
}

export class FakeMetadataReader implements MetadataReaderPort {
  failFor = new Set<string>();

  async read(input: TrackMetadataInput): Promise<TrackMetadataResult> {
    if (this.failFor.has(input.fileName)) {
      throw new Error(`metadata failed: ${input.fileName}`);
    }
    return {
      title: input.fileName.replace(/\.[^.]+$/, ""),
      artist: "Unknown Artist",
      album: "Unknown Album",
      durationSeconds: null,
    };
  }
}

export class FakeMediaSession implements MediaSessionPort {
  lastTrack: MediaSessionTrackInfo | null = null;

  update(track: MediaSessionTrackInfo | null): void {
    this.lastTrack = track;
  }
}
