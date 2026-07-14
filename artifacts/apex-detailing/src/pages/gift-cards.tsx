import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ChevronRight,
  Gift,
  Sparkles,
  Star,
  Wand2,
  Droplets,
  Mail,
  CreditCard,
  Calendar,
} from "lucide-react";

const SQUARE_GIFT_URL =
  "https://app.squareup.com/gift/ML461GTYPW0JH/order";

interface Package {
  id: string;
  name: string;
  amount: number;
  tagline: string;
  bestFor: string;
  includes: string[];
  badge?: string;
  icon: typeof Wand2;
  accent: "purple" | "blue" | "gradient";
}

const PACKAGES: Package[] = [
  {
    id: "express",
    name: "The Express",
    amount: 100,
    tagline: "Quick refresh",
    bestFor: "A thoughtful thank-you gift",
    includes: [
      "Covers an Express Interior Detail",
      "Or applies toward any larger service",
      "Beautiful digital gift card",
    ],
    icon: Droplets,
    accent: "purple",
  },
  {
    id: "detailer",
    name: "The Detailer",
    amount: 200,
    tagline: "Most thoughtful",
    bestFor: "Parents, busy professionals, new car owners",
    includes: [
      "Covers a Full Interior Detail",
      "Pet hair / stain removal included",
      "Beautiful digital gift card",
    ],
    icon: Sparkles,
    accent: "blue",
  },
  {
    id: "showroom",
    name: "The Showroom",
    amount: 300,
    tagline: "Showroom-fresh",
    bestFor: "Birthdays, holidays, retirements",
    includes: [
      "Covers a complete Apex Full Detail",
      "Interior + exterior premium care",
      "Beautiful digital gift card",
    ],
    badge: "Most Popular",
    icon: Wand2,
    accent: "gradient",
  },
];

function GiftCardVisual({ amount }: { amount: number | string }) {
  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[1.6/1] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF1AD8] via-[#6b5aa8] to-[#00E5FF]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.4),transparent_60%)]" />
      <div className="relative h-full p-5 sm:p-6 flex flex-col justify-between text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80">
              Apex Detailing
            </p>
            <p className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-1 leading-none">
              Gift Card
            </p>
          </div>
          <Gift className="w-7 h-7 opacity-80" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-70 mb-1">
            Value
          </p>
          <p className="text-4xl sm:text-5xl font-black tracking-tight font-display">
            ${amount}
          </p>
        </div>
      </div>
    </div>
  );
}

function buildSquareUrl(amount?: number): string {
  // Square's single-link gift checkout doesn't accept a pre-filled amount
  // via query string — opening the URL drops the buyer on the standard
  // Square checkout where they pick an amount. We pass the chosen amount
  // through anyway so that if/when per-amount Square links are created,
  // we just swap the base URL per package.
  if (amount) {
    return `${SQUARE_GIFT_URL}?suggested=${amount}`;
  }
  return SQUARE_GIFT_URL;
}

const FAQS = [
  {
    q: "How does the recipient receive the gift card?",
    a: "Square emails them a digital gift card immediately after purchase. They can print it, forward it, or just show the email at our shop when they redeem it.",
  },
  {
    q: "Does the gift card expire?",
    a: "No — Apex gift cards do not expire. Use it whenever fits the recipient's schedule.",
  },
  {
    q: "Can it be used toward a larger service?",
    a: "Absolutely. The dollar amount applies to any Apex service. If the recipient wants a service that costs more than the card value, they simply pay the difference at the shop.",
  },
  {
    q: "Can I get a physical gift card?",
    a: "We currently offer digital cards only — they're delivered instantly and look beautiful when forwarded. If you'd like to print one, the email PDF is designed to look great on cardstock.",
  },
  {
    q: "Is the recipient required to book online?",
    a: "No. They can book online with the gift card code, or just call/text us at 417-527-6165 to schedule.",
  },
];

