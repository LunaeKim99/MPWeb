# Architecture — Local Music Player

## 1. Ringkasan

Aplikasi adalah music player web local-first yang memutar file audio pengguna melalui browser. Proyek menerapkan **Clean Architecture** agar business rules tidak bergantung pada React, Material UI, Dexie/IndexedDB, maupun browser API.

Stack:

- React + Vite + TypeScript
- Material UI (MUI) dengan theme Material 3
- CSS variables untuk translucent/mica surfaces
- Zustand untuk state presentasi/player UI
- Dexie + IndexedDB sebagai local database
- Native `HTMLAudioElement`, Web Audio API, dan Media Session API
- Vitest + React Testing Library untuk test

Prinsip inti: dependency selalu mengarah ke dalam.

```text
Presentation ───────────────► Application ───────────────► Domain
      │                            │                         ▲
      ▼                            ▼                         │
Infrastructure ─────implements ports/repositories────────────┘
```

Domain tidak mengetahui React, MUI, IndexedDB, browser API, Dexie, atau detail implementasi lainnya.

## 2. Tujuan Arsitektur

- Memisahkan UI, use case, aturan bisnis, dan detail teknis.
- Membuat engine audio dapat diganti atau diuji dengan fake adapter.
- Membuat persistence Dexie dapat diganti tanpa mengubah use case.
- Menjaga Material 3 + mica sebagai concern presentation, bukan domain.
- Menghindari komponen React yang menampung logic playback, query database, atau parsing file.
- Memudahkan penambahan backend Laravel di masa depan tanpa menulis ulang core domain.

## 3. Layer Clean Architecture

### 3.1 Domain

Lokasi: `src/domain`.

Berisi aturan bisnis murni dan tidak boleh memiliki import dari layer lain.

Isi domain:

- Entities: `Track`, `Playlist`, `PlaylistItem`, `PlaybackQueue`, `PlayerSettings`, `PlayHistoryEntry`.
- Value objects: `TrackId`, `PlaylistId`, `Duration`, `Volume`, `TrackFingerprint`.
- Domain services: aturan shuffle, memilih next track, normalisasi urutan playlist, dan validasi playlist name.
- Repository ports: kontrak `TrackRepository`, `PlaylistRepository`, `SettingsRepository`, `HistoryRepository`.
- Gateway ports: kontrak `AudioPlayerPort`, `TrackFileResolverPort`, `MetadataReaderPort`, `MediaSessionPort`.
- Domain errors: `TrackUnavailableError`, `InvalidPlaylistNameError`, `PlaybackError`.

Contoh dependency yang **dilarang** di domain:

```ts
// Dilarang pada src/domain
import { useState } from "react";
import Dexie from "dexie";
import { Howl } from "howler";
import type { Theme } from "@mui/material";
```

### 3.2 Application

Lokasi: `src/application`.

Berisi use case yang mengorkestrasi entity dan port domain. Layer ini bergantung hanya pada domain.

Contoh use case:

- `ImportTracksUseCase`
- `GetLibraryUseCase`
- `SearchTracksUseCase`
- `PlayTrackUseCase`
- `PausePlaybackUseCase`
- `SeekPlaybackUseCase`
- `PlayNextUseCase`
- `ToggleFavoriteUseCase`
- `CreatePlaylistUseCase`
- `AddTrackToPlaylistUseCase`
- `ReorderPlaylistUseCase`
- `RecordPlayHistoryUseCase`
- `UpdatePlayerSettingsUseCase`

Use case menerima dependency melalui constructor atau factory composition root; tidak boleh mengimpor implementasi Dexie/browser secara langsung.

### 3.3 Infrastructure

Lokasi: `src/infrastructure`.

Berisi adapter untuk detail eksternal dan implementasi port:

