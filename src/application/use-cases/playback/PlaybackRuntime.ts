import type { PlaybackQueue } from "@/domain/entities/Playlist.ts";
import type { RepeatMode } from "@/domain/value-objects/ids.ts";

export interface PlaybackRuntimeState {
  queue: PlaybackQueue;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
}

export class PlaybackRuntime {
  private state: PlaybackRuntimeState = {
    queue: { trackIds: [], currentIndex: -1 },
    repeatMode: "off",
    shuffleEnabled: false,
  };

  getState(): PlaybackRuntimeState {
    return {
      queue: { ...this.state.queue, trackIds: [...this.state.queue.trackIds] },
      repeatMode: this.state.repeatMode,
      shuffleEnabled: this.state.shuffleEnabled,
    };
  }

  setQueue(trackIds: string[], startIndex: number): void {
    this.state.queue = {
      trackIds: [...trackIds],
      currentIndex:
        trackIds.length === 0 ? -1 : Math.max(0, Math.min(startIndex, trackIds.length - 1)),
    };
  }

  setCurrentIndex(index: number): void {
    if (index < -1 || index >= this.state.queue.trackIds.length) return;
    this.state.queue = { ...this.state.queue, currentIndex: index };
  }

  setRepeatMode(mode: RepeatMode): void {
    this.state.repeatMode = mode;
  }

  setShuffleEnabled(enabled: boolean): void {
    this.state.shuffleEnabled = enabled;
  }
}