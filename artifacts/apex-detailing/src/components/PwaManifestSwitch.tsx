import { useEffect, useState } from "react";
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
 * Swap the installable PWA manifest so /admin installs as "Apex Admin"
 * and remember that preference so iOS standalone launches that ignore
 * start_url still redirect into /admin.
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
      document.title = "Apex Admin — Apex Detailing";
    }
  }, [location]);

  return null;
}

/** Shown on admin login — prepares Home Screen install for /admin. */
export function AdminPwaInstallHint() {
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("apex_pwa_start", "admin");
    } catch {
      // ignore
    }
    setManifestHref(ADMIN_MANIFEST);
    setAppTitles("Apex Admin");
  }, []);

  const onInstall = async () => {
    try {
      localStorage.setItem("apex_pwa_start", "admin");
    } catch {
      // ignore
    }
    setManifestHref(ADMIN_MANIFEST);
    setAppTitles("Apex Admin");

    const deferred = (window as unknown as { deferredApexInstall?: BeforeInstallPromptEvent })
      .deferredApexInstall;
    if (deferred) {
      deferred.prompt();
      return;
    }

    // iOS Safari has no install API — show Share → Add to Home Screen steps
    setIosHint(true);
  };

  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left">
      <p className="text-sm font-semibold text-white mb-1">Add Admin to Home Screen</p>
      <p className="text-xs text-gray-400 mb-3 leading-relaxed">
        Install from this page so the icon opens <span className="text-white">/admin</span>, not
        the public site.
      </p>
      <button
        type="button"
        onClick={onInstall}
        className="w-full py-2.5 rounded-sm border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-black uppercase tracking-[0.14em] hover:bg-[#00E5FF]/10 transition"
      >
        Prepare Admin install
      </button>
      {iosHint && (
        <ol className="mt-3 space-y-1.5 text-xs text-gray-300 list-decimal list-inside leading-relaxed">
          <li>Tap the Share button in Safari</li>
          <li>Choose <span className="text-white font-semibold">Add to Home Screen</span></li>
          <li>Keep the name <span className="text-white font-semibold">Apex Admin</span></li>
          <li>Delete any old Apex icon that still opened the homepage</li>
        </ol>
      )}
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}
