import { describe, expect, it } from "vitest";
import {
  PlayNextUseCase,
  PlayPreviousUseCase,
} from "@/application/use-cases/playback/PlayNextPreviousUseCases.ts";
import { PlaybackRuntime } from "@/application/use-cases/playback/PlaybackRuntime.ts";
import type { Track } from "@/domain/entities/Track.ts";
import {
  FakeAudioPlayer,
  FakeMediaSession,
  FakeTrackFileResolver,
} from "@/infrastructure/audio/fakeAudioPorts.ts";
import {
  InMemoryHistoryRepository,
  InMemoryTrackRepository,
} from "@/infrastructure/persistence/dexie/inMemoryRepositories.ts";

function makeTrack(id: string): Track {
  return {
    id,
    sourceType: "file-picker",
    fileName: `${id}.mp3`,
    fileSize: 1000,
    lastModified: 0,
    fingerprint: `fp-${id}`,
    mimeType: "audio/mpeg",
    title: `Title ${id}`,
    artist: `Artist ${id}`,
    album: `Album ${id}`,
    durationSeconds: 180,
    availability: "available",
    isFavorite: false,
    playCount: 0,
    addedAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

async function setupQueue() {
  const trackRepository = new InMemoryTrackRepository();
  const audioPlayer = new FakeAudioPlayer();
  const trackFileResolver = new FakeTrackFileResolver();
  const historyRepository = new InMemoryHistoryRepository();
  const mediaSessionPort = new FakeMediaSession();
  const runtime = new PlaybackRuntime();
  const ids = ["n-1", "n-2", "n-3"];
  const tracks = ids.map((id) => makeTrack(id));
  await trackRepository.saveMany(tracks);
  for (const track of tracks) {
    trackFileResolver.set(track, `blob:${track.id}`);
  }
  const deps = {
    trackRepository,
    audioPlayer,
    trackFileResolver,
    runtime,
    historyRepository,
    mediaSessionPort,
  };
  return { ...deps, ids };
}

describe("PlayNextUseCase / PlayPreviousUseCase", () => {
  it("advances sequentially with repeat off", async () => {
    const deps = await setupQueue();
    deps.runtime.setQueue(deps.ids, 0);
    deps.runtime.setRepeatMode("off");
    deps.runtime.setShuffleEnabled(false);

    const next = new PlayNextUseCase(deps);
    const result = await next.execute();

    expect(result?.id).toBe("n-2");
    expect(deps.audioPlayer.loadedSource).toBe("blob:n-2");
    expect(deps.audioPlayer.playing).toBe(true);
    expect(deps.runtime.getState().queue.currentIndex).toBe(1);
  });

  it("returns null at the end of the queue with repeat off", async () => {
    const deps = await setupQueue();
    deps.runtime.setQueue(deps.ids, 2);
    deps.runtime.setRepeatMode("off");
    deps.runtime.setShuffleEnabled(false);

    const next = new PlayNextUseCase(deps);
    const result = await next.execute();

    expect(result).toBeNull();
    expect(deps.audioPlayer.loadedSource).toBeNull();
    expect(deps.audioPlayer.playing).toBe(false);
  });

  it("moves back with playPrevious", async () => {
    const deps = await setupQueue();
    deps.runtime.setQueue(deps.ids, 1);

    const previous = new PlayPreviousUseCase(deps);
    const result = await previous.execute();

    expect(result?.id).toBe("n-1");
    expect(deps.audioPlayer.loadedSource).toBe("blob:n-1");
    expect(deps.audioPlayer.playing).toBe(true);
    expect(deps.runtime.getState().queue.currentIndex).toBe(0);
  });

  it("wraps to the first track when repeatMode is all", async () => {
    const deps = await setupQueue();
    deps.runtime.setQueue(deps.ids, 2);
    deps.runtime.setRepeatMode("all");
    deps.runtime.setShuffleEnabled(false);

    const next = new PlayNextUseCase(deps);
    const result = await next.execute();

    expect(result?.id).toBe("n-1");
    expect(deps.runtime.getState().queue.currentIndex).toBe(0);
  });

  it("returns an available track when shuffle is enabled", async () => {
    const deps = await setupQueue();
    deps.runtime.setQueue(deps.ids, 0);
    deps.runtime.setRepeatMode("all");
    deps.runtime.setShuffleEnabled(true);

    const next = new PlayNextUseCase(deps);
    const result = await next.execute();

    expect(result).not.toBeNull();
    expect(deps.ids).toContain(result?.id ?? "");
    expect(deps.audioPlayer.playing).toBe(true);
  });
});
