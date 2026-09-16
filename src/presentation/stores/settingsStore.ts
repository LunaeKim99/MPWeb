import { create } from "zustand";
import type { PlayerSettings } from "@/domain/entities/Playlist.ts";
import type { AppFacade } from "@/application/factories/AppFacade.ts";
import { DEFAULT_PLAYER_SETTINGS } from "@/domain/entities/Playlist.ts";
import { getContainer } from "@/di/container.ts";

export type SettingsStatus = "idle" | "loading" | "ready" | "error";

interface SettingsState {
  settings: PlayerSettings;
  status: SettingsStatus;
  errorMessage: string | null;
  load: () => Promise<void>;
  update: (patch: Partial<PlayerSettings>) => Promise<void>;
}

let facadeRef: AppFacade | null = null;

function facade(): AppFacade {
  facadeRef ??= getContainer().facade;
  return facadeRef;
}

export function setSettingsFacade(next: AppFacade | null): void {
  facadeRef = next;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  settings: DEFAULT_PLAYER_SETTINGS,
  status: "idle",
  errorMessage: null,
  load: async () => {
    set({ status: "loading", errorMessage: null });
    try {
      const settings = await facade().getSettings();
      set({ settings, status: "ready" });
    } catch (error) {
      set({
        status: "error",
        errorMessage:
          error instanceof Error ? error.message : "Settings failed to load",
      });
    }
  },
  update: async (patch) => {
    const settings = await facade().updateSettings(patch);
    set({ settings, status: "ready" });
  },
}));