- `persistence/dexie`: database dan repository Dexie.
- `audio`: adapter `HtmlAudioPlayerAdapter` dan `WebAudioEffectsAdapter`.
- `files`: file picker adapter, File System Access adapter, object URL registry.
- `metadata`: adapter `MusicMetadataBrowserAdapter`.
- `media-session`: adapter browser Media Session.
- `mappers`: konversi data record IndexedDB ke entity domain dan sebaliknya.

Infrastructure boleh bergantung pada domain, tetapi tidak boleh bergantung pada React pages/components.

### 3.4 Presentation

Lokasi: `src/presentation`.

Berisi React UI, MUI Material 3 theme, mica styling, view models, Zustand store, hooks UI, dan routing.

Presentation memanggil application use case melalui interface/facade yang dirakit oleh composition root. Presentation tidak boleh mengakses Dexie atau `HTMLAudioElement` langsung.

### 3.5 Composition Root

Lokasi: `src/main.tsx` dan `src/di`.

Composition root adalah satu-satunya tempat utama yang mengetahui implementasi konkret.

```text
main.tsx
  └─ createContainer()
       ├─ DexieTrackRepository implements TrackRepository
       ├─ HtmlAudioPlayerAdapter implements AudioPlayerPort
       ├─ BrowserMetadataReader implements MetadataReaderPort
       └─ PlayTrackUseCase(trackRepository, audioPlayer, ...)
```

## 4. Struktur Direktori

```text
src/
├── domain/
│   ├── entities/
│   │   ├── Track.ts
│   │   ├── Playlist.ts
│   │   ├── PlaylistItem.ts
│   │   ├── PlaybackQueue.ts
│   │   └── PlayerSettings.ts
│   ├── value-objects/
│   │   ├── TrackId.ts
│   │   ├── PlaylistId.ts
│   │   ├── Duration.ts
│   │   ├── Volume.ts
│   │   └── TrackFingerprint.ts
│   ├── repositories/
│   │   ├── TrackRepository.ts
│   │   ├── PlaylistRepository.ts
│   │   ├── SettingsRepository.ts
│   │   └── HistoryRepository.ts
│   ├── ports/
│   │   ├── AudioPlayerPort.ts
│   │   ├── MetadataReaderPort.ts
│   │   ├── TrackFileResolverPort.ts
│   │   └── MediaSessionPort.ts
│   ├── services/
│   │   ├── QueuePolicy.ts
│   │   ├── ShufflePolicy.ts
│   │   └── PlaylistOrderPolicy.ts
│   └── errors/
├── application/
│   ├── dto/
│   ├── use-cases/
│   │   ├── library/
│   │   ├── playback/
│   │   ├── playlist/
│   │   └── settings/
│   └── factories/
├── infrastructure/
│   ├── persistence/
│   │   └── dexie/
│   │       ├── LocalMusicDatabase.ts
│   │       ├── DexieTrackRepository.ts
│   │       ├── DexiePlaylistRepository.ts
│   │       ├── DexieSettingsRepository.ts
│   │       ├── DexieHistoryRepository.ts
│   │       └── mappers/
│   ├── audio/
│   │   ├── HtmlAudioPlayerAdapter.ts
│   │   ├── WebAudioEffectsAdapter.ts
│   │   └── BrowserAudioEventMapper.ts
│   ├── files/
│   │   ├── BrowserFilePickerAdapter.ts
│   │   ├── FileSystemHandleRepository.ts
│   │   └── ObjectUrlRegistry.ts
│   ├── metadata/
│   │   └── MusicMetadataBrowserAdapter.ts
│   └── media-session/
│       └── BrowserMediaSessionAdapter.ts
├── presentation/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── AppProviders.tsx
│   │   └── routes.tsx
│   ├── theme/
│   │   ├── createAppTheme.ts
│   │   ├── componentOverrides.ts
│   │   └── mica.css
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── library/
│   │   ├── player/
│   │   └── playlist/
│   ├── pages/
│   ├── stores/
│   │   ├── playerStore.ts
│   │   ├── libraryStore.ts
│   │   ├── playlistStore.ts
│   │   └── settingsStore.ts
│   ├── hooks/
│   ├── view-models/
│   └── utils/
├── di/
│   ├── container.ts
│   └── tokens.ts
└── shared/
    ├── result/
    ├── errors/
    └── utils/
```