export default function GiftCardsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("150");

  const customNumeric = Math.max(
    25,
    Math.min(1000, Number(customAmount) || 0),
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to site</span>
          </Link>
          <a
            href={SQUARE_GIFT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[#00E5FF] hover:text-white transition"
          >
            Skip to checkout <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-gradient-to-b from-[#FF1AD8]/20 to-[#00E5FF]/10 blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF1AD8]/10 border border-[#FF1AD8]/30 mb-5">
                <Gift className="w-4 h-4 text-[#FF1AD8]" />
                <span className="text-xs font-bold tracking-widest uppercase text-[#FF1AD8]">
                  Gift Cards
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-6 font-display">
                Give the Gift of a{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF1AD8] to-[#00E5FF]">
                  Showroom Shine
                </span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-xl">
                The perfect gift for the car-lover, the busy parent, or anyone
                who deserves to drive a clean ride. Delivered instantly by
                email. Never expires.
              </p>
              <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#00E5FF]" />
                  <span>Delivered instantly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FF1AD8]" />
                  <span>Never expires</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star
                    className="w-4 h-4 text-[#E8C547]"
                    fill="currentColor"
                  />
                  <span>5.0★ on Google</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <GiftCardVisual amount={300} />
              <div className="absolute -z-10 inset-0 blur-3xl bg-gradient-to-br from-[#FF1AD8]/30 to-[#00E5FF]/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16 sm:py-20 bg-[#0d0d0d] border-y border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-sm font-bold tracking-widest text-[#FF1AD8] uppercase mb-3">
              Pick a Package
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight font-display">
              Choose the{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF1AD8] to-[#00E5FF]">
                Perfect Amount
              </span>
            </h3>
            <p className="text-gray-400 mt-4">
              Each package suggests a service it covers — the recipient can use
              the value toward anything we offer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
            {PACKAGES.map((pkg) => {
              const Icon = pkg.icon;
              const isPopular = pkg.badge === "Most Popular";
              return (
                <a
                  key={pkg.id}
                  href={buildSquareUrl(pkg.amount)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex flex-col p-6 sm:p-7 rounded-2xl border transition hover:-translate-y-1 hover:shadow-2xl ${
                    isPopular
                      ? "border-[#00E5FF]/50 bg-gradient-to-br from-[#00E5FF]/[0.08] via-transparent to-[#FF1AD8]/[0.06]"
                      : "border-white/10 bg-white/[0.02] hover:border-[#00E5FF]/40"
                  }`}
                >
                  {pkg.badge && (
                    <span className="badge-gold absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                      <Star
                        className="w-3 h-3 inline mr-1 -mt-0.5"
                        fill="currentColor"
                      />
                      {pkg.badge}
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/5 inline-flex">
                      <Icon
                        className={`w-6 h-6 ${
                          pkg.accent === "blue"
                            ? "text-[#00E5FF]"
                            : "text-[#FF1AD8]"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
                      {pkg.tagline}
                    </span>
                  </div>

                  <h4 className="text-2xl font-black uppercase tracking-tight mb-1">
                    {pkg.name}
                  </h4>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">
                    Starting at
                  </p>
                  <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#FF1AD8] to-[#00E5FF] mb-1 leading-none font-display">
                    ${pkg.amount}
                  </p>
                  <p className="text-sm text-gray-500 mb-5">{pkg.bestFor}</p>

                  <ul className="space-y-2 mb-6 flex-1">
                    {pkg.includes.map((line, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-300"
                      >
                        <ChevronRight className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>

                  <div
                    className={`w-full text-center py-3 rounded-xl font-black text-sm uppercase tracking-wider transition ${
                      isPopular
                        ? "bg-gradient-to-r from-[#FF1AD8] to-[#00E5FF] text-white"
                        : "bg-white/5 text-white border border-white/10 group-hover:border-[#00E5FF] group-hover:bg-[#00E5FF]/10"
                    }`}
                  >
                    Continue to Checkout →
                  </div>
                  <p className="text-[10px] text-gray-500 text-center mt-2">
                    Enter ${pkg.amount} on the secure Square checkout
                  </p>
                </a>
              );
            })}
          </div>

          {/* Custom amount */}
          <div className="max-w-2xl mx-auto mt-10 p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-[#FF1AD8]" />
              <h4 className="text-lg font-black uppercase tracking-tight">
                Or choose a custom amount
              </h4>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
              <div className="flex-1">
                <label
                  htmlFor="custom-amount"
                  className="text-xs uppercase tracking-wider text-gray-500 font-bold block mb-2"
                >
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-500">
                    $
                  </span>
                  <input
                    id="custom-amount"
                    type="number"
                    min="25"
                    max="1000"
                    step="5"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/10 text-2xl font-black focus:outline-none focus:border-[#00E5FF] transition"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Min $25 · Max $1,000 · Enter this amount on the secure
                  Square checkout
                </p>
              </div>
              <a
                href={buildSquareUrl(customNumeric)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Continue to Square checkout for $${customNumeric} gift card`}
                className="btn-cyber btn-cyber-sm whitespace-nowrap text-center"
              >
                <span>Continue to Checkout →</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-sm font-bold tracking-widest text-[#00E5FF] uppercase mb-3">
              How It Works
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight font-display">
              Three Easy Steps
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                step: 1,
                title: "Pick a Package",
                desc: "Choose one of our suggested packages or enter a custom amount that fits your budget.",
                icon: Gift,
              },
              {
                step: 2,
                title: "Pay Securely",
                desc: "Checkout is handled by Square — secure, fast, all major cards accepted.",
                icon: CreditCard,
              },
              {
                step: 3,
                title: "Recipient Gets It",
                desc: "A beautiful digital gift card is emailed to the recipient instantly. They book or call to redeem.",
                icon: Mail,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="relative p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/[0.02]"
                >
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-[#FF1AD8] to-[#00E5FF] flex items-center justify-center font-black text-white">
                    {item.step}
                  </div>
                  <Icon className="w-8 h-8 text-[#FF1AD8] mb-4" />
                  <h4 className="font-black text-lg mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-[#0d0d0d] border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-sm font-bold tracking-widest text-[#FF1AD8] uppercase mb-3">
              FAQ
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight font-display">
              Common Questions
            </h3>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`rounded-xl border transition-colors ${
                    isOpen
                      ? "bg-white/10 border-[#00E5FF]/40"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-white text-base sm:text-lg">
                      {faq.q}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 shrink-0 text-[#00E5FF] transition-transform duration-300 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-gray-300 text-sm sm:text-base leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-white/10 bg-[#111] p-10 sm:p-16 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-gradient-to-b from-[#FF1AD8]/20 to-[#00E5FF]/20 blur-3xl pointer-events-none" />
            <div className="relative">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 font-display">
                Ready to Make Their Day?
              </h3>
              <p className="text-gray-300 text-lg max-w-xl mx-auto mb-8">
                Pick an amount above, or jump straight to checkout — Square
                handles payment and delivery in under 60 seconds.
              </p>
              <a
                href={SQUARE_GIFT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cyber btn-cyber-lg"
              >
                <span>Buy a Gift Card</span> <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#0a0a0a] py-8">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <a
            href="https://www.apexwebworx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 hover:opacity-100 transition-all"
            aria-label="APEX WEB WORX"
          >
            <img
              src={`${import.meta.env.BASE_URL}images/apex-webworx-logo.png`}
              alt="APEX WEB WORX"
              className="h-14 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
            />
            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest group-hover:text-white transition-colors">
              Designed and developed by <span className="text-[#00E5FF] font-bold">APEX WEB WORX</span>
            </p>
          </a>
        </div>
      </footer>
    </div>
  );
}
