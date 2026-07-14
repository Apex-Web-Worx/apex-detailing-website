import { useEffect } from "react";
import { useLocation } from "wouter";

const ADMIN_MANIFEST = "/admin.webmanifest";
const SITE_MANIFEST = "/manifest.webmanifest";

function isAdminPath(path: string) {
  return path === "/admin" || path.startsWith("/admin/");
}

function setManifestHref(href: string) {
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
}

function setAppTitles(title: string) {
  document
    .querySelector('meta[name="apple-mobile-web-app-title"]')
    ?.setAttribute("content", title);
  document
    .querySelector('meta[name="application-name"]')
    ?.setAttribute("content", title);
}

/**
 * Swap the installable PWA manifest so /admin uses the admin manifest.
 */
export default function PwaManifestSwitch() {
  const [location] = useLocation();

  useEffect(() => {
    const admin = isAdminPath(location);
    setManifestHref(admin ? ADMIN_MANIFEST : SITE_MANIFEST);
    setAppTitles(admin ? "Apex Admin" : "Apex Detail");

    if (admin) {
      try {
        localStorage.setItem("apex_pwa_start", "admin");
      } catch {
        // ignore
      }
      document.cookie =
        "apex_pwa_start=admin; Domain=.apexdetailing.net; Path=/; Max-Age=31536000; SameSite=Lax; Secure";
      document.title = "Apex Admin — Apex Detailing";
    }
  }, [location]);

  return null;
}

/** Shown on admin login — points to the real HTML install page. */
export function AdminPwaInstallHint() {
  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left">
      <p className="text-sm font-semibold text-white mb-1">Add Admin to Home Screen</p>
      <p className="text-xs text-gray-400 mb-3 leading-relaxed">
        Do not add the homepage. Open the install page, tap Enable, then Share → Add to Home
        Screen, and delete any old Apex icon.
      </p>
      <a
        href="/go-admin.html"
        className="block w-full py-2.5 rounded-sm border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-black uppercase tracking-[0.14em] hover:bg-[#00E5FF]/10 transition text-center"
      >
        Open install page
      </a>
    </div>
  );
}
