import { useEffect } from "react";
import { usePlayerStore } from "@/presentation/stores/playerStore.ts";
import { getContainer } from "@/di/container.ts";

export function usePlayerSync() {
  const init = usePlayerStore((state) => state.init);
  const applyPlaybackEvent = usePlayerStore((state) => state.applyPlaybackEvent);

  useEffect(() => {
    void init();
    const facade = getContainer().facade;
    const unsubscribe = facade.subscribePlayback((event) => {
      applyPlaybackEvent(event);
    });
    return () => {
      unsubscribe();
    };
  }, [init, applyPlaybackEvent]);
}
