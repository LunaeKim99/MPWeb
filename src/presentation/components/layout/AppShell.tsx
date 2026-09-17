import Box from "@mui/material/Box";
import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/presentation/components/layout/AppSidebar.tsx";
import TopAppBar from "@/presentation/components/layout/TopAppBar.tsx";
import MobileBottomNavigation from "@/presentation/components/layout/MobileBottomNavigation.tsx";
import PlayerBar from "@/presentation/components/player/PlayerBar.tsx";
import { usePlayerSync } from "@/presentation/hooks/usePlayerSync.ts";
import { useSidebarMode } from "@/presentation/hooks/useSidebarMode.ts";

export function AppShell() {
  usePlayerSync();
  const { mode, isExpanded, isCollapsed, toggleCompact, toggleHidden, reveal } =
    useSidebarMode();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);

  const openMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(true);
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(false);
    // Return focus to trigger when discoverable (no focus trap required per spec).
    requestAnimationFrame(() => {
      mobileTriggerRef.current?.focus();
    });
  }, []);

  // Close drawer on navigation (mobile) — after routing, return focus if practical.
  useEffect(() => {
    if (!mobileDrawerOpen) return;
    setMobileDrawerOpen(false);
    requestAnimationFrame(() => {
      mobileTriggerRef.current?.focus();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Escape closes open drawer.
  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMobileDrawer();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileDrawerOpen, closeMobileDrawer]);

  // Prevent background scroll when drawer open (mobile).
  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileDrawerOpen]);

  return (
    <Box
      className="app-shell"
      data-mobile-drawer-open={mobileDrawerOpen ? "true" : "false"}
      sx={{
        display: "flex",
        minHeight: "100vh",
        overflow: "hidden",
        bgcolor: "transparent",
      }}
    >
      <AppSidebar
        mode={mode}
        isExpanded={isExpanded}
        isCollapsed={isCollapsed}
        toggleCompact={toggleCompact}
        toggleHidden={toggleHidden}
        reveal={reveal}
        mobileDrawerOpen={mobileDrawerOpen}
        onCloseMobileDrawer={closeMobileDrawer}
      />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <TopAppBar
          mobileDrawerOpen={mobileDrawerOpen}
          onOpenMobileDrawer={openMobileDrawer}
          onCloseMobileDrawer={closeMobileDrawer}
          mobileTriggerRef={mobileTriggerRef}
        />
        <Box
          component="main"
          sx={{
            flex: 1,
            px: { xs: 2, md: 4 },
            pb: { xs: 18, lg: 14 },
            maxWidth: 1280,
            width: "100%",
            mx: "auto",
            pt: 2,
            minWidth: 0,
            overflowX: "hidden",
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <MobileBottomNavigation />
      <PlayerBar />
    </Box>
  );
}

export default AppShell;
