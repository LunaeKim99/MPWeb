import type {
  MediaSessionPort,
  MediaSessionTrackInfo,
} from "@/domain/ports/ports.ts";

export interface MediaSessionActions {
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export class BrowserMediaSessionAdapter implements MediaSessionPort {
  private actions: MediaSessionActions | null = null;

  setActions(actions: MediaSessionActions): void {
    this.actions = actions;
    this.bind();
  }

  private supported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      "mediaSession" in navigator &&
      navigator.mediaSession != null
    );
  }

  private bind(): void {
    if (!this.supported()) return;
    const ms = navigator.mediaSession;
    const actions = this.actions;
    if (!actions) return;
    try {
      ms.setActionHandler("play", () => actions.onPlay());
      ms.setActionHandler("pause", () => actions.onPause());
      ms.setActionHandler("previoustrack", () => actions.onPrevious());
      ms.setActionHandler("nexttrack", () => actions.onNext());
    } catch {
      // unsupported actions are ignored
    }
  }

  update(track: MediaSessionTrackInfo | null): void {
    if (!this.supported()) return;
    if (!track) {
      navigator.mediaSession.metadata = null;
      return;
    }
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: track.artworkUrl ? [{ src: track.artworkUrl }] : [],
      });
    } catch {
      // metadata unsupported, ignore
    }
  }
}
