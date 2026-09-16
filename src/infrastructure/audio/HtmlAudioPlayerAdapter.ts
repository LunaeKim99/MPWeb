import type {
  AudioPlaybackEvent,
  AudioPlaybackListener,
  AudioPlayerPort,
} from "@/domain/ports/ports.ts";

export class HtmlAudioPlayerAdapter implements AudioPlayerPort {
  private readonly audio: HTMLAudioElement;
  private readonly listeners = new Set<AudioPlaybackListener>();

  private readonly boundHandlers: Array<[string, EventListener]> = [];

  // Single MediaElementAudioSourceNode — created lazily if Web Audio equaliser/analyser chain is added later.
  // Upgrade: expose optional AudioNode getter for upstream chain.

  constructor(audio?: HTMLAudioElement) {
    this.audio = audio ?? new Audio();
    this.audio.preload = "metadata";
    this.boundHandlers = [
      ["loadedmetadata", () => this.emitFromAudio()],
      ["timeupdate", () => this.emitFromAudio()],
      ["play", () => this.emitFromAudio()],
      ["pause", () => this.emitFromAudio()],
      ["ended", () => this.emitEnded()],
      ["error", () => this.emitFromAudio()],
    ];
    for (const [event, handler] of this.boundHandlers) {
      this.audio.addEventListener(event, handler);
    }
  }

  private statusMap(): AudioPlaybackEvent["status"] {
    switch (this.audio.error?.code) {
      case MediaError.MEDIA_ERR_ABORTED:
      case MediaError.MEDIA_ERR_NETWORK:
      case MediaError.MEDIA_ERR_DECODE:
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return "error";
      default:
        break;
    }
    if (this.audio.paused) {
      return this.audio.currentTime === 0 && !this.audio.src ? "idle" : "paused";
    }
    return "playing";
  }

  private emitFromAudio(): void {
    const event: AudioPlaybackEvent = {
      status: this.statusMap(),
      positionSeconds: this.audio.currentTime,
      durationSeconds: Number.isFinite(this.audio.duration)
        ? this.audio.duration
        : null,
    };
    if (this.audio.error) {
      event.errorMessage = this.audio.error.message || "Playback error";
    }
    this.emit(event);
  }

  private emitEnded(): void {
    this.emit({
      status: "ended",
      positionSeconds: this.audio.currentTime,
      durationSeconds: Number.isFinite(this.audio.duration)
        ? this.audio.duration
        : null,
    });
  }

  private emit(event: AudioPlaybackEvent): void {
    for (const listener of this.listeners) listener(event);
  }

  async load(source: string): Promise<void> {
    this.audio.src = source;
    this.audio.load();
    this.emit({
      status: "loading",
      positionSeconds: 0,
      durationSeconds: null,
    });
  }

  async play(): Promise<void> {
    try {
      await this.audio.play();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Autoplay blocked";
      this.emit({
        status: "error",
        positionSeconds: this.audio.currentTime,
        durationSeconds: Number.isFinite(this.audio.duration)
          ? this.audio.duration
          : null,
        errorMessage: message,
      });
      throw new Error(`PlaybackError: ${message}`);
    }
  }

  async pause(): Promise<void> {
    this.audio.pause();
  }

  async seek(positionSeconds: number): Promise<void> {
    this.audio.currentTime = Math.max(0, positionSeconds);
  }

  async setVolume(volume: number): Promise<void> {
    this.audio.volume = Math.min(1, Math.max(0, volume));
  }

  async setMuted(muted: boolean): Promise<void> {
    this.audio.muted = muted;
  }

  async dispose(): Promise<void> {
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load(); // abort any pending load
    for (const [event, handler] of this.boundHandlers) {
      this.audio.removeEventListener(event, handler);
    }
    this.listeners.clear();
  }

  subscribe(listener: AudioPlaybackListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
