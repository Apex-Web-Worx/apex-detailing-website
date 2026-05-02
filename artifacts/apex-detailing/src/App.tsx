import { Route, Switch, Router } from "wouter";
import Home from "@/pages/home";
import BookingPage from "@/pages/booking";
import ManagePage from "@/pages/manage";
import AdminPage from "@/pages/admin";
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
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

export default App;
