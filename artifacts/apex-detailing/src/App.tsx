import { Route, Switch, Router } from "wouter";
import Home from "@/pages/home";
import BookingPage from "@/pages/booking";
import ManagePage from "@/pages/manage";
import AdminPage from "@/pages/admin";
import GiftCardsPage from "@/pages/gift-cards";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import NotFound from "@/pages/not-found";
import VideoTemplate from "@/components/video/VideoTemplate";
import PwaManifestSwitch from "@/components/PwaManifestSwitch";

function App() {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

  return (
    <Router base={base}>
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
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/book" component={BookingPage} />
        <Route path="/manage/:id" component={ManagePage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/gift-cards" component={GiftCardsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/video" component={VideoTemplate} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

export default App;
