import type {
  AudioPlayerPort,
  MediaSessionPort,
  MetadataReaderPort,
  TrackFileResolverPort,
} from "@/domain/ports/ports.ts";
import type {
  HistoryRepository,
  PlaylistRepository,
  SettingsRepository,
  TrackRepository,
} from "@/domain/repositories/repositories.ts";
import type { AppFacade } from "@/application/factories/AppFacade.ts";
import type { Track } from "@/domain/entities/Track.ts";
import {
  AddToQueueUseCase,
  PlayTrackNextUseCase,
  RemoveFromQueueUseCase,
} from "@/application/use-cases/playback/QueueUseCases.ts";
import { ImportTracksUseCase } from "@/application/use-cases/library/ImportTracksUseCase.ts";
import {
  GetLibraryUseCase,
  RemoveTrackUseCase,
  SearchTracksUseCase,
  ToggleFavoriteUseCase,
} from "@/application/use-cases/library/LibraryUseCases.ts";
import {
  ClearHistoryUseCase,
  GetRecentHistoryUseCase,
} from "@/application/use-cases/library/HistoryUseCases.ts";
import {
  AddTrackToPlaylistUseCase,
  CreatePlaylistUseCase,
  DeletePlaylistUseCase,
  GetPlaylistsUseCase,
  RemoveTrackFromPlaylistUseCase,
  RenamePlaylistUseCase,
  ReorderPlaylistUseCase,
} from "@/application/use-cases/playlist/PlaylistUseCases.ts";
import {
  GetPlayerSettingsUseCase,
  UpdatePlayerSettingsUseCase,
} from "@/application/use-cases/settings/SettingsUseCases.ts";
import { PlayTrackUseCase } from "@/application/use-cases/playback/PlayTrackUseCase.ts";
import {
  PausePlaybackUseCase,
  SeekPlaybackUseCase,
  SetRepeatUseCase,
  SetShuffleUseCase,
  SetVolumeUseCase,
  TogglePlayPauseUseCase,
} from "@/application/use-cases/playback/PlaybackControlsUseCases.ts";
import {
  PlayNextUseCase,
  PlayPreviousUseCase,
} from "@/application/use-cases/playback/PlayNextPreviousUseCases.ts";
import { PlaybackRuntime } from "@/application/use-cases/playback/PlaybackRuntime.ts";
import type { ImportFileInput } from "@/application/dto/ImportOutcome.ts";
import type { AudioPlaybackStatus } from "@/domain/ports/ports.ts";
import type { RepeatMode } from "@/domain/value-objects/ids.ts";
import { HtmlAudioPlayerAdapter } from "@/infrastructure/audio/HtmlAudioPlayerAdapter.ts";
import { BrowserMediaSessionAdapter } from "@/infrastructure/media-session/BrowserMediaSessionAdapter.ts";
import { BrowserFileResolver } from "@/infrastructure/files/BrowserFileResolver.ts";
import {
  InMemoryHistoryRepository,
  InMemoryPlaylistRepository,
  InMemorySettingsRepository,
  InMemoryTrackRepository,
} from "@/infrastructure/persistence/dexie/inMemoryRepositories.ts";
import {
  FakeAudioPlayer,
  FakeMediaSession,
  FakeTrackFileResolver,
} from "@/infrastructure/audio/fakeAudioPorts.ts";
import { FakeMetadataReader } from "@/infrastructure/audio/fakeAudioPorts.ts";
import { BrowserMetadataReader } from "@/infrastructure/metadata/BrowserMetadataReader.ts";
import { DexieHistoryRepository, DexieSettingsRepository } from "@/infrastructure/persistence/dexie/DexieHistoryRepository.ts";
import { DexiePlaylistRepository } from "@/infrastructure/persistence/dexie/DexiePlaylistRepository.ts";
import { DexieTrackRepository } from "@/infrastructure/persistence/dexie/DexieTrackRepository.ts";
import { LocalMusicDatabase } from "@/infrastructure/persistence/dexie/LocalMusicDatabase.ts";

export interface AppContainer {
  trackRepository: TrackRepository;
  playlistRepository: PlaylistRepository;
  settingsRepository: SettingsRepository;
  historyRepository: HistoryRepository;
  audioPlayer: AudioPlayerPort;
  fileResolver: TrackFileResolverPort;
  metadataReader: MetadataReaderPort;
  mediaSession: MediaSessionPort;
  facade: AppFacade;
}

