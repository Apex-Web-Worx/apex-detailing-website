import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { markAppReady, markContentReady } from "./lib/bootSplash";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);

function isHomeRoute(): boolean {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const path = (window.location.pathname || "/").replace(/\/$/, "") || "/";
  const route = base && path.startsWith(base) ? path.slice(base.length) || "/" : path;
  return route === "/" || route === "";
}

// Tell the HTML splash React has painted. Home waits for hero decode separately;
// other routes mark content ready here so splash can dismiss.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const finishApp = () => {
      markAppReady();
      if (!isHomeRoute()) {
        markContentReady();
      }
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(finishApp).catch(finishApp);
    } else {
      finishApp();
    }
  });
});
