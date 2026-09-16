import type { Track } from "@/domain/entities/Track.ts";
import type { TrackFileResolverPort } from "@/domain/ports/ports.ts";
import { createTrackFingerprint } from "@/domain/value-objects/TrackFingerprint.ts";
import { ObjectUrlRegistry } from "@/infrastructure/files/ObjectUrlRegistry.ts";

/**
 * Session-scoped resolver: file-picker grants no persistent access,
 * so object URLs are registered at import time keyed by fingerprint.
 */
export class BrowserFileResolver implements TrackFileResolverPort {
  private readonly registry: ObjectUrlRegistry;

  constructor(registry?: ObjectUrlRegistry | undefined) {
    this.registry = registry ?? new ObjectUrlRegistry();
  }

  registerDomFile(file: File): string {
    const fingerprint = createTrackFingerprint({
      fileName: file.name,
      fileSize: file.size,
      lastModified: file.lastModified,
    });
    const existing = this.registry.get(fingerprint);
    if (existing) return existing;
    const url = URL.createObjectURL(file);
    this.registry.track(fingerprint, url);
    return url;
  }

  async resolve(track: Track): Promise<string | null> {
    return this.registry.get(track.fingerprint) ?? null;
  }

  revoke(track: Track): void {
    this.registry.revoke(track.fingerprint);
  }

  revokeAll(): void {
    this.registry.revokeAll();
  }
}
