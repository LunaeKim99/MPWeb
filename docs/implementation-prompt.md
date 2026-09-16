# Master Implementation Prompt — MPWeb

> Gunakan prompt ini pada AI coding agent setelah lima dokumen berikut berada di root repository:
>
> - `architecture.md`
> - `design.md`
> - `PRD.md`
> - `rule.md`
> - `schema.md`

```text
Kamu adalah Senior Frontend Engineer dan Software Architect. Buat aplikasi web local-first bernama "MPWeb" sesuai dokumen proyek yang tersedia di root repository:

- architecture.md
- design.md
- PRD.md
- rule.md
- schema.md

Baca kelima dokumen tersebut secara penuh sebelum menulis atau mengubah kode. Dokumen-dokumen itu adalah source of truth. Jika ada konflik, gunakan prioritas berikut:

1. rule.md
2. architecture.md
3. schema.md
4. PRD.md
5. design.md

## Tujuan aplikasi

Buat aplikasi music player berbasis web yang berjalan secara lokal melalui browser. Pengguna dapat memilih file audio dari perangkatnya, memutar musik, mengelola library, queue, playlist, favorite, history, serta setting tanpa backend dan tanpa mengunggah file audio ke server.

Aplikasi harus memakai:

- React
- Vite
- TypeScript strict
- Material UI (MUI) sebagai component system Material Design 3
- CSS variables dan CSS `backdrop-filter` untuk efek translucent/mica dengan fallback opaque
- Zustand untuk presentation state
- Dexie dan IndexedDB untuk local persistence
- Native `HTMLAudioElement` untuk playback utama
- Web Audio API sebagai fondasi fitur visualizer/equalizer yang dapat dikembangkan
- Media Session API jika browser mendukung
- React Router untuk routing
- Lucide React atau Material Icons untuk icon
- Vitest dan React Testing Library untuk test

Jangan menggunakan backend, Firebase, Supabase, external API, streaming service, atau autentikasi pada MVP.

## Prinsip kerja wajib

1. Terapkan Clean Architecture secara ketat.
2. Dependency hanya boleh mengarah ke dalam.
3. `domain` tidak boleh mengimpor React, MUI, Zustand, Dexie, IndexedDB, browser API, atau module dari application/infrastructure/presentation.
4. `application` hanya boleh bergantung pada `domain` dan `shared`.
5. `infrastructure` mengimplementasikan port/repository dari core.
6. `presentation` hanya mengakses application use case/facade dan type domain yang diperlukan.
7. Hanya `src/di` atau `src/main.tsx` yang boleh melakukan wiring dependency konkret.
8. Jangan membuat `new Audio()` di React component atau Zustand store.
9. Jangan menjalankan query Dexie langsung dari React component.
10. Jangan memakai `any`; gunakan type/interface yang eksplisit.
11. Jangan membuat fitur di luar scope MVP sebelum fitur inti selesai.

## Struktur folder wajib

Gunakan atau sesuaikan struktur berikut:

src/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/
│   ├── ports/
│   ├── services/
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
│   ├── persistence/dexie/
│   │   └── mappers/
│   ├── audio/
│   ├── files/
│   ├── metadata/
│   └── media-session/
├── presentation/
│   ├── app/
│   ├── theme/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── library/
│   │   ├── player/
│   │   └── playlist/
│   ├── pages/
│   ├── stores/
│   ├── hooks/
│   ├── view-models/
│   └── utils/
├── di/
└── shared/

## Domain dan application requirements

Buat domain entity/type minimal:

- `Track`
- `Playlist`
- `PlaylistItem`
- `PlayHistoryEntry`
- `PlayerSettings`
- `PlaybackQueue`
- `TrackId`, `PlaylistId`, dan value/type pendukung
- `RepeatMode`: `off | all | one`
- `TrackAvailability`: `available | unavailable | error`
- `TrackSourceType`: `file-picker | file-system-handle`
- `ThemePreference`: `system | dark | light`

Buat repository/port contract minimal:

- `TrackRepository`
- `PlaylistRepository`
- `SettingsRepository`
- `HistoryRepository`
- `AudioPlayerPort`
- `TrackFileResolverPort`
- `MetadataReaderPort`
- `MediaSessionPort`

Buat use case minimal:

- `ImportTracksUseCase`
- `GetLibraryUseCase`
- `SearchTracksUseCase`
- `PlayTrackUseCase`
- `PausePlaybackUseCase`
- `SeekPlaybackUseCase`
- `PlayNextUseCase`
- `PlayPreviousUseCase`
- `ToggleFavoriteUseCase`
- `CreatePlaylistUseCase`
- `AddTrackToPlaylistUseCase`
- `RemoveTrackFromPlaylistUseCase`
- `ReorderPlaylistUseCase`
- `GetPlaylistsUseCase`
- `RecordPlayHistoryUseCase`
- `GetRecentHistoryUseCase`
- `GetPlayerSettingsUseCase`
- `UpdatePlayerSettingsUseCase`

Buat domain policy/service minimal:

- Aturan memilih track selanjutnya berdasarkan queue, repeat mode, dan shuffle.
- Aturan memilih track sebelumnya.
- Aturan normalisasi posisi item playlist.
- Validasi nama playlist.

Semua policy ini wajib dapat diuji tanpa React, browser, atau IndexedDB.

## Infrastructure requirements

### IndexedDB

Gunakan Dexie dengan nama database `localMusicPlayerDB` dan implementasikan schema sesuai `schema.md`.

Buat class berikut:

- `LocalMusicDatabase`
- `DexieTrackRepository`
- `DexiePlaylistRepository`
- `DexieSettingsRepository`
- `DexieHistoryRepository`
- Mapper record-to-domain dan domain-to-record yang terpisah

Jangan membocorkan `TrackRecord` atau tipe Dexie ke presentation maupun domain.

### Audio

Buat `HtmlAudioPlayerAdapter` yang mengimplementasikan `AudioPlayerPort`.

Ketentuan:

- Adapter adalah pemilik tunggal satu instance `HTMLAudioElement`.
- Tangani event: `loadedmetadata`, `timeupdate`, `play`, `pause`, `ended`, dan `error`.
- `play()` harus menangani Promise rejection, termasuk autoplay restriction.
- Jangan membuat lebih dari satu `MediaElementAudioSourceNode` untuk audio element yang sama.
- Adapter harus mendukung load source, play, pause, seek, set volume, mute, dan dispose.
- Object URL dikelola menggunakan `ObjectUrlRegistry`, lalu dibersihkan saat tidak digunakan.

### File dan metadata

- Buat adapter file picker untuk menerima banyak file audio.
- Validasi MIME type dan ekstensi audio secara defensif.
- Implementasikan fingerprint minimal: `file.name + file.size + file.lastModified`.
- Gunakan parser metadata browser untuk membaca title, artist, album, artwork, duration bila tersedia.
- Jika parsing metadata gagal, gunakan fallback title dari nama file dan `Unknown Artist`/`Unknown Album`.
- Satu file error tidak boleh membatalkan import file lain.
- Jangan menyimpan object URL ke IndexedDB.
- File yang tidak tersedia harus ditandai `unavailable`, bukan langsung dihapus dari library/playlist.

### Media Session

Buat adapter yang aman bila `navigator.mediaSession` tidak tersedia.

- Perbarui title, artist, album, dan artwork saat track aktif berubah.
- Jika didukung, hubungkan action play, pause, next, dan previous ke intent player.

## Presentation requirements

### Theme dan visual

Gunakan Material 3 sebagai fondasi UI:

- Satu `ThemeProvider` global.
- Dark mode sebagai default, dengan opsi `system`, `dark`, dan `light`.
- Semantic theme color roles; jangan hardcode warna hex pada component.
- Buat `MicaSurface` reusable untuk app shell, navigation rail, top app bar, player bar, dan dialog/sheet besar.
- Transparansi/blur harus bisa dimatikan melalui setting `micaEnabled`.
- Gunakan fallback solid apabila browser tidak mendukung `backdrop-filter`.
- Hormati `prefers-reduced-motion` dan setting `reduceVisualEffects`.
- Jangan gunakan blur pada setiap row track atau elemen list yang berjumlah banyak.

### Routing

Buat route:

- `/` — Home
- `/library` — Library
- `/favorites` — Favorites
- `/playlists` — List playlist
- `/playlists/:playlistId` — Detail playlist
- `/settings` — Settings

### Halaman

Buat halaman berikut:

1. Home
   - CTA import musik.
   - Recently played.
   - Playlist terbaru.
   - Empty state bila library kosong.

2. Library
   - Tombol pilih file audio.
   - Search input.
   - Filter/sort minimum yang fungsional.
   - Daftar track dengan artwork, title, artist, album, durasi, favorite, dan menu aksi.
   - Aksi play, play next, add to queue, add to playlist, favorite, dan remove from library.

3. Favorites
   - Reuse `TrackList`; data hanya berisi favorite tracks.

4. Playlists
   - Daftar playlist.
   - Create playlist.
   - Akses detail playlist.

5. Playlist detail
   - Informasi playlist.
   - Play all dan shuffle.
   - List track playlist.
   - Remove track dan reorder track. Jika drag-and-drop belum diimplementasikan, sediakan tombol move up/move down yang aksesibel.

6. Settings
   - Theme: system/dark/light.
   - Toggle mica/translucency.
   - Toggle reduce visual effects.
   - Default volume.
   - Autoplay next track.
   - Persist queue.
   - Toggle visualizer placeholder.
   - Clear playback history melalui dialog konfirmasi.

### Persistent player

Buat `PlayerBar` yang selalu tampil saat aplikasi aktif.

Wajib mendukung:

- Artwork, title, artist, favorite action.
- Previous, play/pause, next.
- Shuffle dan repeat mode.
- Progress/seek control dengan current time dan total duration.
- Volume slider dan mute.
- Queue side sheet/drawer.
- Status loading/error yang jelas.
- Mini player pada mobile dan Now Playing fullscreen dialog/page.

### Zustand stores

Store hanya menyimpan presentation state dan memanggil use case/facade yang sudah diinjeksi.

Buat minimal:

- `playerStore`: current track ID, playback status, position, duration, queue, repeat mode, shuffle, volume, muted, error message.
- `libraryStore`: tracks, query, filter, sort, import status.
- `playlistStore`: playlists, active playlist, loading/error state.
- `settingsStore`: theme, micaEnabled, reduceVisualEffects, dan setting lainnya.

Jangan menyimpan `File`, `HTMLAudioElement`, `AudioContext`, DOM node, atau object URL di persistent Zustand state.

## UX, accessibility, dan error handling

- Semua icon button memiliki `aria-label` dan tooltip.
- Semua control penting dapat digunakan dengan keyboard.
- Jangan mengaktifkan shortcut global ketika fokus berada pada input, textarea, atau contenteditable.
- Gunakan `Space` untuk play/pause dan Arrow Left/Right untuk seek jika aman.
- Gunakan Snackbar untuk feedback singkat.
- Gunakan Dialog untuk aksi destruktif: hapus playlist, clear history, dan clear local data.
- Tampilkan empty, loading, success, dan error state yang jelas.
- Musik dan metadata diproses lokal; tampilkan informasi ini pada empty/import state.

## Testing requirements

Tambahkan test yang relevan:

1. Domain unit test:
   - Queue next/previous policy.
   - Repeat off/all/one.
   - Shuffle behavior yang deterministic dengan random generator fake jika diperlukan.
   - Playlist position normalization.
   - Playlist name validation.

2. Application unit test:
   - `PlayTrackUseCase` dengan fake repository, fake resolver, dan fake audio player.
   - `ImportTracksUseCase` ketika sebagian file metadata gagal.
   - Add/remove/reorder playlist dengan in-memory repository.

3. Presentation test:
   - Empty library menampilkan CTA import.
   - Klik play pada `TrackList` mengirim intent yang benar.
   - Player bar merepresentasikan loading/playing/paused/error state.
   - Mica nonaktif tetap membuat UI dapat dirender dan dibaca.

## Urutan implementasi

Kerjakan bertahap dan jangan melompat ke fitur lanjutan.

### Tahap 1 — Foundation

1. Audit repository yang sudah ada.
2. Jika belum ada, scaffold Vite React TypeScript.
3. Install dependency minimal yang benar.
4. Siapkan alias `@/`, ESLint, format, Vitest, dan test setup.
5. Buat struktur folder Clean Architecture.
6. Buat domain types, ports, errors, dan policy dasar beserta test.
7. Buat DI container dan fake/in-memory adapter untuk test/development.

### Tahap 2 — Local persistence dan library

1. Buat Dexie database, record, mapper, serta repository implementation.
2. Buat metadata/file adapter.
3. Buat use case import dan library.
4. Buat MUI theme, CSS mica, app shell, routing, Home, dan Library.
5. Hubungkan UI ke application facade melalui store.

### Tahap 3 — Playback dan queue

1. Buat audio port dan `HtmlAudioPlayerAdapter`.
2. Buat use case playback serta domain queue policy.
3. Buat player store, persistent player bar, seek/volume, queue drawer, shuffle, dan repeat.
4. Tambahkan Media Session adapter dengan fallback aman.

### Tahap 4 — Playlist, favorite, setting

1. Buat use case/repository playlist, favorite, history, dan settings.
2. Buat halaman Favorites, Playlists, Playlist Detail, dan Settings.
3. Pastikan theme/mica/settings dipersistenkan.
4. Tambahkan dialog konfirmasi untuk aksi destruktif.

### Tahap 5 — Quality pass

1. Periksa dependency rule seluruh folder.
2. Tambahkan test yang belum ada.
3. Periksa responsive layout desktop/mobile.
4. Periksa keyboard navigation, aria-label, focus state, contrast, reduced motion, dan mica fallback.
5. Periksa object URL dan listener cleanup.
6. Jalankan lint, test, typecheck, dan production build.

## Output yang harus kamu berikan pada setiap tahap

Sebelum mengubah kode:

1. Jelaskan singkat file yang akan dibuat/diubah dan alasannya.
2. Sebutkan dependency package baru yang benar-benar diperlukan.
3. Jangan mengubah file yang tidak relevan.

Setelah mengubah kode:

1. Ringkas implementasi secara spesifik.
2. Daftarkan semua file yang dibuat/diubah.
3. Sebutkan test, lint, typecheck, atau build yang dijalankan beserta hasilnya.
4. Jelaskan limitation yang masih ada secara jujur.
5. Berikan langkah run lokal yang tepat.

## Kriteria selesai MVP

MVP dianggap selesai apabila:

- `npm run dev` dapat menjalankan aplikasi lokal.
- Pengguna dapat mengimpor beberapa file audio.
- Library menampilkan track dan dapat melakukan pencarian.
- Pengguna dapat play, pause, seek, next, previous, volume, mute, shuffle, dan repeat.
- Queue, playlist, favorite, history, dan settings berfungsi.
- Data aplikasi bertahan setelah refresh.
- UI mengikuti Material 3 dengan mica yang dapat dimatikan dan fallback solid.
- Tidak ada file audio yang dikirim ke layanan eksternal.
- Domain/application bebas dari dependency React/MUI/Dexie/browser API.
- Lint, typecheck, test, dan production build berhasil.

Mulai dengan tahap 1. Pertama, audit struktur repository saat ini, baca kelima dokumen, lalu tampilkan rencana implementasi tahap 1 yang ringkas namun spesifik. Jangan mulai menulis fitur sebelum menyelesaikan audit dan rencana tersebut.
```

