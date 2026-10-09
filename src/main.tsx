import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PreferencesProvider } from "./preferences";
import "../styles.css";
import "./styles/enhancements.css";
import "./styles/landing.css";
import { registerSW } from "virtual:pwa-register";
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <App />
      </PreferencesProvider>
    </QueryClientProvider>
  </ErrorBoundary>,
);
const updateServiceWorker = registerSW({
  onNeedRefresh() {
    window.dispatchEvent(new Event("app-update"));
  },
});
window.addEventListener(
  "app-update",
  () => {
    const notice = document.createElement("button");
    notice.className = "toast";
    notice.textContent =
      "Actualización disponible. Pulsa para aplicar y recargar.";
    notice.onclick = () => {
      if (confirm("¿Aplicar actualización? Tu progreso guardado se conserva."))
        void updateServiceWorker(true);
    };
    document.body.appendChild(notice);
  },
  { once: true },
);
