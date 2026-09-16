export type ImportOutcome = {
  imported: number;
  skippedDuplicate: number;
  skippedUnsupported: number;
  failed: number;
  trackIds: string[];
};

export type ImportFileInput = {
  fileName: string;
  mimeType: string;
  fileSize: number;
  lastModified: number;
  getBuffer: () => Promise<ArrayBuffer>;
};
