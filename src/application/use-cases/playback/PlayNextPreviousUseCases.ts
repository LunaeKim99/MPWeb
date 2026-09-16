import type { Track } from "@/domain/entities/Track.ts";
import type {
  HistoryRepository,
  TrackRepository,
} from "@/domain/repositories/repositories.ts";
import type {
  AudioPlayerPort,
  MediaSessionPort,
  TrackFileResolverPort,
} from "@/domain/ports/ports.ts";
import {
  selectNextTrack,
  selectPreviousTrack,
} from "@/domain/services/policies.ts";
import { PlaybackRuntime } from "@/application/use-cases/playback/PlaybackRuntime.ts";
import { PlayTrackUseCase } from "@/application/use-cases/playback/PlayTrackUseCase.ts";

export interface NextPrevDeps {
  trackRepository: TrackRepository;
  audioPlayer: AudioPlayerPort;
  trackFileResolver: TrackFileResolverPort;
  runtime: PlaybackRuntime;
  historyRepository?: HistoryRepository | undefined;
  mediaSessionPort?: MediaSessionPort | undefined;
}

function buildPlayTrack(deps: NextPrevDeps): PlayTrackUseCase {
  return new PlayTrackUseCase({
    trackRepository: deps.trackRepository,
    audioPlayer: deps.audioPlayer,
    trackFileResolver: deps.trackFileResolver,
    historyRepository: deps.historyRepository,
    mediaSessionPort: deps.mediaSessionPort,
    playbackRuntime: deps.runtime,
  });
}

async function availableIds(trackRepository: TrackRepository): Promise<Set<string>> {
  const tracks = await trackRepository.findAll();
  return new Set(tracks.filter((t) => t.availability === "available").map((t) => t.id));
}

async function recentHistoryIds(
  historyRepository: HistoryRepository | undefined,
): Promise<string[]> {
  if (!historyRepository) return [];
  const entries = await historyRepository.findRecent(100);
  return entries.map((e) => e.trackId);
}

export class PlayNextUseCase {
  constructor(private readonly deps: NextPrevDeps) {}

  async execute(): Promise<Track | null> {
    const runtime = this.deps.runtime.getState();
    const available = await availableIds(this.deps.trackRepository);
    const history = await recentHistoryIds(this.deps.historyRepository);
    const nextId = selectNextTrack({
      queue: runtime.queue,
      repeatMode: runtime.repeatMode,
      shuffleEnabled: runtime.shuffleEnabled,
      history,
      available,
    });
    if (!nextId) return null;
    const playTrack = buildPlayTrack(this.deps);
    const track = await playTrack.execute({
      trackId: nextId,
      queueIds: runtime.queue.trackIds,
    });
    return track;
  }
}

export class PlayPreviousUseCase {
  constructor(private readonly deps: NextPrevDeps) {}

  async execute(): Promise<Track | null> {
    const runtime = this.deps.runtime.getState();
    const available = await availableIds(this.deps.trackRepository);
    const prevId = selectPreviousTrack({ queue: runtime.queue, available });
    if (!prevId) return null;
    const playTrack = buildPlayTrack(this.deps);
    const track = await playTrack.execute({
      trackId: prevId,
      queueIds: runtime.queue.trackIds,
    });
    return track;
  }
}
