import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { Link, useLocation } from "react-router-dom";
import MicaSurface from "@/presentation/components/common/MicaSurface.tsx";

const NAV_ITEMS = [
  { label: "Home", to: "/", icon: "◈" },
  { label: "Library", to: "/library", icon: "♫" },
  { label: "Favorites", to: "/favorites", icon: "♥" },
  { label: "Playlists", to: "/playlists", icon: "≡" },
] as const;

export function AppSidebar() {
  const location = useLocation();
  const isActive = (to: string) => location.pathname === to;
  const isSettingsActive = location.pathname.startsWith("/settings");

  return (
    <MicaSurface
      component="nav"
      aria-label="Primary"
      sx={{
        width: 264,
        flexShrink: 0,
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        p: 2,
        gap: 1,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "auto",
        borderRadius: 0,
        borderTop: 0,
        borderLeft: 0,
        borderBottom: 0,
      }}
    >
      <Typography variant="h6" sx={{ px: 1.5, py: 1, fontWeight: 700 }}>
        Local Music Player
      </Typography>
      <List dense sx={{ py: 0 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.to}
            component={Link}
            to={item.to}
            selected={isActive(item.to)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected": {
                bgcolor: "secondaryContainer",
                color: "onSurface",
              },
              "&.Mui-selected:hover": { bgcolor: "secondaryContainer" },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 36,
                color: isActive(item.to) ? "secondary.main" : "text.secondary",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{
                primary: {
                  sx: { fontWeight: isActive(item.to) ? 600 : 400 },
                } as never,
              }}
            />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flex: 1 }} />
      <Divider sx={{ my: 1 }} />
      <List dense sx={{ py: 0 }}>
        <ListItemButton
          component={Link}
          to="/settings"
          selected={isSettingsActive}
          sx={{
            borderRadius: 2,
            "&.Mui-selected": { bgcolor: "secondaryContainer" },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: isSettingsActive ? "secondary.main" : "text.secondary",
            }}
          >
            <span style={{ fontSize: 16 }}>⚙</span>
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
      </List>
    </MicaSurface>
  );
}

export default AppSidebar;
