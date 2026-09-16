import { create } from "zustand";
import type { Track } from "@/domain/entities/Track.ts";
import type {
  LibraryQuery,
  LibrarySort,
} from "@/application/factories/AppFacade.ts";
import type { ImportOutcome } from "@/application/dto/ImportOutcome.ts";
import type { AppFacade } from "@/application/factories/AppFacade.ts";
import { getContainer } from "@/di/container.ts";

export type LibraryStatus = "idle" | "loading" | "ready" | "error";

interface LibraryState {
  tracks: Track[];
  query: string;
  sort: LibrarySort;
  favoritesOnly: boolean;
  status: LibraryStatus;
  importStatus: "idle" | "importing" | "done" | "error";
  lastImport: ImportOutcome | null;
  errorMessage: string | null;
  refresh: () => Promise<void>;
  setQuery: (query: string) => Promise<void>;
  setSort: (sort: LibrarySort) => Promise<void>;
  setFavoritesOnly: (value: boolean) => Promise<void>;
  importFiles: (files: File[]) => Promise<ImportOutcome | null>;
  toggleFavorite: (trackId: string) => Promise<void>;
  removeTrack: (trackId: string) => Promise<void>;
}

let facadeRef: AppFacade | null = null;

function facade(): AppFacade {
  facadeRef ??= getContainer().facade;
  return facadeRef;
}

export function setLibraryFacade(next: AppFacade | null): void {
  facadeRef = next;
}

async function loadInto(set: (patch: Partial<LibraryState>) => void, get: () => LibraryState) {
  set({ status: "loading", errorMessage: null });
  try {
    const params: LibraryQuery = {
      query: get().query,
      sort: get().sort,
      favoritesOnly: get().favoritesOnly,
    };
    const tracks = await facade().getLibrary(params);
    set({ tracks, status: "ready" });
  } catch (error) {
    set({
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Library failed to load",
    });
  }
}

export const useLibraryStore = create<LibraryState>()((set, get) => ({
  tracks: [],
  query: "",
  sort: "recent",
  favoritesOnly: false,
  status: "idle",
  importStatus: "idle",
  lastImport: null,
  errorMessage: null,
  refresh: async () => {
    await loadInto(set as (patch: Partial<LibraryState>) => void, get as () => LibraryState);
  },
  setQuery: async (query) => {
    set({ query });
    await loadInto(set as (patch: Partial<LibraryState>) => void, get as () => LibraryState);
  },
  setSort: async (sort) => {
    set({ sort });
    await loadInto(set as (patch: Partial<LibraryState>) => void, get as () => LibraryState);
  },
  setFavoritesOnly: async (value) => {
    set({ favoritesOnly: value });
    await loadInto(set as (patch: Partial<LibraryState>) => void, get as () => LibraryState);
  },
  importFiles: async (files) => {
    set({ importStatus: "importing", lastImport: null, errorMessage: null });
    try {
      const inputs = files.map((file) => ({
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        lastModified: file.lastModified,
        getBuffer: () => file.arrayBuffer(),
      }));
      const outcome = await facade().importTracks(inputs);
      set({ importStatus: "done", lastImport: outcome });
      await loadInto(set as (patch: Partial<LibraryState>) => void, get as () => LibraryState);
      return outcome;
    } catch (error) {
      set({
        importStatus: "error",
        errorMessage: error instanceof Error ? error.message : "Import failed",
      });
      return null;
    }
  },
  toggleFavorite: async (trackId) => {
    await facade().toggleFavorite(trackId);
    await loadInto(set as (patch: Partial<LibraryState>) => void, get as () => LibraryState);
  },
  removeTrack: async (trackId) => {
    await facade().removeTrack(trackId);
    await loadInto(set as (patch: Partial<LibraryState>) => void, get as () => LibraryState);
  },
}));
