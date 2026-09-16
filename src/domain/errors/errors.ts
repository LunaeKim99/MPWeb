export class InvalidPlaylistNameError extends Error {
  override name = "InvalidPlaylistNameError";
  constructor(message = "Playlist name is invalid") {
    super(message);
  }
}

export class TrackUnavailableError extends Error {
  override name = "TrackUnavailableError";
  constructor(message = "Track unavailable") {
    super(message);
  }
}

export class PlaybackError extends Error {
  override name = "PlaybackError";
  constructor(message = "Playback failed") {
    super(message);
  }
}
