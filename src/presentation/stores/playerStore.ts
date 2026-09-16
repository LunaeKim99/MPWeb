import { create } from "zustand";
import type { Track } from "@/domain/entities/Track.ts";
import type { RepeatMode } from "@/domain/value-objects/ids.ts";
import type {
  AudioPlaybackEvent,
  AudioPlaybackStatus,
} from "@/domain/ports/ports.ts";
import type { AppFacade } from "@/application/factories/AppFacade.ts";
import { getContainer } from "@/di/container.ts";

export interface PlayerState {
  currentTrackId: string | null;
  currentTrack: Track | null;
  status: AudioPlaybackStatus;
  positionSeconds: number;
  durationSeconds: number | null;
  volume: number;
  muted: boolean;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  queueTrackIds: string[];
  queueIndex: number;
  errorMessage: string | null;
  isQueueOpen: boolean;
  isNowPlayingOpen: boolean;

  init: () => Promise<void>;
  applyPlaybackEvent: (event: AudioPlaybackEvent) => void;
  playTrack: (
    trackId: string,
    queueIds?: string[] | undefined,
  ) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  pause: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (positionSeconds: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  cycleRepeat: () => Promise<void>;
  toggleShuffle: () => Promise<void>;
  addToQueue: (trackIds: string[]) => Promise<void>;
  playTrackNext: (trackId: string) => Promise<void>;
  removeFromQueue: (trackId: string) => Promise<void>;
  setQueueOpen: (isOpen: boolean) => void;
  setNowPlayingOpen: (isOpen: boolean) => void;
}

let facadeRef: AppFacade | null = null;

function facade(): AppFacade {
  facadeRef ??= getContainer().facade;
  return facadeRef;
}

export function setPlayerFacade(next: AppFacade | null): void {
  facadeRef = next;
}

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  currentTrackId: null,
  currentTrack: null,
  status: "idle",
  positionSeconds: 0,
  durationSeconds: null,
  volume: 0.8,
  muted: false,
  repeatMode: "off",
  shuffleEnabled: false,
  queueTrackIds: [],
  queueIndex: -1,
  errorMessage: null,
  isQueueOpen: false,
  isNowPlayingOpen: false,

  init: async () => {
    try {
      const f = facade();
      const settings = await f.getSettings();
      const queue = await f.getPlaybackQueue();
      const track = await f.getCurrentTrack();
      set({
        volume: settings.volume,
        muted: settings.muted,
        repeatMode: settings.repeatMode,
        shuffleEnabled: settings.shuffleEnabled,
        queueTrackIds: queue.trackIds,
        queueIndex: queue.currentIndex,
        currentTrack: track,
        currentTrackId: track?.id ?? null,
      });
    } catch {
      // Ignore init errors gracefully
    }
  },

  applyPlaybackEvent: (event) => {
    set((state) => ({
      status: event.status,
      positionSeconds: event.positionSeconds,
      durationSeconds: event.durationSeconds ?? state.durationSeconds,
      errorMessage:
        event.status === "error"
          ? (event.errorMessage ?? "Playback error")
          : null,
    }));
  },

  playTrack: async (trackId, queueIds) => {
    try {
      const track = await facade().playTrack(trackId, queueIds);
      const queue = await facade().getPlaybackQueue();
      set({
        currentTrack: track,
        currentTrackId: track.id,
        queueTrackIds: queue.trackIds,
        queueIndex: queue.currentIndex,
        errorMessage: null,
      });
    } catch (error) {
      set({
        status: "error",
        errorMessage:
          error instanceof Error ? error.message : "Failed to play track",
      });
    }
  },

  togglePlayPause: async () => {
    try {
      await facade().togglePlayPause();
    } catch (error) {
      set({
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Playback error",
      });
    }
  },

  pause: async () => {
    await facade().pausePlayback();
  },

  next: async () => {
    try {
      const track = await facade().playNextTrack();
      const queue = await facade().getPlaybackQueue();
      set({
        currentTrack: track,
        currentTrackId: track?.id ?? null,
        queueTrackIds: queue.trackIds,
        queueIndex: queue.currentIndex,
      });
    } catch (error) {
      set({
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Playback error",
      });
    }
  },

  previous: async () => {
    try {
      const track = await facade().playPreviousTrack();
      const queue = await facade().getPlaybackQueue();
      set({
        currentTrack: track,
        currentTrackId: track?.id ?? null,
        queueTrackIds: queue.trackIds,
        queueIndex: queue.currentIndex,
      });
    } catch (error) {
      set({
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Playback error",
      });
    }
  },

  seek: async (positionSeconds) => {
    await facade().seekTo(positionSeconds);
    set({ positionSeconds });
  },

  setVolume: async (volume) => {
    await facade().setVolume(volume);
    set({ volume });
  },

  toggleMute: async () => {
    const nextMuted = !get().muted;
    await facade().setMuted(nextMuted);
    set({ muted: nextMuted });
  },

  cycleRepeat: async () => {
    const current = get().repeatMode;
    const nextMode: RepeatMode =
      current === "off" ? "all" : current === "all" ? "one" : "off";
    await facade().setRepeatMode(nextMode);
    set({ repeatMode: nextMode });
  },

  toggleShuffle: async () => {
    const nextShuffle = !get().shuffleEnabled;
    await facade().setShuffleEnabled(nextShuffle);
    set({ shuffleEnabled: nextShuffle });
  },

  addToQueue: async (trackIds) => {
    await facade().addToQueue(trackIds);
    const queue = await facade().getPlaybackQueue();
    set({ queueTrackIds: queue.trackIds, queueIndex: queue.currentIndex });
  },

  playTrackNext: async (trackId) => {
    await facade().playTrackNext(trackId);
    const queue = await facade().getPlaybackQueue();
    set({ queueTrackIds: queue.trackIds, queueIndex: queue.currentIndex });
  },

  removeFromQueue: async (trackId) => {
    await facade().removeFromQueue(trackId);
    const queue = await facade().getPlaybackQueue();
    const track = await facade().getCurrentTrack();
    set({
      queueTrackIds: queue.trackIds,
      queueIndex: queue.currentIndex,
      currentTrack: track,
      currentTrackId: track?.id ?? null,
    });
  },

  setQueueOpen: (isOpen) => set({ isQueueOpen: isOpen }),
  setNowPlayingOpen: (isOpen) => set({ isNowPlayingOpen: isOpen }),
}));
