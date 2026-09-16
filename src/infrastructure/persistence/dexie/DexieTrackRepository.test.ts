import { beforeEach, describe, expect, it } from "vitest";
import "fake-indexeddb/auto";
import { DexieTrackRepository } from "@/infrastructure/persistence/dexie/DexieTrackRepository.ts";
import { LocalMusicDatabase } from "@/infrastructure/persistence/dexie/LocalMusicDatabase.ts";
import type { Track } from "@/domain/entities/Track.ts";

const makeTrack = (partial: Partial<Track> = {}): Track => ({
  id: `id-${Math.random().toString(36).slice(2)}`,
  sourceType: "file-picker",
  fileName: "song.mp3",
  fileSize: 123,
  lastModified: 0,
  fingerprint: `fp-${Math.random().toString(36).slice(2)}`,
  mimeType: "audio/mpeg",
  title: "Song",
  artist: "Artist",
  album: "Album",
  durationSeconds: null,
  availability: "available",
  isFavorite: false,
  playCount: 0,
  addedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...partial,
});

describe("DexieTrackRepository (fake-indexeddb)", () => {
  let db: LocalMusicDatabase;
  let repo: DexieTrackRepository;

  beforeEach(async () => {
    db = new LocalMusicDatabase(`test-${Math.random().toString(36).slice(2)}`);
    await db.open();
    repo = new DexieTrackRepository(db);
  });

  it("persists and finds by fingerprint", async () => {
    const track = makeTrack({ fingerprint: "foo|1|0", title: "Foo" });
    await repo.saveMany([track]);
    const found = await repo.findByFingerprint("foo|1|0");
    expect(found?.title).toBe("Foo");
  });

  it("searches case-insensitively by title/artist/album/fileName", async () => {
    await repo.saveMany([makeTrack({ title: "Luna", artist: "X" })]);
    const results = await repo.search("luna");
    expect(results).toHaveLength(1);
  });

  it("empty query returns all", async () => {
    await repo.saveMany([makeTrack(), makeTrack()]);
    const results = await repo.search("   ");
    expect(results).toHaveLength(2);
  });
});