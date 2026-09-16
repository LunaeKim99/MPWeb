export interface TrackFingerprintParts {
  fileName: string;
  fileSize: number;
  lastModified: number;
}

export function createTrackFingerprint(parts: TrackFingerprintParts): string {
  return `${parts.fileName}|${parts.fileSize}|${parts.lastModified}`;
}
