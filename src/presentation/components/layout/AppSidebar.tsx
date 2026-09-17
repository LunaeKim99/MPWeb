import Box from "@mui/material/Box";
import { Link, useLocation } from "react-router-dom";
import MicaSurface from "@/presentation/components/common/MicaSurface.tsx";
import type { SidebarMode } from "@/presentation/hooks/useSidebarMode.ts";

const NAV_ITEMS = [
  { label: "Home", to: "/", icon: "◈", tooltip: "Home" },
  { label: "Library", to: "/library", icon: "♫", tooltip: "Library" },
  { label: "Favorites", to: "/favorites", icon: "♥", tooltip: "Favorites" },
  { label: "Playlists", to: "/playlists", icon: "≡", tooltip: "Playlists" },
] as const;

function modeClass(mode: SidebarMode): string {
  return mode === "collapsed"
    ? "app-sidebar--collapsed"
    : mode === "hidden"
      ? "app-sidebar--hidden"
      : "";
}

interface AppSidebarProps {
  mode: SidebarMode;
  isExpanded: boolean;
  isCollapsed: boolean;
  toggleCompact: () => void;
  toggleHidden: () => void;
  reveal: () => void;
  mobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
}

export function AppSidebar({
  mode,
  isExpanded,
  isCollapsed,
  toggleCompact,
  toggleHidden,
  reveal,
  mobileDrawerOpen = false,
  onCloseMobileDrawer,
}: AppSidebarProps) {
  const location = useLocation();
  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };
  const collapsed = isCollapsed;
  const hidden = mode === "hidden";

  return (
    <>
      {mobileDrawerOpen && (
        <button
          type="button"
          className="app-sidebar-backdrop"
          aria-label="Tutup menu navigasi"
          onClick={onCloseMobileDrawer}
          // Pure click-target; Escape handled in AppShell.
        />
      )}
      <MicaSurface
        component="aside"
        id="app-sidebar"
        aria-label="Navigasi utama"
        className={`app-sidebar ${modeClass(mode)}`}
        sx={{
          borderRadius: 0,
          borderTop: 0,
          borderLeft: 0,
          borderBottom: 0,
          flexShrink: 0,
        }}
      >
        <Box className="sidebar-header">
          <Link to="/" className="brand" aria-label="Home — MPWeb">
            <span className="brand-mark" aria-hidden="true">
              ◈
            </span>
            <span className="brand-copy">
              <strong>MPWeb</strong>
              <span>Your library, your space</span>
            </span>
          </Link>
          <Box className="sidebar-actions">
            <button
              type="button"
              className="sidebar-toggle"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={isExpanded}
              aria-controls="app-sidebar"
              onClick={toggleCompact}
            >
              {collapsed ? "▸" : "◂"}
            </button>
            <button
              type="button"
              className="sidebar-hide"
              aria-label="Hide sidebar"
              aria-controls="app-sidebar"
              onClick={toggleHidden}
            >
              ✕
            </button>
            <button
              type="button"
              className="sidebar-mobile-close"
              aria-label="Tutup menu navigasi"
              aria-controls="app-sidebar"
              aria-expanded={mobileDrawerOpen}
              onClick={onCloseMobileDrawer}
            >
              ✕
            </button>
          </Box>
        </Box>

        <Box component="nav" aria-label="Menu utama" className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-nav-item${active ? " is-active" : ""}`}
                data-tooltip={item.tooltip}
                aria-current={active ? "page" : undefined}
              >
                <span className="sidebar-nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            );
          })}
        </Box>
      </MicaSurface>

      {hidden && !mobileDrawerOpen && (
        <button
          type="button"
          className="sidebar-reveal-button"
          aria-label="Show sidebar"
          onClick={reveal}
        >
          ≫
        </button>
      )}
    </>
  );
}

export default AppSidebar;
