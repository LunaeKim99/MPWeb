import type { AudioPlaybackStatus, AudioPlayerPort } from "@/domain/ports/ports.ts";
import type { RepeatMode } from "@/domain/value-objects/ids.ts";

export class TogglePlayPauseUseCase {
  constructor(
    private readonly deps: {
      audioPlayer: AudioPlayerPort;
      getStatus: () => AudioPlaybackStatus;
    },
  ) {}

  async execute(): Promise<void> {
    if (this.deps.getStatus() === "playing") {
      await this.deps.audioPlayer.pause();
    } else {
      await this.deps.audioPlayer.play();
    }
  }
}

export class PausePlaybackUseCase {
  constructor(private readonly audioPlayer: AudioPlayerPort) {}

  async execute(): Promise<void> {
    await this.audioPlayer.pause();
  }
}

export class SeekPlaybackUseCase {
  constructor(private readonly audioPlayer: AudioPlayerPort) {}

  async execute(positionSeconds: number): Promise<void> {
    await this.audioPlayer.seek(Math.max(0, positionSeconds));
  }
}

export class SetVolumeUseCase {
  constructor(private readonly audioPlayer: AudioPlayerPort) {}

  async execute(input: { volume: number; muted?: boolean }): Promise<void> {
    const volume = Math.min(1, Math.max(0, input.volume));
    await this.audioPlayer.setVolume(volume);
    if (input.muted !== undefined) await this.audioPlayer.setMuted(input.muted);
  }
}

export class SetRepeatUseCase {
  constructor(private readonly setRepeatMode: (mode: RepeatMode) => void) {}

  async execute(mode: RepeatMode): Promise<void> {
    this.setRepeatMode(mode);
  }
}

export class SetShuffleUseCase {
  constructor(private readonly setShuffle: (enabled: boolean) => void) {}

  async execute(enabled: boolean): Promise<void> {
    this.setShuffle(enabled);
  }
}