# Product Requirements Document (PRD)

## 1. Informasi Produk

| Item          | Detail                                                                   |
| ------------- | ------------------------------------------------------------------------ |
| Nama kerja    | Local Music Player                                                       |
| Platform      | Web application, localhost-first                                         |
| Target awal   | Pengguna personal dengan koleksi audio lokal                             |
| Bentuk produk | Single-page application (SPA)                                            |
| Prioritas     | Playback stabil, privasi, Material 3 UI, dan codebase Clean Architecture |
| Stack         | React, Vite, TypeScript, MUI/Material 3, Zustand, Dexie/IndexedDB        |
| Arah visual   | Dark/light/system theme dengan translucent/mica sebagai enhancement      |

## 2. Latar Belakang

Produk adalah pemutar musik personal yang berjalan di localhost, memakai file yang dipilih pengguna, dan tidak mengunggah musik ke server. Selain fungsi player, proyek ditujukan sebagai codebase portofolio yang menunjukkan praktik engineering yang baik.

Karena aplikasi akan berkembang dari MVP lokal ke kemungkinan PWA, scan folder, dan backend opsional, implementasi wajib memakai Clean Architecture. Aturan bisnis playback, playlist, dan library harus terisolasi dari framework UI serta storage browser agar dapat diuji dan dikembangkan tanpa coupling tinggi.

## 3. Problem Statement

Pengguna membutuhkan music player lokal yang mampu memutar dan mengelola koleksi audio personal melalui browser. Developer juga membutuhkan struktur proyek yang tetap mudah dipahami ketika fitur, komponen UI, dan sumber data bertambah.

Tanpa boundary yang jelas, logic audio cenderung tercampur dalam komponen React, query Dexie tersebar, dan perpindahan dari IndexedDB ke backend menjadi mahal. Produk harus mencegah masalah tersebut sejak awal.

## 4. Goals dan Non-goals

### Goals

- Memutar file audio lokal yang dipilih pengguna.
- Menyediakan play, pause, next, previous, seek, volume, mute, shuffle, dan repeat.
- Menyimpan library metadata, playlist, favorit, riwayat, serta setting secara lokal.
- Menampilkan metadata track dan artwork bila tersedia.
- Menggunakan Material 3 dengan mica/translucency yang opsional dan aksesibel.
- Mengimplementasikan use case secara terpisah dari React, MUI, Dexie, IndexedDB, dan browser audio APIs.
- Memungkinkan repository/adapters diganti tanpa mengubah domain rules dan use case.
- Memberikan fondasi untuk visualizer, PWA, scan folder, dan backend Laravel opsional.

### Non-goals MVP

- Layanan streaming musik.
- Penyediaan atau distribusi lagu berhak cipta.
- Login, akun pengguna, dan sinkronisasi cloud.
- Kolaborasi playlist atau fitur sosial.
- Server-side transcoding audio.
- Lirik sinkron, podcast, radio online, atau rekomendasi berbasis AI.
- Migrasi backend Laravel pada tahap MVP.

## 5. Persona

### Pengguna personal

Memiliki folder musik dan membutuhkan player dark mode yang cepat, mudah digunakan saat belajar/coding, dan tidak memerlukan akun atau server.

### Developer/portfolio builder

Membutuhkan proyek nyata untuk menunjukkan kemampuan React, TypeScript, browser APIs, Clean Architecture, testing, Material 3 theming, dan local persistence.

## 6. User Stories

- Sebagai pengguna, saya ingin memilih banyak file audio agar dapat langsung memutar koleksi musik saya.
- Sebagai pengguna, saya ingin melihat judul, artist, album, cover, dan durasi track agar library mudah dikenali.
- Sebagai pengguna, saya ingin mencari lagu agar dapat menemukannya tanpa menggulir seluruh library.
- Sebagai pengguna, saya ingin membuat playlist dan mengatur urutan lagu agar musik sesuai aktivitas saya.
- Sebagai pengguna, saya ingin menandai lagu favorit agar cepat menemukannya kembali.
- Sebagai pengguna, saya ingin menggunakan shuffle dan repeat agar playback sesuai preferensi.
- Sebagai pengguna, saya ingin theme dan preferensi mica tersimpan setelah refresh.
- Sebagai developer, saya ingin menguji aturan pemilihan track berikutnya tanpa browser atau React.
- Sebagai developer, saya ingin mengganti Dexie repository dengan API repository tanpa menulis ulang use case library dan playlist.

## 7. Kebutuhan Fungsional

### FR-01 — Impor file

- Pengguna dapat memilih satu atau banyak file melalui file picker.
- Sistem memvalidasi tipe/ekstensi audio, memproses file satu per satu, dan melaporkan hasil impor.
- File yang gagal dibaca tidak membatalkan batch impor lain.
- Sistem mencegah duplikasi berdasarkan fingerprint yang tersedia.
- Use case impor menerima `MetadataReaderPort` dan `TrackRepository`; ia tidak boleh mengakses API file browser atau Dexie secara langsung.

### FR-02 — Library

- Sistem menampilkan seluruh track yang berhasil diimpor.
- Track memiliki title, file name, durasi bila tersedia, tanggal ditambahkan, serta metadata tambahan bila ditemukan.
- Pengguna dapat search, sort, dan filter track.
- Semua query library berjalan melalui `GetLibraryUseCase`/`SearchTracksUseCase` dan repository port.

### FR-03 — Playback

