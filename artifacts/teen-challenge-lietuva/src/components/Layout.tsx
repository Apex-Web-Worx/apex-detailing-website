import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <a href="#turinys" className="skip-link">
        Eiti prie turinio
      </a>
      <Navbar />
      <main id="turinys">{children}</main>
      <Footer />
    </div>
  );
}
