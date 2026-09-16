# Data Schema — Local Music Player

## 1. Scope dan Ownership

Dokumen ini membedakan tiga bentuk data agar Clean Architecture tetap terjaga:

1. **Domain entity** di `src/domain/entities`: model aturan bisnis, bebas dari Dexie/IndexedDB.
2. **Persistence record** di `src/infrastructure/persistence/dexie`: bentuk data yang disimpan IndexedDB.
3. **Presentation view model** di `src/presentation/view-models`: bentuk data siap render untuk React/MUI.

Jangan memakai satu interface yang sama untuk ketiga kebutuhan tersebut. Mapping dilakukan pada boundary masing-masing.

## 2. Entity Relationship

```text
Track ───────< PlaylistItem >────── Playlist
  │
  ├──────< PlayHistoryEntry
  └──────< QueueItem (runtime; persist opsional)

PlayerSettings adalah singleton.
FileHandleRecord adalah detail infrastructure dan terkait dengan Track ID.
```

## 3. Domain Types

### 3.1 ID dan value objects

```ts
// src/domain/value-objects/TrackId.ts
export type TrackId = string;
export type PlaylistId = string;
export type PlaylistItemId = string;
export type HistoryEntryId = string;

export type TrackAvailability = "available" | "unavailable" | "error";
export type TrackSourceType = "file-picker" | "file-system-handle";
export type RepeatMode = "off" | "all" | "one";
export type ThemePreference = "system" | "dark" | "light";

export interface Artwork {
  mimeType: string;
  dataUrl?: string;
  width?: number;
  height?: number;
}
```

### 3.2 Domain entities

```ts
// src/domain/entities/Track.ts
export interface Track {
  id: TrackId;
  sourceType: TrackSourceType;
  fileName: string;
  filePathHint?: string;
  fileSize: number;
  lastModified: number;
  fingerprint: string;
  mimeType: string;
  title: string;
  artist: string;
  album: string;
  albumArtist?: string;
  genre?: string[];
  trackNumber?: number;
  discNumber?: number;
  year?: number;
  durationSeconds: number | null;
  artwork?: Artwork;
  availability: TrackAvailability;
  isFavorite: boolean;
  playCount: number;
  lastPlayedAt?: string;
  addedAt: string;
  updatedAt: string;
}

// src/domain/entities/Playlist.ts
export interface Playlist {
  id: PlaylistId;
  name: string;
  description?: string;
  coverTrackId?: TrackId;
  createdAt: string;
  updatedAt: string;
}

// src/domain/entities/PlaylistItem.ts
export interface PlaylistItem {
  id: PlaylistItemId;
  playlistId: PlaylistId;
  trackId: TrackId;
  position: number;
  addedAt: string;
}

// src/domain/entities/PlayHistoryEntry.ts
export interface PlayHistoryEntry {
  id: HistoryEntryId;
  trackId: TrackId;
  playedAt: string;
  completed: boolean;
  listenedSeconds: number;
}

// src/domain/entities/PlayerSettings.ts
export interface PlayerSettings {
  theme: ThemePreference;
  micaEnabled: boolean;
  reduceVisualEffects: boolean;
  volume: number;
  muted: boolean;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  autoplayNext: boolean;
  persistQueue: boolean;
  visualizerEnabled: boolean;
  equalizerPreset: string;
  updatedAt: string;
}

// Runtime domain state; bukan record database langsung
export interface PlaybackQueue {
  trackIds: TrackId[];
  currentIndex: number;
}
```

## 4. Repository Ports

Ports didefinisikan pada domain. Tidak ada tipe Dexie dalam method signature.

```ts
export interface TrackRepository {
  saveMany(tracks: Track[]): Promise<void>;
  findById(id: TrackId): Promise<Track | null>;
  findByFingerprint(fingerprint: string): Promise<Track | null>;
  findAll(): Promise<Track[]>;
  search(query: string): Promise<Track[]>;
  update(track: Track): Promise<void>;
  delete(id: TrackId): Promise<void>;
}

export interface PlaylistRepository {
  save(playlist: Playlist): Promise<void>;
  findById(id: PlaylistId): Promise<Playlist | null>;
  findAll(): Promise<Playlist[]>;
  findItems(playlistId: PlaylistId): Promise<PlaylistItem[]>;
  replaceItems(playlistId: PlaylistId, items: PlaylistItem[]): Promise<void>;
  delete(id: PlaylistId): Promise<void>;
}

export interface SettingsRepository {
  get(): Promise<PlayerSettings>;
  save(settings: PlayerSettings): Promise<void>;
}

export interface HistoryRepository {
  add(entry: PlayHistoryEntry): Promise<void>;
  findRecent(limit: number): Promise<PlayHistoryEntry[]>;
  clear(): Promise<void>;
}
```

## 5. Infrastructure Persistence Records

Records boleh memiliki bentuk yang dioptimalkan untuk IndexedDB, tetapi tidak keluar dari infrastructure.

```ts
// src/infrastructure/persistence/dexie/records.ts
export interface TrackRecord {
  id: string;
  sourceType: "file-picker" | "file-system-handle";
  fileName: string;
  filePathHint?: string;
  fileSize: number;
  lastModified: number;
  fingerprint: string;
  mimeType: string;
  title: string;
  artist: string;
  album: string;
  albumArtist?: string;
  genre?: string[];
  trackNumber?: number;
  discNumber?: number;
  year?: number;
  durationSeconds: number | null;
  artwork?: Artwork;
  availability: TrackAvailability;
  isFavorite: boolean;
  playCount: number;
  lastPlayedAt?: string;
  addedAt: string;
  updatedAt: string;
}

export interface PlaylistRecord {
  id: string;
  name: string;
  description?: string;
  coverTrackId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistItemRecord {
  id: string;
  playlistId: string;
  trackId: string;
  position: number;
  addedAt: string;
}

export interface PlayerSettingsRecord extends PlayerSettings {
  id: "default";
}

export interface PersistedQueueRecord {
  id: "default";
  trackIds: string[];
  currentIndex: number;
  updatedAt: string;
}

export interface FileHandleRecord {
  trackId: string;
  handle: FileSystemFileHandle;
  savedAt: string;
}
```

