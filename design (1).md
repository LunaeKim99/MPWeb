# Design Specification — Local Music Player

## 1. Arah Desain

UI mengikuti **Material Design 3** dengan translucent/mica sebagai lapisan visual tambahan. Implementasi UI harus menghormati Clean Architecture: desain hanya hidup di `presentation`, sedangkan domain dan use case tidak boleh mengetahui React, MUI, CSS, atau detail visual.

Karakter visual:

- Dark mode adalah default; light dan system theme tersedia.
- Material 3 dipakai untuk color roles, typography, elevation, shape, button, navigation, dialog, menu, slider, chip, dan snackbar.
- Mica dipakai terbatas pada app shell, navigation, app bar, player bar, serta panel besar.
- Daftar library diprioritaskan untuk keterbacaan dan performa, bukan efek glass berlapis.
- Artwork dapat memberi ambient background, tetapi tidak menjadi sumber warna semantic UI.

## 2. Presentation Architecture

```text
presentation/
├── app/                 # Provider, router, app shell
├── theme/               # Material 3 theme + mica CSS
├── pages/               # Route-level UI composition
├── components/          # Reusable dumb/presentational components
├── stores/              # Zustand UI state dan controller actions
├── hooks/               # UI hooks, keyboard shortcut, responsive helpers
├── view-models/         # Domain/application DTO → display-ready model
└── utils/               # Format duration, accessibility labels, UI helpers
```

Aturan:

- `pages` mengomposisi components dan menghubungkan store/view model.
- `components` tidak boleh memanggil repository Dexie atau browser audio API.
- `stores` boleh memanggil application use cases/facade, tidak boleh mengimpor `DexieTrackRepository` atau `HtmlAudioPlayerAdapter` langsung.
- `view-models` bertugas mengubah data domain menjadi string/icon/status yang cocok ditampilkan.
- Semua warna/shape/typography berasal dari MUI theme atau semantic CSS variable.

## 3. Layout Utama

```text
Desktop (>= 1024px)
┌──────────────┬─────────────────────────────────────────────┐
│ Mica         │ Mica Header                                 │
│ Navigation   ├─────────────────────────────────────────────┤
│ Rail         │                                             │
│ - Home       │   Content surface: Library/Playlist/etc.    │
│ - Library    │                                             │
│ - Favorites  │                                             │
│ - Playlists  │                                             │
├──────────────┴─────────────────────────────────────────────┤
│ Mica Persistent Player Bar                                 │
│ Cover | Info | Previous Play Next | Progress | Volume/Queue│
└────────────────────────────────────────────────────────────┘
```

```text
Mobile (< 768px)
┌───────────────────────────────┐
│ Translucent top app bar        │
├───────────────────────────────┤
│ Page content                   │
├───────────────────────────────┤
│ Mica compact player            │
├───────────────────────────────┤
│ Translucent navigation bar     │
└───────────────────────────────┘
```

## 4. Halaman dan Component Boundary

### HomePage

Mengomposisi:

- `PageHeader`
- `ImportMusicCallToAction`
- `RecentlyPlayedSection`
- `PlaylistCarousel`

HomePage tidak menghitung/menyortir history sendiri. Ia meminta data display-ready dari `libraryStore` atau `HomeViewModel` yang telah mengambil data lewat use case.

### LibraryPage

Mengomposisi:

- `LibraryToolbar`
- `TrackSearchField`
- `TrackFilterChips`
- `TrackList`
- `ImportProgressDialog`

`TrackList` menerima props view model dan callbacks seperti `onPlay`, `onQueueNext`, serta `onToggleFavorite`. Komponen tidak tahu bagaimana action tersebut diimplementasikan.

### PlaylistDetailPage

Mengomposisi:

- `PlaylistHero`
- `PlaylistActions`
- `PlaylistTrackList`
- `PlaylistEditDialog`

### FavoritesPage

Memakai kembali `TrackList`; hanya sumber data/filter yang berbeda. Jangan membuat list component duplikat.

### SettingsPage

Mengomposisi group setting yang dipetakan ke UI state:

- `AppearanceSettingsSection`: theme, mica enabled, reduce visual effects.
- `PlaybackSettingsSection`: volume, autoplay next, persist queue.
- `AudioSettingsSection`: visualizer dan equalizer.
- `DataSettingsSection`: export/import, clear history, clear local data.

### PlayerBar dan NowPlaying

`PlayerBar` dan `NowPlayingDialog` membaca `PlayerViewModel` dari `playerStore`. Keduanya tidak memanggil audio API. Semua control meneruskan intent: `onPlayPause`, `onNext`, `onPrevious`, `onSeek`, `onVolumeChange`.

## 5. Material Theme Tokens

Gunakan satu MUI theme factory di `presentation/theme/createAppTheme.ts`. Theme menerima `ThemePreference` dan tidak membaca IndexedDB secara langsung.

