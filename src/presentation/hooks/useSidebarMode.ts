import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export type SidebarMode = "expanded" | "collapsed" | "hidden";

export const SIDEBAR_MODE_STORAGE_KEY = "mpweb-sidebar-mode";

function isSidebarMode(value: string | null): value is SidebarMode {
  return value === "expanded" || value === "collapsed" || value === "hidden";
}

function getInitialMode(): SidebarMode {
  if (typeof window === "undefined") return "expanded";
  try {
    const stored = window.localStorage.getItem(SIDEBAR_MODE_STORAGE_KEY);
    return isSidebarMode(stored) ? stored : "expanded";
  } catch {
    return "expanded";
  }
}

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" || tag === "TEXTAREA" || (el as HTMLElement).isContentEditable
  );
}

export interface UseSidebarModeOptions {
  enableShortcut?: boolean;
}

export interface UseSidebarModeReturn {
  mode: SidebarMode;
  setMode: Dispatch<SetStateAction<SidebarMode>>;
  isExpanded: boolean;
  isCollapsed: boolean;
  isHidden: boolean;
  toggleCompact: () => void;
  toggleHidden: () => void;
  reveal: () => void;
}

export function useSidebarMode(
  options: UseSidebarModeOptions = {},
): UseSidebarModeReturn {
  const { enableShortcut = true } = options;
  const [mode, setMode] = useState<SidebarMode>(() => getInitialMode());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(SIDEBAR_MODE_STORAGE_KEY, mode);
    } catch {
      // storage unavailable (private mode/quota) — mode still works in-memory
    }
  }, [mode]);

  const toggleCompact = useCallback(() => {
    setMode((current) =>
      current === "expanded" ? "collapsed" : "expanded",
    );
  }, []);

  const toggleHidden = useCallback(() => {
    setMode((current) => (current === "hidden" ? "collapsed" : "hidden"));
  }, []);

  const reveal = useCallback(() => {
    setMode("collapsed");
  }, []);

  useEffect(() => {
    if (!enableShortcut || typeof window === "undefined") return;
    const onKeyDown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyB") {
        if (isTypingTarget(document.activeElement)) return;
        e.preventDefault();
        setMode((current) =>
          current === "hidden"
            ? "collapsed"
            : current === "expanded"
              ? "collapsed"
              : "expanded",
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enableShortcut]);

  return {
    mode,
    setMode,
    isExpanded: mode === "expanded",
    isCollapsed: mode === "collapsed",
    isHidden: mode === "hidden",
    toggleCompact,
    toggleHidden,
    reveal,
  };
}
