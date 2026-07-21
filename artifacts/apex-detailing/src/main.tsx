import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { markAppReady } from "./lib/bootSplash";

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

// Dismiss splash as soon as React has painted + fonts are ready.
// Photos use LQIP + mobile WebP — they must not block entry.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const finish = () => markAppReady();
    if (document.fonts?.ready) {
      document.fonts.ready.then(finish).catch(finish);
    } else {
      finish();
    }
  });
});
