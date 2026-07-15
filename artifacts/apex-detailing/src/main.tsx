import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

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

// Tell the HTML splash it can dismiss after React has painted (logo wait is separate).
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    (
      window as Window & { __APEX_MARK_APP_READY__?: () => void }
    ).__APEX_MARK_APP_READY__?.();
  });
});
