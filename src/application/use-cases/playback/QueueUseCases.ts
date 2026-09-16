import { PlaybackRuntime } from "@/application/use-cases/playback/PlaybackRuntime.ts";

export class AddToQueueUseCase {
  constructor(private readonly runtime: PlaybackRuntime) {}

  async execute(trackIds: string[]): Promise<void> {
    const state = this.runtime.getState();
    this.runtime.setQueue([...state.queue.trackIds, ...trackIds], state.queue.currentIndex);
  }
}

export class PlayTrackNextUseCase {
  constructor(private readonly runtime: PlaybackRuntime) {}

  async execute(trackId: string): Promise<void> {
    const state = this.runtime.getState();
    const ids = [...state.queue.trackIds];
    const at = state.queue.currentIndex;
    ids.splice(at + 1, 0, trackId);
    this.runtime.setQueue(ids, at < 0 ? 0 : at);
  }
}

export class RemoveFromQueueUseCase {
  constructor(private readonly runtime: PlaybackRuntime) {}

  async execute(trackId: string): Promise<void> {
    const state = this.runtime.getState();
    const index = state.queue.trackIds.indexOf(trackId);
    if (index < 0) return;
    const ids = state.queue.trackIds.filter((id) => id !== trackId);
    const current = state.queue.currentIndex;
    const nextIndex =
      ids.length === 0 ? -1 : index < current ? current - 1 : Math.min(current, ids.length - 1);
    this.runtime.setQueue(ids, nextIndex);
  }
}
