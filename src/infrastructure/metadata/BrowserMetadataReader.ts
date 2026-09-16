import type {
  MetadataReaderPort,
  TrackMetadataInput,
  TrackMetadataResult,
} from "@/domain/ports/ports.ts";

export class BrowserMetadataReader implements MetadataReaderPort {
  async read(input: TrackMetadataInput): Promise<TrackMetadataResult> {
    try {
      const { parseBuffer } = await import("music-metadata-browser");
      const ffMetadata = await parseBuffer(new Uint8Array(input.buffer), {
        mimeType: input.mimeType,
      } as unknown as string);
      const common = ffMetadata.common;
      const artwork = common.picture?.[0];
      let artworkDataUrl: string | undefined;
      let artworkMimeType: string | undefined;
      if (artwork?.data) {
        const bytes = artwork.data as unknown as Uint8Array;
        const b64 = btoa(String.fromCharCode(...bytes));
        artworkDataUrl = `data:${artwork.format ?? "image/jpeg"};base64,${b64}`;
        artworkMimeType = artwork.format ?? "image/jpeg";
      }
      const title = common.title?.trim() || input.fileName.replace(/\.[^.]+$/, "");
      const artist = common.artist?.trim() || "Unknown Artist";
      const album = common.album?.trim() || "Unknown Album";
      const result: TrackMetadataResult = {
        title,
        artist,
        album,
        durationSeconds: ffMetadata.format.duration ?? null,
      };
      if (artworkDataUrl && artworkMimeType) {
        result.artworkDataUrl = artworkDataUrl;
        result.artworkMimeType = artworkMimeType;
      }
      return result;
    } catch {
      return {
        title: input.fileName.replace(/\.[^.]+$/, ""),
        artist: "Unknown Artist",
        album: "Unknown Album",
        durationSeconds: null,
      };
    }
  }
}