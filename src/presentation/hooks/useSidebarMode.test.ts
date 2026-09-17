import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  SIDEBAR_MODE_STORAGE_KEY,
  useSidebarMode,
} from "@/presentation/hooks/useSidebarMode.ts";

function pressCtrlB(): void {
  window.dispatchEvent(
    new KeyboardEvent("keydown", { code: "KeyB", ctrlKey: true }),
  );
}

describe("useSidebarMode", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to expanded with no stored value", () => {
    const { result } = renderHook(() => useSidebarMode());
    expect(result.current.mode).toBe("expanded");
    expect(result.current.isExpanded).toBe(true);
  });

  it("falls back to expanded for invalid stored value", () => {
    window.localStorage.setItem(SIDEBAR_MODE_STORAGE_KEY, "junk");
    const { result } = renderHook(() => useSidebarMode());
    expect(result.current.mode).toBe("expanded");
  });

  it("restores stored collapsed mode", () => {
    window.localStorage.setItem(SIDEBAR_MODE_STORAGE_KEY, "collapsed");
    const { result } = renderHook(() => useSidebarMode());
    expect(result.current.isCollapsed).toBe(true);
  });

  it("toggles expanded<->collapsed and persists", () => {
    const { result } = renderHook(() => useSidebarMode());
    act(() => result.current.toggleCompact());
    expect(result.current.mode).toBe("collapsed");
    expect(window.localStorage.getItem(SIDEBAR_MODE_STORAGE_KEY)).toBe(
      "collapsed",
    );
    act(() => result.current.toggleCompact());
    expect(result.current.mode).toBe("expanded");
  });

  it("toggles hidden<->collapsed and reveals from hidden", () => {
    const { result } = renderHook(() => useSidebarMode());
    act(() => result.current.toggleHidden());
    expect(result.current.isHidden).toBe(true);
    act(() => result.current.reveal());
    expect(result.current.mode).toBe("collapsed");
  });

  it("Ctrl+B reveals hidden and toggles compact otherwise", () => {
    const { result } = renderHook(() => useSidebarMode());
    act(() => result.current.toggleHidden());
    expect(result.current.isHidden).toBe(true);
    act(() => pressCtrlB());
    expect(result.current.mode).toBe("collapsed");
    act(() => pressCtrlB());
    expect(result.current.mode).toBe("expanded");
  });
});