- Pengguna dapat play, pause, next, previous, seek, mengubah volume, dan mute.
- Sistem hanya memainkan satu track pada satu waktu.
- Sistem mengikuti domain policy untuk repeat off/all/one dan shuffle.
- Browser audio API diakses hanya melalui `AudioPlayerPort` implementation.
- Error playback dikembalikan ke presentation sebagai state yang dapat ditampilkan dan tidak merusak queue.

### FR-04 — Queue

- Sistem menyimpan daftar track yang akan diputar.
- Pengguna dapat add to queue, play next, remove, dan reorder queue.
- Kebijakan queue, shuffle, dan pemilihan track berikutnya berada pada domain service/entity, bukan komponen UI.

### FR-05 — Playlist dan favorite

- Pengguna dapat membuat, rename, dan delete playlist.
- Pengguna dapat menambah, menghapus, serta mengurutkan track di playlist.
- Pengguna dapat memberi atau membatalkan favorite pada track.
- Repository persistence diakses melalui use case playlist/library.

### FR-06 — Appearance

- Sistem menyediakan theme system, dark, dan light.
- Sistem menggunakan komponen dan semantic color roles Material 3 secara konsisten.
- Sistem menyediakan toggle mica/translucency serta reduce visual effects.
- Saat transparency/blur tidak tersedia atau dinonaktifkan, UI memakai fallback solid dengan kontras yang setara.
- Detail MUI dan CSS mica hanya berada di presentation layer.

### FR-07 — Persistensi

- Playlist, favorite, history, metadata library, serta setting disimpan melalui repository port.
- Implementasi MVP memakai Dexie/IndexedDB; use case tidak boleh tahu teknologi ini.
- Theme, volume, repeat mode, shuffle, dan preference mica dipulihkan saat aplikasi dibuka kembali.
- Track dengan file reference yang tidak lagi valid ditandai unavailable tanpa menghapus relasi playlist secara otomatis.

### FR-08 — Sistem media

- Jika tersedia, metadata Media Session diatur untuk track aktif.
- Aksi media play/pause/next/previous dipetakan ke application actions melalui adapter.

## 8. Kebutuhan Nonfungsional

| ID     | Requirement                                                                                     |
| ------ | ----------------------------------------------------------------------------------------------- |
| NFR-01 | Aplikasi berjalan dengan `npm run dev` tanpa backend                                            |
| NFR-02 | Domain dan application tidak memiliki import React, MUI, Dexie, IndexedDB, atau DOM/browser API |
| NFR-03 | Semua business operation penting tersedia sebagai use case yang dapat diuji secara independen   |
| NFR-04 | Detail implementasi external dipasang melalui adapter dan composition root                      |
| NFR-05 | UI tetap responsif saat batch import dan library besar                                          |
| NFR-06 | Aplikasi tidak mengunggah musik/metadata pengguna pada mode local-only                          |
| NFR-07 | Fitur inti dapat digunakan dengan keyboard                                                      |
| NFR-08 | UI terbaca pada theme dark/light dan mica aktif/nonaktif                                        |
| NFR-09 | Error audio tidak menghentikan aplikasi atau merusak queue                                      |
| NFR-10 | Unit test domain/use case dapat dijalankan tanpa browser nyata                                  |

## 9. MVP Scope

MVP selesai bila pengguna dapat:

1. Menjalankan aplikasi lokal.
2. Mengimpor banyak file audio.
3. Melihat dan memutar track dari library.
4. Mengatur queue, shuffle, repeat, seek, dan volume.
5. Membuat playlist serta menandai favorite.
6. Mencari track di library.
7. Mempertahankan data serta preference UI setelah refresh.
8. Beralih theme dan menonaktifkan mica tanpa kehilangan keterbacaan.
9. Mendapatkan error yang jelas saat file gagal diputar.

MVP engineering selesai bila:

1. Domain entity/policy diuji tanpa React/browser.
2. Use case diuji memakai fake repository dan fake audio player.
3. Dexie dan browser audio berada di infrastructure adapter.
4. React/MUI hanya berada di presentation.
5. Instansiasi dependency konkret hanya berada di composition root.

## 10. Success Metrics

- 100% alur playback utama lulus uji manual.
- 0 crash aplikasi ketika satu file pada batch impor rusak/tidak didukung.
- Playlist, favorite, setting, theme, dan mica preference bertahan setelah refresh.
- Tidak ada import framework/database/browser API pada folder `domain` dan `application`.
- Perubahan dari `DexieTrackRepository` ke fake/in-memory repository tidak memerlukan perubahan use case.
- Tidak ada network request yang mengirim file audio ke pihak luar dalam local-only mode.

## 11. Risiko dan Mitigasi

| Risiko                           | Dampak                    | Mitigasi                                                                                      |
| -------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------- |
| Layer terlalu banyak untuk MVP   | Development terasa lambat | Gunakan folder dan interface hanya pada boundary nyata; jangan over-engineer entity sederhana |
| Kebocoran dependency ke use case | Coupling tinggi           | Enforce lint/import rule dan code review checklist                                            |
| Dukungan codec browser berbeda   | Lagu gagal diputar        | Validasi file dan tangani error per track                                                     |
| Izin file hilang setelah refresh | Track unavailable         | Simpan metadata; minta user memilih ulang file/folder jika diperlukan                         |
| Blur mica membebani GPU          | Scrolling lambat          | Batasi pada panel besar dan sediakan fallback/toggle                                          |
| Object URL bocor                 | Memori bertambah          | Kelola lifecycle URL melalui infrastructure adapter                                           |
