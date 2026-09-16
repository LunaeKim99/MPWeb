import { describe, expect, it } from "vitest";
import {
  createPlaylistName,
  isUniqueTrackInPlaylist,
  normalizePlaylistPositions,
  selectNextTrack,
  selectPreviousTrack,
  validatePlaylistName,
} from "@/domain/services/policies.ts";
import { InvalidPlaylistNameError } from "@/domain/errors/errors.ts";
import type {
  PlaybackQueue,
  PlaylistItem,
} from "@/domain/entities/Playlist.ts";

function queue(trackIds: string[], currentIndex: number): PlaybackQueue {
  return { trackIds, currentIndex };
}

function items(positions: number[]): PlaylistItem[] {
  return positions.map((position, index) => ({
    id: `item-${index}`,
    playlistId: "pl-1",
    trackId: `track-${index}`,
    position,
    addedAt: "2026-01-01T00:00:00.000Z",
  }));
}

describe("selectNextTrack", () => {
  it("advances sequentially with repeat off", () => {
    const next = selectNextTrack({
      queue: queue(["a", "b", "c"], 0),
      repeatMode: "off",
      shuffleEnabled: false,
      history: ["a"],
      available: new Set(["a", "b", "c"]),
    });
    expect(next).toBe("b");
  });

  it("returns null at end with repeat off", () => {
    const next = selectNextTrack({
      queue: queue(["a", "b"], 1),
      repeatMode: "off",
      shuffleEnabled: false,
      history: ["a", "b"],
      available: new Set(["a", "b"]),
    });
    expect(next).toBeNull();
  });

  it("wraps with repeat all", () => {
    const next = selectNextTrack({
      queue: queue(["a", "b"], 1),
      repeatMode: "all",
      shuffleEnabled: false,
      history: ["a", "b"],
      available: new Set(["a", "b"]),
    });
    expect(next).toBe("a");
  });

  it("repeats current with repeat one", () => {
    const next = selectNextTrack({
      queue: queue(["a", "b"], 0),
      repeatMode: "one",
      shuffleEnabled: false,
      history: ["a"],
      available: new Set(["a", "b"]),
    });
    expect(next).toBe("a");
  });

  it("shuffles deterministically with fake random", () => {
    const next = selectNextTrack({
      queue: queue(["a", "b", "c"], 0),
      repeatMode: "all",
      shuffleEnabled: true,
      random: () => 0.99,
      history: ["a"],
      available: new Set(["a", "b", "c"]),
    });
    expect(next).toBe("c");
  });

  it("skips unavailable tracks", () => {
    const next = selectNextTrack({
      queue: queue(["a", "b", "c"], 0),
      repeatMode: "off",
      shuffleEnabled: false,
      history: ["a"],
      available: new Set(["a", "c"]),
    });
    expect(next).toBe("c");
  });
});

describe("selectPreviousTrack", () => {
  it("moves to previous available track", () => {
    const prev = selectPreviousTrack({
      queue: queue(["a", "b", "c"], 2),
      available: new Set(["a", "b", "c"]),
    });
    expect(prev).toBe("b");
  });

  it("stays at first track when already first", () => {
    const prev = selectPreviousTrack({
      queue: queue(["a", "b"], 0),
      available: new Set(["a", "b"]),
    });
    expect(prev).toBe("a");
  });
});

describe("playlist policies", () => {
  it("normalizes positions to 0..n-1", () => {
    const normalized = normalizePlaylistPositions(items([10, 2, 30]));
    expect(normalized.map((item) => item.position)).toEqual([0, 1, 2]);
  });

  it("rejects empty playlist name", () => {
    expect(() => validatePlaylistName("   ")).toThrow(InvalidPlaylistNameError);
  });

  it("rejects too long playlist name", () => {
    expect(() => validatePlaylistName("x".repeat(121))).toThrow(
      InvalidPlaylistNameError,
    );
  });

  it("trims valid playlist name", () => {
    expect(createPlaylistName("  Road Trip  ")).toBe("Road Trip");
  });

  it("detects duplicate track in playlist", () => {
    const list = items([0, 1]);
    expect(isUniqueTrackInPlaylist(list, "track-0")).toBe(false);
    expect(isUniqueTrackInPlaylist(list, "track-9")).toBe(true);
  });
});