function createFacade(container: {
  trackRepository: TrackRepository;
  playlistRepository: PlaylistRepository;
  settingsRepository: SettingsRepository;
  historyRepository: HistoryRepository;
  audioPlayer: AudioPlayerPort;
  fileResolver: TrackFileResolverPort;
  mediaSession: MediaSessionPort;
  metadataReader: MetadataReaderPort;
}): AppFacade {
  const importUseCase = new ImportTracksUseCase({
    trackRepository: container.trackRepository,
    metadataReader: container.metadataReader,
  });
  const getLibraryUseCase = new GetLibraryUseCase(container.trackRepository);
  const searchTracksUseCase = new SearchTracksUseCase(container.trackRepository);
  const toggleFavoriteUseCase = new ToggleFavoriteUseCase(container.trackRepository);
  const removeTrackUseCase = new RemoveTrackUseCase(container.trackRepository);
  const getPlaylistsUseCase = new GetPlaylistsUseCase(container.playlistRepository);
  const createPlaylistUseCase = new CreatePlaylistUseCase(container.playlistRepository);
  const addTrackToPlaylistUseCase = new AddTrackToPlaylistUseCase(container.playlistRepository);
  const removeTrackFromPlaylistUseCase = new RemoveTrackFromPlaylistUseCase(container.playlistRepository);
  const reorderPlaylistUseCase = new ReorderPlaylistUseCase(container.playlistRepository);
  const renamePlaylistUseCase = new RenamePlaylistUseCase(container.playlistRepository);
  const deletePlaylistUseCase = new DeletePlaylistUseCase(container.playlistRepository);
  const getRecentHistoryUseCase = new GetRecentHistoryUseCase(container.historyRepository);
  const clearHistoryUseCase = new ClearHistoryUseCase(container.historyRepository);
  const getSettingsUseCase = new GetPlayerSettingsUseCase(container.settingsRepository);
  const updateSettingsUseCase = new UpdatePlayerSettingsUseCase(container.settingsRepository);

  // Playback wiring: runtime session state + use cases over domain policies
  const runtime = new PlaybackRuntime();
  const playTrackUseCase = new PlayTrackUseCase({
    trackRepository: container.trackRepository,
    audioPlayer: container.audioPlayer,
    trackFileResolver: container.fileResolver,
    historyRepository: container.historyRepository,
    mediaSessionPort: container.mediaSession,
    playbackRuntime: runtime,
  });
  const pauseUseCase = new PausePlaybackUseCase(container.audioPlayer);
  const seekUseCase = new SeekPlaybackUseCase(container.audioPlayer);
  const volumeUseCase = new SetVolumeUseCase(container.audioPlayer);
  const repeatUseCase = new SetRepeatUseCase((mode) => runtime.setRepeatMode(mode));
  const shuffleUseCase = new SetShuffleUseCase((enabled) =>
    runtime.setShuffleEnabled(enabled),
  );
  const nextDeps = {
    trackRepository: container.trackRepository,
    audioPlayer: container.audioPlayer,
    trackFileResolver: container.fileResolver,
    runtime,
    historyRepository: container.historyRepository,
    mediaSessionPort: container.mediaSession,
  };
  const nextUseCase = new PlayNextUseCase(nextDeps);
  const prevUseCase = new PlayPreviousUseCase(nextDeps);
  const addToQueueUseCase = new AddToQueueUseCase(runtime);
  const playTrackNextUseCase = new PlayTrackNextUseCase(runtime);
  const removeFromQueueUseCase = new RemoveFromQueueUseCase(runtime);

  let lastStatus: AudioPlaybackStatus = "idle";
  const playNextTrack = (): Promise<Track | null> => nextUseCase.execute();
  const toggleUseCase = new TogglePlayPauseUseCase({
    audioPlayer: container.audioPlayer,
    getStatus: () => lastStatus,
  });
  container.audioPlayer.subscribe((event) => {
    lastStatus = event.status;
    if (event.status === "ended") {
      void (async () => {
        try {
          const settings = await getSettingsUseCase.execute();
          if (settings.autoplayNext) await playNextTrack();
        } catch {
          console.warn("Autoplay-next after track ended failed");
        }
      })();
    }
  });

  const facade = {
    getLibrary: (query) => getLibraryUseCase.execute(query),
    searchTracks: (query) => searchTracksUseCase.execute(query),
    importTracks: (files: ImportFileInput[]) => importUseCase.execute(files),
    toggleFavorite: (trackId: string) => toggleFavoriteUseCase.execute(trackId),
    removeTrack: async (trackId: string) => {
      const track = await container.trackRepository.findById(trackId);
      if (track && container.fileResolver instanceof BrowserFileResolver) {
        container.fileResolver.revoke(track);
      }
      await removeTrackUseCase.execute(trackId);
    },
    getPlaylists: () => getPlaylistsUseCase.execute(),
    getPlaylistItems: (playlistId: string) =>
      container.playlistRepository.findItems(playlistId),
    createPlaylist: (name: string, description?: string | undefined) => {
      const input: { name: string; description?: string | undefined } = { name };
      if (description !== undefined) input.description = description;
      return createPlaylistUseCase.execute(input);
    },
    renamePlaylist: (playlistId: string, name: string) =>
      renamePlaylistUseCase.execute({ playlistId, name }),
    addTrackToPlaylist: (playlistId: string, trackId: string) =>
      addTrackToPlaylistUseCase.execute({ playlistId, trackId }),
    removeTrackFromPlaylist: (playlistId: string, trackId: string) =>
      removeTrackFromPlaylistUseCase.execute({ playlistId, trackId }),
    reorderPlaylist: (playlistId: string, orderedTrackIds: string[]) =>
      reorderPlaylistUseCase.execute({ playlistId, orderedTrackIds }),
    deletePlaylist: (playlistId: string) => deletePlaylistUseCase.execute(playlistId),
    getRecentHistory: (limit: number) => getRecentHistoryUseCase.execute(limit),
    clearHistory: () => clearHistoryUseCase.execute(),
    getSettings: () => getSettingsUseCase.execute(),
    updateSettings: (patch) => updateSettingsUseCase.execute(patch),

    // Playback
    playTrack: (trackId: string, queueIds?: string[]) =>
      playTrackUseCase.execute(queueIds ? { trackId, queueIds } : { trackId }),
    togglePlayPause: () => toggleUseCase.execute(),
    pausePlayback: () => pauseUseCase.execute(),
    seekTo: (positionSeconds: number) => seekUseCase.execute(positionSeconds),
    playNextTrack: () => playNextTrack(),
    playPreviousTrack: () => prevUseCase.execute(),
    setVolume: async (volume: number) => {
      await volumeUseCase.execute({ volume });
      await updateSettingsUseCase.execute({ volume });
    },
    setMuted: async (muted: boolean) => {
      await container.audioPlayer.setMuted(muted);
      await updateSettingsUseCase.execute({ muted });
    },
    setRepeatMode: async (mode: RepeatMode) => {
      await repeatUseCase.execute(mode);
      await updateSettingsUseCase.execute({ repeatMode: mode });
    },
    setShuffleEnabled: async (enabled: boolean) => {
      await shuffleUseCase.execute(enabled);
      await updateSettingsUseCase.execute({ shuffleEnabled: enabled });
    },
    addToQueue: (trackIds: string[]) => addToQueueUseCase.execute(trackIds),
    playTrackNext: (trackId: string) => playTrackNextUseCase.execute(trackId),
    removeFromQueue: (trackId: string) => removeFromQueueUseCase.execute(trackId),
    getPlaybackQueue: async () => runtime.getState().queue,
    getCurrentTrack: async () => {
      const state = runtime.getState();
      const id = state.queue.trackIds[state.queue.currentIndex];
      if (!id) return null;
      return container.trackRepository.findById(id);
    },
    subscribePlayback: (listener) => container.audioPlayer.subscribe(listener),
  } as AppFacade;

  if (container.mediaSession instanceof BrowserMediaSessionAdapter) {
    container.mediaSession.setActions({
      onPlay: () => void facade.togglePlayPause(),
      onPause: () => void facade.pausePlayback(),
      onNext: () => void facade.playNextTrack(),
      onPrevious: () => void facade.playPreviousTrack(),
    });
  }

  return facade;
}

