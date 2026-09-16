import { useEffect } from "react";
import { usePlayerStore } from "@/presentation/stores/playerStore.ts";

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    (el as HTMLElement).isContentEditable
  );
}

export function usePlaybackShortcuts(enabled = true): void {
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const seek = usePlayerStore((s) => s.seek);
  const positionSeconds = usePlayerStore((s) => s.positionSeconds);

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (isTypingTarget(document.activeElement)) return;
      if (e.code === "Space" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        void togglePlayPause();
        return;
      }
      if (e.code === "ArrowLeft" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        void seek(Math.max(0, positionSeconds - 5));
      } else if (
        e.code === "ArrowRight" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        void seek(positionSeconds + 5);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, togglePlayPause, seek, positionSeconds]);
}
