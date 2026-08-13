import { useEffect } from "react";
import { Route, Router, Switch, useLocation } from "wouter";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Programs from "@/pages/Programs";
import ProgramDetail from "@/pages/ProgramDetail";
import Help from "@/pages/Help";
import Stories from "@/pages/Stories";
import StoryDetail from "@/pages/StoryDetail";
import News from "@/pages/News";
import NewsDetail from "@/pages/NewsDetail";
import Support from "@/pages/Support";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Cookies from "@/pages/Cookies";
import NotFound from "@/pages/NotFound";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

export default function App() {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

  return (
    <Router base={base}>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/apie-mus" component={About} />
        <Route path="/musu-veikla" component={Programs} />
        <Route path="/musu-veikla/:slug" component={ProgramDetail} />
        <Route path="/pagalba" component={Help} />
        <Route path="/istorijos" component={Stories} />
        <Route path="/istorijos/:slug" component={StoryDetail} />
        <Route path="/naujienos" component={News} />
        <Route path="/naujienos/:slug" component={NewsDetail} />
        <Route path="/parama" component={Support} />
        <Route path="/kontaktai" component={Contact} />
        <Route path="/privatumo-politika" component={Privacy} />
        <Route path="/slapuku-politika" component={Cookies} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}