export function createInMemoryContainer(): AppContainer {
  const trackRepository = new InMemoryTrackRepository();
  const playlistRepository = new InMemoryPlaylistRepository();
  const settingsRepository = new InMemorySettingsRepository();
  const historyRepository = new InMemoryHistoryRepository();
  const audioPlayer = new FakeAudioPlayer();
  const fileResolver = new FakeTrackFileResolver();
  const metadataReader: MetadataReaderPort = new FakeMetadataReader();
  const mediaSession = new FakeMediaSession();
  const facade = createFacade({
    trackRepository,
    playlistRepository,
    settingsRepository,
    historyRepository,
    audioPlayer,
    fileResolver,
    mediaSession,
    metadataReader,
  });
  return {
    trackRepository,
    playlistRepository,
    settingsRepository,
    historyRepository,
    audioPlayer,
    fileResolver,
    metadataReader,
    mediaSession,
    facade,
  };
}

export function createDexieContainer(): AppContainer {
  const db = new LocalMusicDatabase();
  const trackRepository = new DexieTrackRepository(db);
  const playlistRepository = new DexiePlaylistRepository(db);
  const settingsRepository = new DexieSettingsRepository(db);
  const historyRepository = new DexieHistoryRepository(db);
  const audioPlayer = new HtmlAudioPlayerAdapter();
  const fileResolver = new BrowserFileResolver();
  const metadataReader: MetadataReaderPort = new BrowserMetadataReader();
  const mediaSession = new BrowserMediaSessionAdapter();
  const facade = createFacade({
    trackRepository,
    playlistRepository,
    settingsRepository,
    historyRepository,
    audioPlayer,
    fileResolver,
    mediaSession,
    metadataReader,
  });
  return {
    trackRepository,
    playlistRepository,
    settingsRepository,
    historyRepository,
    audioPlayer,
    fileResolver,
    metadataReader,
    mediaSession,
    facade,
  };
}

let container: AppContainer | null = null;

export function getContainer(): AppContainer {
  container ??= typeof window === "undefined" ? createInMemoryContainer() : createDexieContainer();
  return container;
}

export function resetContainer(): AppContainer {
  container = createInMemoryContainer();
  return container;
}