```css
:root {
  --md-sys-color-primary: #c8bfff;
  --md-sys-color-on-primary: #251b58;
  --md-sys-color-primary-container: #40327a;
  --md-sys-color-on-primary-container: #e7deff;
  --md-sys-color-secondary-container: #474255;
  --md-sys-color-surface: #131218;
  --md-sys-color-surface-container-low: #1c1b20;
  --md-sys-color-surface-container: #201f25;
  --md-sys-color-surface-container-high: #2b2930;
  --md-sys-color-surface-container-highest: #36343b;
  --md-sys-color-on-surface: #e6e1e9;
  --md-sys-color-on-surface-variant: #cac4d0;
  --md-sys-color-outline: #948f99;
  --md-sys-color-error: #ffb4ab;

  --mica-bg: rgb(28 27 32 / 72%);
  --mica-bg-strong: rgb(32 31 37 / 88%);
  --mica-border: rgb(255 255 255 / 12%);
  --mica-blur: 22px;
}
```

Mica primitive berada di `presentation/theme/mica.css`:

```css
.mica-surface {
  background: var(--mica-bg-strong);
  border: 1px solid var(--mica-border);
  box-shadow: 0 10px 30px rgb(0 0 0 / 18%);
}

[data-mica="true"] .mica-surface {
  background: var(--mica-bg);
}

@supports (
  (-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))
) {
  [data-mica="true"] .mica-surface {
    -webkit-backdrop-filter: saturate(150%) blur(var(--mica-blur));
    backdrop-filter: saturate(150%) blur(var(--mica-blur));
  }
}
```

## 6. Komponen Reusable

| Komponen           | Tanggung jawab                         | Tidak boleh dilakukan                     |
| ------------------ | -------------------------------------- | ----------------------------------------- |
| `MicaSurface`      | Wrapper surface translucent/fallback   | Membaca store atau data audio             |
| `TrackList`        | Render daftar `TrackListItemViewModel` | Query database atau membuat queue sendiri |
| `TrackRow`         | Satu row lagu dan menu aksi            | Memanggil browser `Audio`                 |
| `PlaybackControls` | Render tombol control                  | Menentukan next track policy              |
| `ProgressControl`  | Input seek dan tampilan waktu          | Menyimpan playback state global           |
| `PlayerBar`        | Layout player persistent               | Menginisialisasi audio engine             |
| `EmptyState`       | Empty UI reusable                      | Menentukan kapan data dianggap kosong     |
| `ConfirmDialog`    | Konfirmasi aksi destruktif             | Menghapus data langsung                   |

## 7. Interaksi dan State UI

- Filled button: aksi primer tunggal, misalnya `Tambahkan Musik` atau `Play`.
- Tonal button: aksi sekunder yang penting, misalnya `Shuffle`.
- Icon button: previous, next, favorite, queue, volume; selalu punya tooltip dan `aria-label`.
- Track aktif memiliki selected state, indicator non-warna (misalnya equalizer icon), dan title yang tetap mudah dibaca.
- Saat loading, player menampilkan progress indicator dan kontrol yang belum tersedia dinonaktifkan.
- Error memakai Snackbar dengan pesan singkat serta aksi `Lewati` bila ada next track.
- Dialog konfirmasi hanya untuk delete playlist, clear history, atau clear all data.

## 8. Responsive, Accessibility, dan Performa

| Breakpoint | Perilaku                                                                |
| ---------- | ----------------------------------------------------------------------- |
| < 640px    | Bottom navigation, mini player, list satu kolom, Now Playing fullscreen |
| 640–1023px | Navigation rail dapat diciutkan; kolom list sekunder disembunyikan      |
| >= 1024px  | Navigation rail permanen, track list lengkap, player bar desktop        |
| >= 1440px  | Content dibatasi; queue dapat menjadi side sheet                        |

- Semua icon button punya `aria-label`; semua feedback penting tidak hanya memakai warna.
- Focus ring harus terlihat pada background mica.
- Shortcut tidak aktif ketika user mengetik dalam input/textarea/contenteditable.
- Hormati `prefers-reduced-motion` dan setting `reduceVisualEffects`.
- Terapkan blur pada sedikit panel besar saja; gunakan list non-blur dan virtualisasi jika library besar.

## 9. Empty State

- Library kosong: `Belum ada musik di library` — `Pilih file audio dari perangkatmu. Musik diproses secara lokal dan tidak diunggah.`
- Playlist kosong: `Playlist ini masih kosong` — `Tambahkan lagu dari Library atau queue.`
- Pencarian kosong: `Tidak ada lagu yang cocok` — `Coba kata kunci lain atau hapus filter.`
- File error: `Lagu tidak dapat diputar` — `Format mungkin tidak didukung atau file tidak lagi tersedia.`
