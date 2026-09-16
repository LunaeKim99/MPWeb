import { describe, expect, it } from "vitest";
import { ImportTracksUseCase } from "@/application/use-cases/library/ImportTracksUseCase.ts";
import type { ImportFileInput } from "@/application/dto/ImportOutcome.ts";
import { InMemoryTrackRepository } from "@/infrastructure/persistence/dexie/inMemoryRepositories.ts";
import { FakeMetadataReader } from "@/infrastructure/audio/fakeAudioPorts.ts";

const createInput = (partial: Partial<ImportFileInput> = {}): ImportFileInput => ({
  fileName: "track.mp3",
  mimeType: "audio/mpeg",
  fileSize: 1000,
  lastModified: 0,
  getBuffer: async () => new ArrayBuffer(4),
  ...partial,
});

describe("ImportTracksUseCase", () => {
  it("imports accepted audio and deduplicates by fingerprint", async () => {
    const repo = new InMemoryTrackRepository();
    const metadataReader = new FakeMetadataReader();
    const useCase = new ImportTracksUseCase({
      trackRepository: repo,
      metadataReader,
      createId: (() => {
        let i = 0;
        return () => `id-${i++}`;
      })(),
      now: () => "2026-01-01T00:00:00.000Z",
    });

    const first = await useCase.execute([createInput()]);
    expect(first.imported).toBe(1);

    const second = await useCase.execute([createInput()]);
    expect(second.imported).toBe(0);
    expect(second.skippedDuplicate).toBe(1);

    const all = await repo.findAll();
    expect(all).toHaveLength(1);
  });

  it("continues importing when one file metadata read fails", async () => {
    const repo = new InMemoryTrackRepository();
    const metadataReader = new FakeMetadataReader();
    metadataReader.failFor.add("broken.mp3");
    const useCase = new ImportTracksUseCase({
      trackRepository: repo,
      metadataReader,
      createId: (() => {
        let i = 0;
        return () => `id-${i++}`;
      })(),
      now: () => "2026-01-01T00:00:00.000Z",
    });

    const outcome = await useCase.execute([
      createInput({ fileName: "broken.mp3" }),
      createInput({ fileName: "ok.mp3" }),
    ]);
    expect(outcome.imported).toBe(2);
    expect(outcome.failed).toBe(0);

    const all = await repo.findAll();
    expect(all).toHaveLength(2);
    expect(all[0]?.title).toBe("broken");
  });

  it("counts a failing file as failed without aborting batch", async () => {
    const repo = new InMemoryTrackRepository();
    const metadataReader = new FakeMetadataReader();
    const useCase = new ImportTracksUseCase({
      trackRepository: repo,
      metadataReader,
      createId: () => "id",
      now: () => new Date().toISOString(),
    });

    const outcome = await useCase.execute([
      createInput({
        fileName: "failing.mp3",
        fileSize: 2000,
        getBuffer: async () => {
          throw new Error("read failed");
        },
      }),
      createInput({ fileName: "ok.mp3" }),
    ]);
    expect(outcome.failed).toBe(1);
    expect(outcome.imported).toBe(1);
  });

  it("skips unsupported file types", async () => {
    const repo = new InMemoryTrackRepository();
    const metadataReader = new FakeMetadataReader();
    const useCase = new ImportTracksUseCase({
      trackRepository: repo,
      metadataReader,
      createId: () => "id",
      now: () => new Date().toISOString(),
    });

    const outcome = await useCase.execute([
      createInput({ fileName: "cover.txt", mimeType: "text/plain" }),
    ]);
    expect(outcome.skippedUnsupported).toBe(1);
    expect(outcome.imported).toBe(0);
  });

  it("falls back to filename title when metadata has no title", async () => {
    const repo = new InMemoryTrackRepository();
    const metadataReader = new FakeMetadataReader();
    const useCase = new ImportTracksUseCase({
      trackRepository: repo,
      metadataReader,
      createId: () => "id",
      now: () => new Date().toISOString(),
    });

    await useCase.execute([createInput({ fileName: "My Song.mp3" })]);
    const [track] = await repo.findAll();
    expect(track?.title).toBe("My Song");
  });
});