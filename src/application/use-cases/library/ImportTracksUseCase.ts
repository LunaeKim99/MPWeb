import type {
  ImportFileInput,
  ImportOutcome,
} from "@/application/dto/ImportOutcome.ts";
import type { MetadataReaderPort } from "@/domain/ports/ports.ts";
import type { TrackRepository } from "@/domain/repositories/repositories.ts";
import { createTrackFingerprint } from "@/domain/value-objects/TrackFingerprint.ts";
import { isAcceptedAudioFile } from "@/infrastructure/files/BrowserFilePickerAdapter.ts";

interface ImportTracksDependencies {
  trackRepository: TrackRepository;
  metadataReader: MetadataReaderPort;
  now?: () => string;
  createId?: () => string;
}

const FALLBACK_ARTIST = "Unknown Artist";
const FALLBACK_ALBUM = "Unknown Album";

export class ImportTracksUseCase {
  constructor(private readonly deps: ImportTracksDependencies) {}

  async execute(files: ImportFileInput[]): Promise<ImportOutcome> {
    const outcome: ImportOutcome = {
      imported: 0,
      skippedDuplicate: 0,
      skippedUnsupported: 0,
      failed: 0,
      trackIds: [],
    };
    const now = this.deps.now ?? (() => new Date().toISOString());
    const createId =
      this.deps.createId ??
      (() =>
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `track-${Date.now()}-${Math.floor(Math.random() * 1e6)}`);

    for (const file of files) {
      try {
        if (!isAcceptedAudioFile(file.fileName, file.mimeType)) {
          outcome.skippedUnsupported += 1;
          continue;
        }
        const fingerprint = createTrackFingerprint({
          fileName: file.fileName,
          fileSize: file.fileSize,
          lastModified: file.lastModified,
        });
        const existing = await this.deps.trackRepository.findByFingerprint(fingerprint);
        if (existing) {
          outcome.skippedDuplicate += 1;
          continue;
        }
        let title = file.fileName.replace(/\.[^.]+$/, "");
        let artist = FALLBACK_ARTIST;
        let album = FALLBACK_ALBUM;
        let durationSeconds: number | null = null;
        let artwork:
          | { mimeType: string; dataUrl?: string }
          | undefined;

        const buffer = await file.getBuffer();
        try {
          const metadata = await this.deps.metadataReader.read({
            fileName: file.fileName,
            mimeType: file.mimeType,
            buffer,
          });
          title = metadata.title.trim() || title;
          artist = metadata.artist.trim() || FALLBACK_ARTIST;
          album = metadata.album.trim() || FALLBACK_ALBUM;
          durationSeconds = metadata.durationSeconds;
          if (metadata.artworkDataUrl && metadata.artworkMimeType) {
            artwork = {
              mimeType: metadata.artworkMimeType,
              dataUrl: metadata.artworkDataUrl,
            };
          }
        } catch {
          // Metadata fallback: filename-only, one bad file must not abort batch.
        }

        const timestamp = now();
        const trackId = createId();
        await this.deps.trackRepository.saveMany([
          {
            id: trackId,
            sourceType: "file-picker",
            fileName: file.fileName,
            fileSize: file.fileSize,
            lastModified: file.lastModified,
            fingerprint,
            mimeType: file.mimeType,
            title,
            artist,
            album,
            durationSeconds,
            artwork,
            availability: "available",
            isFavorite: false,
            playCount: 0,
            addedAt: timestamp,
            updatedAt: timestamp,
          },
        ]);
        outcome.imported += 1;
        outcome.trackIds.push(trackId);
      } catch {
        outcome.failed += 1;
      }
    }
    return outcome;
  }
}