## 5. Dependency Rules

| From             | Allowed dependencies              | Forbidden dependencies                                                     |
| ---------------- | --------------------------------- | -------------------------------------------------------------------------- |
| `domain`         | `shared` only                     | application, infrastructure, presentation, React, MUI, Dexie, browser APIs |
| `application`    | domain, shared                    | infrastructure, presentation, React, MUI, Dexie                            |
| `infrastructure` | domain, application DTOs, shared  | presentation components/pages/stores                                       |
| `presentation`   | application, domain types, shared | direct Dexie and direct audio/file adapters                                |
| `di`             | all layers                        | N/A; this is the explicit wiring location                                  |

## 6. Alur Use Case Playback

1. User menekan track pada `TrackList`.
2. Komponen memanggil action presentasi `playTrack(trackId)`.
3. Action mengambil `PlayTrackUseCase` dari application facade/container.
4. Use case mengambil entity `Track` lewat `TrackRepository`.
5. Use case meminta `TrackFileResolverPort` mendapatkan playable source.
6. Use case memanggil `AudioPlayerPort.load()` lalu `AudioPlayerPort.play()`.
7. `HtmlAudioPlayerAdapter` menerjemahkan event browser menjadi event application/presentation yang terkontrol.
8. `playerStore` memperbarui view state; MUI components merender status baru.
9. `MediaSessionPort` diperbarui saat track aktif berubah.

```text
React Component
  → Presentation Store/Controller
    → PlayTrackUseCase
      → TrackRepository (port)
      → TrackFileResolverPort
      → AudioPlayerPort
        → HtmlAudioPlayerAdapter
          → HTMLAudioElement
```

## 7. Audio Graph

```text
HTMLAudioElement
      │
      ▼
MediaElementAudioSourceNode
      │
      ▼
Equalizer filter chain (opsional)
      │
      ├────────► AnalyserNode ───► Canvas Visualizer (presentation)
      │
      ▼
GainNode
      │
      ▼
AudioContext.destination
```

`HtmlAudioPlayerAdapter` dan `WebAudioEffectsAdapter` menyembunyikan detail browser dari use case. Satu `HTMLAudioElement` dan satu `MediaElementAudioSourceNode` dikelola untuk lifecycle aplikasi.

## 8. Material 3 dan Mica

Material 3/mica berada sepenuhnya pada presentation layer:

- `presentation/theme` membangun MUI theme dan component overrides.
- `presentation/components/common/MicaSurface.tsx` menjadi primitive untuk shell/panel besar.
- `settingsStore` memetakan pilihan UI ke `UpdatePlayerSettingsUseCase`.
- Domain hanya mengenal `ThemePreference` dan `micaEnabled` sebagai nilai data sederhana bila setting perlu dipersistenkan; domain tidak mengenal MUI atau CSS.

Efek `backdrop-filter` harus punya fallback opaque dan hanya dipakai pada app shell, navigation rail, app bar, player bar, serta dialog/sheet besar.

## 9. Testing Strategy

- Domain: unit test murni tanpa browser/React.
- Application: unit test use case dengan in-memory repository dan fake audio/file ports.
- Infrastructure: integration test adapter dengan mock browser API/Dexie test database.
- Presentation: component test untuk user interaction, accessibility, dan rendering state.
- End-to-end/manual: impor file → play → seek → queue → playlist → refresh.

## 10. Evolusi Backend

Jika kelak ditambah Laravel API, domain dan use case tidak berubah. Buat adapter baru, misalnya `LaravelTrackRepository`, yang tetap mengimplementasikan `TrackRepository`. Composition root memilih adapter local Dexie atau API berdasarkan mode aplikasi.
