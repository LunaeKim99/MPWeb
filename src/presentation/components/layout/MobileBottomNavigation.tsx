import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import { useLocation, useNavigate } from "react-router-dom";

const NAV = [
  { label: "Home", to: "/", icon: "◈" },
  { label: "Library", to: "/library", icon: "♫" },
  { label: "Favorites", to: "/favorites", icon: "♥" },
  { label: "Playlists", to: "/playlists", icon: "≡" },
  { label: "Settings", to: "/settings", icon: "⚙" },
] as const;

export function MobileBottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const activePath =
    NAV.find(
      (i) =>
        location.pathname === i.to || location.pathname.startsWith(i.to + "/"),
    )?.to ?? "UNKNOWN";

  return (
    <Paper
      className="mica-surface"
      elevation={0}
      sx={{
        display: { xs: "block", lg: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        pb: "env(safe-area-inset-bottom)",
      }}
    >
      <BottomNavigation
        value={activePath}
        onChange={(_, v) => navigate(v)}
        showLabels
        sx={{ bgcolor: "transparent" }}
      >
        {NAV.map((item) => (
          <BottomNavigationAction
            key={item.to}
            label={item.label}
            value={item.to}
            icon={<span style={{ fontSize: 18 }}>{item.icon}</span>}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export default MobileBottomNavigation;