## Prompt tambahan per tahap

Gunakan prompt berikut setelah master prompt bila kamu ingin mengarahkan agent mengerjakan satu tahap kecil tanpa mengubah scope.

### Tahap 1 — Foundation

```text
Lanjutkan hanya Tahap 1 — Foundation dari master implementation prompt. Audit codebase saat ini terlebih dahulu. Buat/rapikan setup Vite + React + TypeScript strict, alias import, struktur Clean Architecture, domain types/ports/policies, DI composition root, dan unit test domain. Jangan membuat UI library atau implementasi Dexie/audio nyata dulu. Jangan melanggar architecture.md dan rule.md.
```

### Tahap 2 — Library

```text
Lanjutkan hanya Tahap 2 — Local persistence dan library dari master implementation prompt. Implementasikan Dexie persistence adapter, mapper, metadata/file adapter, use case import/library, dan UI Material 3 untuk Home serta Library. UI tidak boleh mengakses Dexie atau browser file API secara langsung. Pastikan batch import tahan terhadap file yang gagal dibaca. Tambahkan test yang relevan.
```

### Tahap 3 — Playback

```text
Lanjutkan hanya Tahap 3 — Playback dan queue dari master implementation prompt. Implementasikan AudioPlayerPort, HtmlAudioPlayerAdapter, use case playback, domain queue/repeat/shuffle policy, PlayerBar, Now Playing, queue drawer, seek, volume, dan Media Session fallback. Jangan membuat instance Audio pada React component atau Zustand store. Tambahkan test domain/application yang relevan.
```

### Tahap 4 — Playlist dan settings

```text
Lanjutkan hanya Tahap 4 — Playlist, favorite, history, dan settings dari master implementation prompt. Implementasikan use case, Dexie repository, halaman Favorites/Playlists/Playlist Detail/Settings, persistence theme dan mica preference, serta dialog konfirmasi aksi destruktif. Reuse component yang sudah ada dan jangan menduplikasi TrackList.
```

### Tahap 5 — Quality pass

```text
Lanjutkan hanya Tahap 5 — Quality pass dari master implementation prompt. Audit dependency rule, cleanup listener dan object URL, responsive layout, Material 3/mica fallback, accessibility, keyboard shortcut, error state, serta test coverage. Perbaiki masalah yang ditemukan dengan perubahan minimal. Jalankan lint, typecheck, test, dan production build; laporkan hasil sebenarnya.
```

