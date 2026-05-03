import { Route, Switch, Router } from "wouter";
import Home from "@/pages/home";
import BookingPage from "@/pages/booking";
import ManagePage from "@/pages/manage";
import AdminPage from "@/pages/admin";
import GiftCardsPage from "@/pages/gift-cards";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import NotFound from "@/pages/not-found";

function App() {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

  return (
    <Router base={base}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/book" component={BookingPage} />
        <Route path="/manage/:id" component={ManagePage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/gift-cards" component={GiftCardsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

export default App;
