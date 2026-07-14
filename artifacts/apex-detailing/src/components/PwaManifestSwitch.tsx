import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Swap the installable PWA manifest so /admin installs as "Apex Admin"
 * (opens /admin), while the rest of the site installs as the customer app.
 */
export default function PwaManifestSwitch() {
  const [location] = useLocation();

  useEffect(() => {
    const isAdmin = location === "/admin" || location.startsWith("/admin/");
    const href = isAdmin ? "/admin.webmanifest" : "/manifest.webmanifest";
    const title = isAdmin ? "Apex Admin" : "Apex Detail";

    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      link.id = "pwa-manifest";
      document.head.appendChild(link);
    }
    if (link.getAttribute("href") !== href) {
      link.setAttribute("href", href);
    }

    const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (appleTitle) appleTitle.setAttribute("content", title);

    const appName = document.querySelector('meta[name="application-name"]');
    if (appName) appName.setAttribute("content", title);

    document.title = isAdmin
      ? "Apex Admin — Apex Detailing"
      : document.title.includes("Apex Admin")
        ? "Apex Detailing - Premium Car Detailing in Springfield, Nixa & Ozark, MO"
        : document.title;
  }, [location]);

  return null;
}
