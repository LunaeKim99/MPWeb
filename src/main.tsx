import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@/presentation/theme/mica.css";
import AppProviders from "@/presentation/app/AppProviders.tsx";
import AppRoutes from "@/presentation/app/routes.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  </StrictMode>,
);
