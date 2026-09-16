export interface AcceptedAudioFile {
  fileName: string;
  mimeType: string;
  read: () => Promise<ArrayBuffer>;
}

const AUDIO_EXTENSIONS = [
  ".mp3",
  ".m4a",
  ".aac",
  ".ogg",
  ".oga",
  ".wav",
  ".flac",
  ".opus",
  ".webm",
] as const;

export const ACCEPTED_AUDIO_TYPES = AUDIO_EXTENSIONS;

export function isAcceptedAudioFile(fileName: string, mimeType: string): boolean {
  const lower = fileName.toLowerCase();
  const byExtension = (AUDIO_EXTENSIONS as readonly string[]).some((ext) =>
    lower.endsWith(ext),
  );
  const byMime = mimeType.toLowerCase().startsWith("audio/");
  return byExtension || byMime;
}

export function validateAudioFiles(
  files: { fileName: string; mimeType: string }[],
): { accepted: boolean; reason?: string | undefined }[] {
  return files.map((file) =>
    isAcceptedAudioFile(file.fileName, file.mimeType)
      ? { accepted: true }
      : { accepted: false, reason: `Unsupported audio: ${file.fileName}` },
  );
}

export function wrapDomFile(file: File): AcceptedAudioFile {
  return {
    fileName: file.name,
    mimeType: file.type,
    read: () => file.arrayBuffer(),
  };
}
