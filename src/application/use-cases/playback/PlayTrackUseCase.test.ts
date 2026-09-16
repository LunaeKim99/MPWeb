import { describe, expect, it } from "vitest";
import { PlayTrackUseCase } from "@/application/use-cases/playback/PlayTrackUseCase.ts";
import { PlaybackRuntime } from "@/application/use-cases/playback/PlaybackRuntime.ts";
import type { Track } from "@/domain/entities/Track.ts";
import { PlaybackError, TrackUnavailableError } from "@/domain/errors/errors.ts";
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

function setup() {
  const trackRepository = new InMemoryTrackRepository();
  const audioPlayer = new FakeAudioPlayer();
  const trackFileResolver = new FakeTrackFileResolver();
  const historyRepository = new InMemoryHistoryRepository();
  const mediaSessionPort = new FakeMediaSession();
  const playbackRuntime = new PlaybackRuntime();
  const useCase = new PlayTrackUseCase({
    trackRepository,
    audioPlayer,
    trackFileResolver,
    historyRepository,
    mediaSessionPort,
    playbackRuntime,
  });
  return {
    trackRepository,
    audioPlayer,
    trackFileResolver,
    historyRepository,
    mediaSessionPort,
    playbackRuntime,
    useCase,
  };
}

describe("PlayTrackUseCase", () => {
  it("plays an available track with a resolved source", async () => {
    const { trackRepository, audioPlayer, trackFileResolver, useCase } =
      setup();
    const track = makeTrack("track-1");
    await trackRepository.saveMany([track]);
    trackFileResolver.set(track, "blob:track-1");

    const result = await useCase.execute({ trackId: track.id });

    expect(result.id).toBe(track.id);
    expect(audioPlayer.loadedSource).toBe("blob:track-1");
    expect(audioPlayer.playing).toBe(true);
  });

  it("throws TrackUnavailableError when the track is missing", async () => {
    const { useCase } = setup();

    await expect(useCase.execute({ trackId: "missing-id" })).rejects.toBeInstanceOf(
      TrackUnavailableError,
    );
  });

  it("throws TrackUnavailableError when the resolver returns null", async () => {
    const { trackRepository, useCase } = setup();
    const track = makeTrack("track-2");
    await trackRepository.saveMany([track]);

    await expect(useCase.execute({ trackId: track.id })).rejects.toBeInstanceOf(
      TrackUnavailableError,
    );
  });

  it("wraps an audio play failure in PlaybackError", async () => {
    const { trackRepository, audioPlayer, trackFileResolver, useCase } =
      setup();
    const track = makeTrack("track-3");
    await trackRepository.saveMany([track]);
    trackFileResolver.set(track, "blob:track-3");
    audioPlayer.failPlay = true;

    await expect(useCase.execute({ trackId: track.id })).rejects.toBeInstanceOf(
      PlaybackError,
    );
  });

  it("sets the runtime queue from the queueIds option", async () => {
    const {
      trackRepository,
      trackFileResolver,
      playbackRuntime,
      useCase,
    } = setup();
    const ids = ["q-1", "q-2", "q-3"];
    const tracks = ids.map((id) => makeTrack(id));
    await trackRepository.saveMany(tracks);
    for (const track of tracks) {
      trackFileResolver.set(track, `blob:${track.id}`);
    }

    await useCase.execute({ trackId: "q-2", queueIds: ids });

    const state = playbackRuntime.getState();
    expect(state.queue.trackIds).toEqual(ids);
    expect(state.queue.currentIndex).toBe(1);
  });

  it("records a history entry and updates the media session", async () => {
    const {
      trackRepository,
      trackFileResolver,
      historyRepository,
      mediaSessionPort,
      useCase,
    } = setup();
    const track = makeTrack("track-4");
    await trackRepository.saveMany([track]);
    trackFileResolver.set(track, "blob:track-4");

    await useCase.execute({ trackId: track.id });

    const recent = await historyRepository.findRecent(10);
    expect(recent).toHaveLength(1);
    expect(recent[0]?.trackId).toBe(track.id);
    expect(mediaSessionPort.lastTrack?.trackId).toBe(track.id);
    expect(mediaSessionPort.lastTrack?.title).toBe(track.title);
  });
});
