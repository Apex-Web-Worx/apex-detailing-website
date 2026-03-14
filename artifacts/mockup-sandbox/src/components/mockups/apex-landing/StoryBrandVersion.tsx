import React, { useState } from "react";
import { 
  Menu, X, ChevronRight, Star, MapPin, Phone, Mail, Instagram, Facebook, Shield, Sparkles, CheckCircle2
} from "lucide-react";

const CALENDLY_LINK = "https://calendly.com/apexdetailingsf/detailing-appointment";

export function StoryBrandVersion() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const locations = "Springfield / Nixa / Ozark";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all ${isScrolled ? "bg-[#0a0a0a]/95 backdrop-blur py-4" : "py-6"}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <img src="/__mockup/images/logo.png" alt="Apex" className="h-12 w-auto brightness-0 invert" />
          <div className="hidden md:flex gap-8 items-center">
            <a href="#problem" className="text-sm hover:text-[#3496FF] transition">The Problem</a>
            <a href="#solution" className="text-sm hover:text-[#3496FF] transition">Our Solution</a>
            <a href="#results" className="text-sm hover:text-[#3496FF] transition">Results</a>
            <a href={CALENDLY_LINK} target="_blank" className="px-4 py-2 bg-[#3496FF] rounded text-black font-bold hover:bg-[#A886CD] transition">Book Now</a>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* PROBLEM SECTION - The Customer's Dilemma */}
      <section id="problem" className="relative pt-40 pb-24 px-4">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#A886CD] rounded-full mix-blend-screen filter blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3496FF] rounded-full mix-blend-screen filter blur-[100px]" />
        </div>
        <div className="container mx-auto relative z-10 text-center">
          <span className="text-[#3496FF] font-bold uppercase tracking-widest text-sm">The Struggle</span>
          <h2 className="text-5xl md:text-6xl font-black mt-4 mb-6 leading-tight">
            Your Car Deserves<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] to-[#3496FF]">Better Than It Gets</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Over time, dirt, scratches, and oxidation steal your vehicle's beauty. What was once showroom-perfect now looks tired and neglected. Professional detailing isn't a luxury—it's the only way to truly restore what you've invested in.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400">Oxidized Paint</p>
              <p className="text-lg font-bold mt-2">Loses shine & protection</p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400">Swirl Marks & Scratches</p>
              <p className="text-lg font-bold mt-2">Damage that spreads</p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400">Dirty Interior</p>
              <p className="text-lg font-bold mt-2">Stains & odors set in</p>
            </div>
          </div>
        </div>
      </section>

      {/* GUIDE SECTION - Apex as the Expert */}
      <section className="py-24 px-4 bg-white/2 border-y border-white/10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <img src="/__mockup/images/about-hero.jpg" alt="Mikhail" className="rounded-2xl w-full" />
            </div>
            <div>
              <span className="text-[#A886CD] font-bold uppercase tracking-widest text-sm">Meet Your Guide</span>
              <h3 className="text-4xl font-black mt-4 mb-6">Mikhail's Passion for<br/>
                <span className="text-[#3496FF]">Perfection</span>
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                With years of expertise in automotive detailing and a deep faith in doing work that honors God, Mikhail has built Apex Detailing on the principle that <span className="text-[#3496FF] font-semibold">every vehicle deserves excellence</span>.
              </p>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Mikhail doesn't just restore cars—he helps you protect your investment and restore pride in what you own. His meticulous approach and commitment to <span className="text-[#3496FF] font-semibold">Christian values</span> mean you can trust him with your most valuable asset.
              </p>
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-black text-[#3496FF]">100+</p>
                  <p className="text-gray-400 text-sm">Vehicles Detailed</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#A886CD]">5.0★</p>
                  <p className="text-gray-400 text-sm">Average Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION - What We Offer */}
      <section id="solution" className="py-24 px-4">
        <div className="container mx-auto text-center mb-16">
          <span className="text-[#3496FF] font-bold uppercase tracking-widest text-sm">Our Approach</span>
          <h3 className="text-5xl font-black mt-4">
            We Don't Just Detail<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] to-[#3496FF]">We Transform</span>
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { title: "Full Detailing", desc: "Interior + Exterior", price: "$300-$500", icon: "✨" },
            { title: "Interior Detailing", desc: "Deep cleaning & restoration", price: "$200-$350", icon: "🧹" },
            { title: "Ceramic Coating", desc: "Years of protection", price: "Call Quote", icon: "🛡️" },
            { title: "Paint Correction", desc: "Remove scratches & swirls", price: "$300-$600", icon: "🎨" },
            { title: "Headlight Restoration", desc: "Clarity & safety", price: "$100+", icon: "💡" },
            { title: "Wash, Clay & Wax", desc: "Foundation protection", price: "$250-$350", icon: "💧" },
          ].map((service, i) => (
            <div key={i} className="p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl hover:border-[#3496FF] transition">
              <p className="text-3xl mb-3">{service.icon}</p>
              <h4 className="text-xl font-black mb-2">{service.title}</h4>
              <p className="text-gray-400 text-sm mb-4">{service.desc}</p>
              <p className="text-[#3496FF] font-bold">{service.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SUCCESS VISION - Gallery */}
      <section id="results" className="py-24 px-4 bg-white/2 border-y border-white/10">
        <div className="container mx-auto text-center mb-16">
          <span className="text-[#A886CD] font-bold uppercase tracking-widest text-sm">Transformation Stories</span>
          <h3 className="text-5xl font-black mt-4">
            See What's<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] to-[#3496FF]">Possible</span>
          </h3>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto">From dull and oxidized to showroom shine. Your vehicle's transformation starts here.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#3496FF] to-[#A886CD] flex items-center justify-center">
            <img src="/__mockup/images/exterior-detail-1.jpg" alt="Before/After" className="w-full h-full object-cover brightness-150 contrast-125" />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#A886CD] to-[#3496FF] flex items-center justify-center">
            <img src="/__mockup/images/interior-restoration-1.jpg" alt="Interior" className="w-full h-full object-cover brightness-150 contrast-125" />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - Social Proof */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <h3 className="text-center text-3xl font-black mb-16">What Our Customers Say</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Michael T.", location: "Springfield, MO", text: "Made my 5-year-old truck look better than the day I bought it. Incredible attention to detail.", rating: 5 },
              { name: "Sarah W.", location: "Nixa, MO", text: "Got out stains I thought were permanent. My SUV smells and looks brand new again.", rating: 5 },
              { name: "David R.", location: "Ozark, MO", text: "Professional, punctual, and passionate. The quality of work will keep me coming back.", rating: 5 },
            ].map((review, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#3496FF] text-[#3496FF]" />)}
                </div>
                <p className="text-gray-300 mb-4">{review.text}</p>
                <p className="font-bold">{review.name}</p>
                <p className="text-[#3496FF] text-sm">{review.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 px-4 bg-white/2 border-y border-white/10">
        <div className="container mx-auto text-center">
          <h3 className="text-4xl font-black mb-4">Transparent Pricing</h3>
          <p className="text-gray-300 mb-12">No hidden fees. No surprises. Just honest pricing for honest work.</p>
          <div className="inline-block bg-white/5 border border-white/10 rounded-xl p-12">
            <p className="text-5xl font-black mb-4">$200-$600</p>
            <p className="text-gray-300 text-lg">Most Customers Invest This Range</p>
            <p className="text-gray-400 mt-4 text-sm">Custom pricing available for your specific needs</p>
          </div>
        </div>
      </section>

      {/* FAITH MESSAGE */}
      <section className="py-16 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <p className="text-lg text-gray-300 mb-4">
            <span className="text-[#3496FF] font-semibold">Apex Detailing</span> is built on <span className="text-[#3496FF] font-semibold">Christian</span> values and a commitment to excellence that honors <span className="text-[#3496FF] font-semibold">God</span>.
          </p>
          <p className="italic text-gray-400 mb-6">
            "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters, since you know that you will receive an inheritance from the Lord as a reward. It is the Lord Christ you are serving." - Colossians 3:23
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-black mb-6">Ready to Transform Your Vehicle?</h3>
          <p className="text-gray-300 text-lg mb-12 max-w-2xl mx-auto">
            Your car is waiting to be restored. Schedule your detail with Mikhail today and see the Apex Detailing difference.
          </p>
          <a
            href={CALENDLY_LINK}
            target="_blank"
            className="inline-block px-10 py-4 bg-gradient-to-r from-[#A886CD] to-[#3496FF] font-black rounded-lg text-white hover:scale-105 transition-transform text-lg"
          >
            BOOK YOUR TRANSFORMATION
          </a>
          <div className="mt-16 flex justify-center gap-8">
            <a href="#" className="text-gray-400 hover:text-[#3496FF] transition"><Instagram className="w-6 h-6" /></a>
            <a href="#" className="text-gray-400 hover:text-[#3496FF] transition"><Facebook className="w-6 h-6" /></a>
            <a href="tel:4175276165" className="text-gray-400 hover:text-[#3496FF] transition"><Phone className="w-6 h-6" /></a>
          </div>
        </div>
      </section>
    </div>
  );
}
