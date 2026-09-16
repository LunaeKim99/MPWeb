# Development Rules — MPWeb

## 1. Tujuan

Dokumen ini menetapkan aturan implementasi Clean Architecture untuk proyek MPWeb. Aturan berlaku untuk developer dan AI coding agent agar codebase tetap mudah diuji, tidak coupled dengan framework, dan siap berkembang.

## 2. Golden Rules

1. **Dependency hanya mengarah ke dalam**: presentation dan infrastructure boleh bergantung pada application/domain; domain tidak boleh bergantung keluar.
2. **Use case tidak mengenal framework**: tidak ada React, MUI, Zustand, Dexie, IndexedDB, DOM, `window`, `document`, atau `HTMLAudioElement` di domain/application.
3. **Interface dimiliki core**: port/repository interface didefinisikan domain atau application; infrastructure yang mengimplementasikannya.
4. **Composition root adalah tempat wiring**: implementasi konkret hanya dirakit pada `src/di` atau `src/main.tsx`.
5. **UI mengirim intent, bukan business rule**: component meminta play/queue/favorite lewat store/controller/use case; component tidak memutuskan policy domain.

## 3. Dependency Rules

| Folder           | Boleh import                                                    | Dilarang import                                                                    |
| ---------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `domain`         | `shared` murni                                                  | application, infrastructure, presentation, React, MUI, Zustand, Dexie, browser API |
| `application`    | domain, shared                                                  | infrastructure, presentation, React, MUI, Zustand, Dexie, browser API              |
| `infrastructure` | domain, application DTO, shared, package external               | presentation pages/components/stores                                               |
| `presentation`   | application facade/use cases, domain types, shared, UI packages | Dexie repository/adapters konkret, browser audio implementation langsung           |
| `di`             | Semua layer                                                     | Tidak berlaku; ini wiring layer                                                    |

## 4. Aturan Domain

- Entity, value object, domain service, policy, error, dan repository/port contract berada di `src/domain`.
- Domain harus deterministic dan sebisa mungkin pure.
- Domain tidak boleh memanggil asynchronous browser API, membaca database, atau mengubah UI state.
- Entity tidak boleh berbentuk React hook, Zustand store, atau Dexie model.
- Validasi rule bisnis ditempatkan pada entity/value object/domain service.
- Gunakan error domain eksplisit untuk kondisi bisnis, misalnya `TrackUnavailableError` atau `InvalidPlaylistNameError`.
- Hindari `Date.now()` dan `crypto.randomUUID()` tersembunyi di entity jika test membutuhkan determinisme; inject clock/ID generator bila kompleksitas sudah perlu.

## 5. Aturan Application Use Case

- Satu use case merepresentasikan satu intent bisnis yang jelas.
- Use case ditempatkan berdasarkan feature: `application/use-cases/playback`, `library`, `playlist`, atau `settings`.
- Use case hanya bergantung pada repository/port interface, tidak pada class Dexie atau browser adapter konkret.
- Input dan output use case memakai command/query/DTO sederhana; jangan mengembalikan JSX, MUI props, atau DOM event.
- Use case boleh mengorkestrasi beberapa repository/port dan transaction boundary, tetapi policy tetap berada di domain.
- Error teknis dari infrastructure diterjemahkan menjadi error/result application yang aman untuk presentation.
- Jangan membuat "god service"; pecah operation berdasarkan intent seperti `PlayTrackUseCase`, `AddTrackToPlaylistUseCase`, dan `UpdatePlayerSettingsUseCase`.

## 6. Aturan Infrastructure

- Semua detail external berada di `src/infrastructure`.
- `DexieTrackRepository` wajib mengimplementasikan `TrackRepository` yang didefinisikan core.
- `HtmlAudioPlayerAdapter` wajib mengimplementasikan `AudioPlayerPort`.
- `BrowserMetadataReader` wajib mengimplementasikan `MetadataReaderPort`.
- Konversi record persistence ↔ entity domain dilakukan oleh mapper khusus, bukan di component atau use case.
- Browser event harus diterjemahkan menjadi event/data application yang stabil; jangan meneruskan DOM event mentah ke domain.
- Semua akses `window`, `navigator`, `AudioContext`, `MediaMetadata`, `FileSystemFileHandle`, dan `URL.createObjectURL()` hanya berada di infrastructure atau presentation hook yang khusus UI.
- Lifecycle object URL harus dikelola oleh `ObjectUrlRegistry`; selalu revoke saat sumber tidak lagi diperlukan.

