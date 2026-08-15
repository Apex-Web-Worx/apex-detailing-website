import { lazy, Suspense, useEffect } from "react";
import { Route, Switch, Router, useLocation } from "wouter";
import Home from "@/pages/home";
import BookingPage from "@/pages/booking";
import PwaManifestSwitch from "@/components/PwaManifestSwitch";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { forceDismissSplash } from "@/lib/bootSplash";
const ManagePage = lazy(() => import("@/pages/manage"));
const AdminPage = lazy(() => import("@/pages/admin"));
const GiftCardsPage = lazy(() => import("@/pages/gift-cards"));
const PrivacyPage = lazy(() => import("@/pages/privacy"));
const TermsPage = lazy(() => import("@/pages/terms"));
const NotFound = lazy(() => import("@/pages/not-found"));
const VideoTemplate = lazy(() => import("@/components/video/VideoTemplate"));
const ApexContentPage = lazy(() => import("@/pages/ApexContentPage"));

function RouteFallback() {
  return <div className="min-h-dvh bg-[#050505]" />;
}

function BootOnBook() {
  const [location] = useLocation();
  useEffect(() => {
    if (location === "/book" || location.startsWith("/book?") || location.endsWith("/book")) {
      forceDismissSplash();
    }
  }, [location]);
  return null;
}

function App() {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

  return (
    <Router base={base}>
      <LanguageProvider>
      <BootOnBook />
      <PwaManifestSwitch />
      {/* Shared stroke gradient for cyber button icons */}
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <defs>
          <linearGradient id="btn-cyber-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF1AD8" />
            <stop offset="50%" stopColor="#9D00FF" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
        </defs>
      </svg>
      <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/book" component={BookingPage} />
        <Route path="/manage/:id" component={ManagePage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/admin/:section" component={AdminPage} />
        <Route path="/admin/:section/:id" component={AdminPage} />
        <Route path="/gift-cards" component={GiftCardsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/video" component={VideoTemplate} />
        <Route path="/blog" component={ApexContentPage} />
        <Route path="/blog/:slug" component={ApexContentPage} />
        <Route component={NotFound} />
      </Switch>
      </Suspense>
      </LanguageProvider>
    </Router>
  );
}

export default App;