`FileHandleRecord` bukan entity domain dan tidak boleh dikembalikan oleh `TrackRepository`; ia dikelola adapter file infrastructure.

## 6. Dexie Database Schema

```ts
// src/infrastructure/persistence/dexie/LocalMusicDatabase.ts
import Dexie, { type Table } from "dexie";

export class LocalMusicDatabase extends Dexie {
  tracks!: Table<TrackRecord, string>;
  playlists!: Table<PlaylistRecord, string>;
  playlistItems!: Table<PlaylistItemRecord, string>;
  history!: Table<PlayHistoryEntry, string>;
  settings!: Table<PlayerSettingsRecord, "default">;
  queues!: Table<PersistedQueueRecord, "default">;
  fileHandles!: Table<FileHandleRecord, string>;

  constructor() {
    super("localMusicPlayerDB");

    this.version(1).stores({
      tracks:
        "id, fingerprint, title, artist, album, isFavorite, availability, addedAt, lastPlayedAt, *genre",
      playlists: "id, name, createdAt, updatedAt",
      playlistItems:
        "id, playlistId, trackId, [playlistId+position], [playlistId+trackId]",
      history: "id, trackId, playedAt, [trackId+playedAt]",
      settings: "id",
      queues: "id",
      fileHandles: "trackId, savedAt",
    });
  }
}
```

## 7. Mapper Rules

Mapper berada pada `src/infrastructure/persistence/dexie/mappers`.

```ts
export const TrackMapper = {
  toDomain(record: TrackRecord): Track {
    return { ...record };
  },
  toRecord(entity: Track): TrackRecord {
    return { ...entity };
  },
};
```

Aturan mapper:

- Repository Dexie selalu memakai mapper saat data masuk/keluar.
- Presentation tidak mengimpor persistence record atau mapper Dexie.
- Domain tidak mengetahui bahwa mapper ini ada.
- Jika format persistence berubah, adaptasi dilakukan di mapper/migration tanpa memaksa perubahan component UI.

## 8. Presentation View Models

View model hanya untuk tampilan dan boleh memiliki field yang tidak relevan bagi domain.

```ts
// src/presentation/view-models/TrackListItemViewModel.ts
export interface TrackListItemViewModel {
  id: string;
  title: string;
  artistLabel: string;
  albumLabel: string;
  durationLabel: string;
  artworkUrl?: string;
  isFavorite: boolean;
  isActive: boolean;
  isUnavailable: boolean;
  accessibilityLabel: string;
}
```

Contoh mapping:

```ts
export function toTrackListItemViewModel(
  track: Track,
  activeTrackId?: string,
): TrackListItemViewModel {
  return {
    id: track.id,
    title: track.title,
    artistLabel: track.artist || "Unknown Artist",
    albumLabel: track.album || "Unknown Album",
    durationLabel: formatDuration(track.durationSeconds),
    artworkUrl: track.artwork?.dataUrl,
    isFavorite: track.isFavorite,
    isActive: track.id === activeTrackId,
    isUnavailable: track.availability !== "available",
    accessibilityLabel: `${track.title} oleh ${track.artist}`,
  };
}
```

## 9. Data Invariants

- `Track.id`, `Playlist.id`, dan `PlaylistItem.id` wajib unik dan stabil.
- `fingerprint` digunakan untuk mendeteksi duplikasi pada impor.
- `title`, `artist`, dan `album` selalu memiliki fallback non-kosong sebelum Track disimpan.
- `durationSeconds` bernilai `null` bila belum dapat ditentukan; bila ada, nilainya tidak negatif.
- `volume` berada pada rentang 0–1.
- `position` playlist item adalah integer non-negatif dan dinormalisasi menjadi `0..n-1`.
- Satu track hanya muncul sekali dalam satu playlist pada MVP.
- Menghapus playlist menghapus playlist item terkait, tetapi tidak menghapus track library.
- Menghapus track library menghapus playlist item, history, dan file handle terkait dalam satu transaction infrastructure.
- Queue hanya menyimpan `trackIds` yang masih ada; `currentIndex = -1` jika queue kosong.
- File yang tidak bisa diakses ditandai `unavailable`, bukan dihapus otomatis.

## 10. Default Settings dan Migration

```ts
export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  theme: "dark",
  micaEnabled: true,
  reduceVisualEffects: false,
  volume: 0.8,
  muted: false,
  repeatMode: "off",
  shuffleEnabled: false,
  autoplayNext: true,
  persistQueue: false,
  visualizerEnabled: false,
  equalizerPreset: "flat",
  updatedAt: new Date().toISOString(),
};
```

Saat schema Dexie berubah, buat versi baru dan migration pada infrastructure:

```ts
this.version(2)
  .stores({
    tracks:
      "id, fingerprint, title, artist, album, isFavorite, availability, addedAt, lastPlayedAt, *genre, year",
  })
  .upgrade(async (tx) => {
    await tx
      .table("settings")
      .toCollection()
      .modify((record: PlayerSettingsRecord) => {
        record.micaEnabled ??= true;
        record.reduceVisualEffects ??= false;
      });
  });
```

Migration tidak boleh tersebar di use case atau presentation layer.
