import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505]">
      <Card className="w-full max-w-md mx-4 bg-[#080808] border-white/10 text-white">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-[#00E5FF]" />
            <h1 className="text-2xl font-bold text-white">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-300">
            The page you are looking for doesn't exist or has been moved.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center w-full py-3 rounded-sm bg-[#FF1AD8] text-white font-black uppercase tracking-[0.14em] text-sm hover:bg-[#ff45e0] transition"
          >
            Back to home
          </Link>
        </CardContent>
      </Card>

      <footer className="mt-12 py-8">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <a
            href="https://www.apexwebworx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 hover:opacity-100 transition-all"
            aria-label="APEX WEB WORX"
          >
            <picture>
              <source srcSet={`${import.meta.env.BASE_URL}images/apex-webworx-logo.webp`} type="image/webp" />
              <img
                src={`${import.meta.env.BASE_URL}images/apex-webworx-logo.png`}
                alt="APEX WEB WORX"
                className="h-14 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest group-hover:text-white transition-colors">
              Designed and developed by <span className="text-[#00E5FF] font-bold">APEX WEB WORX</span>
            </p>
          </a>
        </div>
      </footer>
    </div>
  );
}
