import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/presentation/components/layout/AppSidebar.tsx";
import TopAppBar from "@/presentation/components/layout/TopAppBar.tsx";
import MobileBottomNavigation from "@/presentation/components/layout/MobileBottomNavigation.tsx";
import PlayerBar from "@/presentation/components/player/PlayerBar.tsx";
import { usePlayerSync } from "@/presentation/hooks/usePlayerSync.ts";

export function AppShell() {
  usePlayerSync();

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AppSidebar />
      <Box
        sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
      >
        <TopAppBar />
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
