import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link, Outlet, useLocation } from "react-router-dom";
import MicaSurface from "@/presentation/components/common/MicaSurface.tsx";
import PlayerBar from "@/presentation/components/player/PlayerBar.tsx";
import { usePlayerSync } from "@/presentation/hooks/usePlayerSync.ts";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Library", to: "/library" },
  { label: "Favorites", to: "/favorites" },
  { label: "Playlists", to: "/playlists" },
  { label: "Settings", to: "/settings" },
] as const;

export function AppShell() {
  const location = useLocation();
  usePlayerSync();

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <MicaSurface>
        <AppBar position="static" elevation={0} color="transparent" sx={{ boxShadow: "none" }}>
          <Toolbar sx={{ gap: 2 }}>
            <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: "none", color: "inherit" }}>
              Local Music Player
            </Typography>
            <Box component="nav" sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.to}
                  component={Link}
                  to={item.to}
                  size="small"
                  variant={location.pathname === item.to ? "contained" : "text"}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Toolbar>
        </AppBar>
      </MicaSurface>
      <Box component="main" sx={{ flex: 1, p: 2, overflow: "auto", pb: 12 }}>
        <Outlet />
      </Box>
      <PlayerBar />
    </Box>
  );
}

export default AppShell;