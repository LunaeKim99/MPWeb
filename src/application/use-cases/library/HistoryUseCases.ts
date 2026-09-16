import type { PlayHistoryEntry } from "@/domain/entities/Playlist.ts";
import type { HistoryRepository } from "@/domain/repositories/repositories.ts";

export class RecordPlayHistoryUseCase {
  constructor(private readonly historyRepository: HistoryRepository) {}

  async execute(input: {
    trackId: string;
    playedAt?: string;
    completed?: boolean;
    listenedSeconds?: number;
    createId?: () => string;
  }): Promise<void> {
    const createId =
      input.createId ??
      (() =>
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `history-${Date.now()}-${Math.floor(Math.random() * 1e6)}`);
    const entry: PlayHistoryEntry = {
      id: createId(),
      trackId: input.trackId,
      playedAt: input.playedAt ?? new Date().toISOString(),
      completed: input.completed ?? false,
      listenedSeconds: input.listenedSeconds ?? 0,
    };
    await this.historyRepository.add(entry);
  }
}

export class GetRecentHistoryUseCase {
  constructor(private readonly historyRepository: HistoryRepository) {}

  async execute(limit: number): Promise<PlayHistoryEntry[]> {
    return this.historyRepository.findRecent(limit);
  }
}

export class ClearHistoryUseCase {
  constructor(private readonly historyRepository: HistoryRepository) {}

  async execute(): Promise<void> {
    await this.historyRepository.clear();
  }
}