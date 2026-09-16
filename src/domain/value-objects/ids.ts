export type TrackId = string;
export type PlaylistId = string;
export type PlaylistItemId = string;
export type HistoryEntryId = string;

export type TrackAvailability = "available" | "unavailable" | "error";
export type TrackSourceType = "file-picker" | "file-system-handle";
export type RepeatMode = "off" | "all" | "one";
export type ThemePreference = "system" | "dark" | "light";

export interface Artwork {
  mimeType: string;
  dataUrl?: string | undefined;
  width?: number | undefined;
  height?: number | undefined;
}
