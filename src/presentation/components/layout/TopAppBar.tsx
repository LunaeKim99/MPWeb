import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import MicaSurface from "@/presentation/components/common/MicaSurface.tsx";

interface TopAppBarProps {
  mobileDrawerOpen?: boolean;
  onOpenMobileDrawer?: () => void;
  onCloseMobileDrawer?: () => void;
  mobileTriggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function TopAppBar({
  mobileDrawerOpen = false,
  onOpenMobileDrawer,
  onCloseMobileDrawer,
  mobileTriggerRef,
}: TopAppBarProps) {
  const toggleMobile = () => {
    if (mobileDrawerOpen) onCloseMobileDrawer?.();
    else onOpenMobileDrawer?.();
  };

  return (
    <MicaSurface
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderRadius: 0,
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0,
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        color="transparent"
        sx={{ boxShadow: "none" }}
      >
        <Toolbar sx={{ gap: 1.5, minHeight: { xs: 56, sm: 64 } }}>
          <button
            type="button"
            ref={mobileTriggerRef as React.RefObject<HTMLButtonElement>}
            className="sidebar-reveal-button sidebar-reveal-button--mobile"
            aria-label={
              mobileDrawerOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
            }
            aria-expanded={mobileDrawerOpen}
            aria-controls="app-sidebar"
            onClick={toggleMobile}
            // Visible only below lg via CSS; inline sx would conflict with tokens.
          >
            {mobileDrawerOpen ? "✕" : "☰"}
          </button>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: 700,
              display: { xs: "block", lg: "none" },
            }}
          >
            MPWeb
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", lg: "block" } }}
          >
            Your local library, beautifully organized
          </Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton
            component={Link}
            to="/settings"
            className="float-icon-button"
            aria-label="Open settings"
            title="Settings"
            size="small"
            sx={{ color: "text.secondary" }}
          >
            ⚙
          </IconButton>
        </Toolbar>
      </AppBar>
    </MicaSurface>
  );
}

export default TopAppBar;
