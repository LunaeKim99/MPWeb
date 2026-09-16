import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppShell from "@/presentation/components/layout/AppShell.tsx";
import { HomePage } from "@/presentation/pages/HomePage.tsx";
import { LibraryPage } from "@/presentation/pages/LibraryPage.tsx";
import { FavoritesPage } from "@/presentation/pages/FavoritesPage.tsx";
import { PlaylistsPage } from "@/presentation/pages/PlaylistsPage.tsx";
import { PlaylistDetailPage } from "@/presentation/pages/PlaylistDetailPage.tsx";
import { SettingsPage } from "@/presentation/pages/SettingsPage.tsx";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/library", element: <LibraryPage /> },
      { path: "/favorites", element: <FavoritesPage /> },
      { path: "/playlists", element: <PlaylistsPage /> },
      { path: "/playlists/:playlistId", element: <PlaylistDetailPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}

export default AppRoutes;
