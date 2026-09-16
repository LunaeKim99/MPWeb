import type { PlayerSettings } from "@/domain/entities/Playlist.ts";
import type { SettingsRepository } from "@/domain/repositories/repositories.ts";

export class GetPlayerSettingsUseCase {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async execute(): Promise<PlayerSettings> {
    return this.settingsRepository.get();
  }
}

export class UpdatePlayerSettingsUseCase {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async execute(patch: Partial<PlayerSettings>): Promise<PlayerSettings> {
    const current = await this.settingsRepository.get();
    const updated: PlayerSettings = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await this.settingsRepository.save(updated);
    return updated;
  }
}