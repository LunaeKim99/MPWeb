import type { Track } from "@/domain/entities/Track.ts";
import type { TrackRepository } from "@/domain/repositories/repositories.ts";
import type {
  AudioPlayerPort,
  MediaSessionPort,
  TrackFileResolverPort,
} from "@/domain/ports/ports.ts";
import type { HistoryRepository } from "@/domain/repositories/repositories.ts";
import { PlaybackError, TrackUnavailableError } from "@/domain/errors/errors.ts";
import { PlaybackRuntime } from "@/application/use-cases/playback/PlaybackRuntime.ts";

interface PlayTrackDeps {
  trackRepository: TrackRepository;
  audioPlayer: AudioPlayerPort;
  trackFileResolver: TrackFileResolverPort;
  historyRepository?: HistoryRepository | undefined;
  mediaSessionPort?: MediaSessionPort | undefined;
  playbackRuntime?: PlaybackRuntime | undefined;
  now?: () => string;
  createId?: () => string;
}

export class PlayTrackUseCase {
  constructor(private readonly deps: PlayTrackDeps) {}

  async execute(input: { trackId: string; queueIds?: string[] }): Promise<Track> {
    const track = await this.deps.trackRepository.findById(input.trackId);
    if (!track) throw new TrackUnavailableError("Track not found");
    if (track.availability !== "available") throw new TrackUnavailableError("Track unavailable");

    const source = await this.deps.trackFileResolver.resolve(track);
    if (!source) throw new TrackUnavailableError("No playable source for track");

    if (input.queueIds && this.deps.playbackRuntime) {
      const idx = input.queueIds.indexOf(input.trackId);
      this.deps.playbackRuntime.setQueue(input.queueIds, idx >= 0 ? idx : 0);
    } else if (this.deps.playbackRuntime) {
      this.deps.playbackRuntime.setQueue([input.trackId], 0);
    }

    try {
      await this.deps.audioPlayer.load(source);
      await this.deps.audioPlayer.play();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Playback failed";
      throw new PlaybackError(message);
    }

    if (this.deps.historyRepository) {
      const now = this.deps.now ?? (() => new Date().toISOString());
      const createId = this.deps.createId ?? (() => crypto.randomUUID());
      try {
        await this.deps.historyRepository.add({
          id: createId(),
          trackId: track.id,
          playedAt: now(),
          completed: false,
          listenedSeconds: 0,
        });
      } catch {
        // ignore history failure
      }
    }

    if (this.deps.mediaSessionPort) {
      this.deps.mediaSessionPort.update({
        title: track.title,
        artist: track.artist,
        album: track.album,
        trackId: track.id,
        artworkUrl: track.artwork?.dataUrl,
      });
    }

    return track;
  }
}