## 7. Aturan Presentation

- React, MUI, Material 3 theme, CSS mica, Zustand store, router, dan UI hooks berada di `src/presentation`.
- Pages mengomposisi component; component reusable menerima props dan callback, bukan mengakses infrastructure.
- Zustand store bertindak sebagai presentation controller/view state; store memanggil use case/facade yang telah diinjeksi.
- Jangan menaruh `new Audio()`, query Dexie, parser metadata, atau File System Access API di React component.
- Bentuk data untuk UI disiapkan sebagai view model. Formatting duration, subtitle, state label, dan fallback artwork dilakukan di view model/presentation utility.
- Jangan mengekspos entity yang dapat dimodifikasi langsung ke component jika use case dibutuhkan untuk menjaga rule.

## 8. Aturan Material 3 dan Mica

- Gunakan MUI sebagai component library utama; theme hanya dibuat oleh `createAppTheme()`.
- Gunakan semantic theme tokens, bukan hex color hardcode dalam component.
- Mica dibuat melalui primitive `MicaSurface` dan `presentation/theme/mica.css`; jangan copy-paste `backdrop-filter` di berbagai component.
- Mica hanya untuk panel besar: app shell, navigation rail, top app bar, player bar, dialog, dan sheet.
- Gunakan fallback opaque dengan `@supports` serta toggle `micaEnabled`.
- Semua text/focus state harus tetap memiliki kontras pada background mica dan non-mica.
- Hormati `prefers-reduced-motion` serta setting `reduceVisualEffects`.
- List track tidak boleh memakai blur per row. Prioritaskan performa scrolling dan keterbacaan.

## 9. Aturan TypeScript

- Gunakan strict TypeScript.
- Jangan gunakan `any`; gunakan `unknown` lalu lakukan narrowing.
- Semua public method pada port, repository, adapter, dan use case memiliki input/output type eksplisit.
- Gunakan string UUID untuk entity ID dan type alias/value object ketika menambah kejelasan.
- Hindari enum TypeScript bila union literal lebih sederhana.
- Jangan simpan object non-serializable (`Audio`, `File`, `AudioContext`, DOM node, object URL) dalam Zustand state yang dipersistenkan.

## 10. Aturan Playback dan File

- `audio.play()` harus ditangani sebagai Promise dan error autoplay harus dipetakan ke application/presentation error state.
- Hanya `HtmlAudioPlayerAdapter` yang membuat atau mengatur `HTMLAudioElement`.
- Satu elemen audio hanya boleh memiliki satu `MediaElementAudioSourceNode`.
- Policy next-track/repeat/shuffle berada di domain `QueuePolicy`/`ShufflePolicy`.
- Parsing file gagal tidak boleh menghentikan seluruh batch import.
- Metadata selalu mempunyai fallback title dari nama file.
- Object URL tidak boleh disimpan di database.
- File yang tidak tersedia ditandai unavailable, bukan langsung dihapus dari playlist/history.

## 11. Aturan Testing

- Domain: unit test pure dan tanpa mock framework/browser.
- Application: unit test use case dengan in-memory repository/fake ports.
- Infrastructure: integration test mapper, Dexie repository, dan browser adapter memakai test double bila perlu.
- Presentation: component test fokus pada render, intent user, accessibility, loading, error, dan empty state.
- Test tidak boleh membutuhkan file audio pribadi atau IndexedDB production.
- Tambahkan regression test setiap kali memperbaiki bug di queue/repeat/shuffle.

## 12. Aturan Git dan Definition of Done

- Gunakan Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
- Jangan commit `node_modules`, hasil build, database browser, atau file audio pribadi.
- Feature dianggap selesai jika:
  - Use case dan boundary layer yang relevan jelas.
  - Tidak melanggar dependency rules.
  - TypeScript, lint, test, dan build lulus.
  - Loading, empty, error, dan success state ditangani bila relevan.
  - Aksesibilitas keyboard/focus dipertimbangkan.
  - UI tetap berfungsi saat mica dimatikan.
  - Dokumentasi architecture/schema diperbarui jika contract atau persistence berubah.

