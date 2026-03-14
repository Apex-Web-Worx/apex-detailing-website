import React, { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  ChevronRight, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook, 
  CheckCircle,
  Shield,
  Sparkles,
  Droplets,
  Car,
  Clock,
  Award
} from "lucide-react";

export function PremiumLuxury() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const CALENDLY_LINK = "https://calendly.com/apexdetailingsf/detailing-appointment";
  const PRIMARY_PURPLE = "#A886CD";
  const ACCENT_GOLD = "#D4A853";

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Mulish'] selection:bg-[#D4A853] selection:text-black">
      {/* Navigation */}
      <nav 
        className={`fixed w-full z-50 transition-all duration-500 border-b border-transparent ${
          isScrolled ? "bg-[#050505]/95 backdrop-blur-md py-4 border-[#D4A853]/20" : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/__mockup/images/logo.png" 
              alt="Apex Detailing" 
              className="h-12 w-auto object-contain brightness-0 invert" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-2xl font-['Playfair_Display'] tracking-widest font-bold uppercase text-[#D4A853]">Apex</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex gap-8 text-[11px] uppercase tracking-[0.2em] font-medium text-white/80">
              <a href="#home" className="hover:text-[#D4A853] transition-colors duration-300">Home</a>
              <a href="#about" className="hover:text-[#D4A853] transition-colors duration-300">About</a>
              <a href="#services" className="hover:text-[#D4A853] transition-colors duration-300">Services</a>
              <a href="#gallery" className="hover:text-[#D4A853] transition-colors duration-300">Gallery</a>
            </div>
            <a 
              href={CALENDLY_LINK} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative px-8 py-3 bg-transparent border border-[#D4A853] text-[#D4A853] text-xs uppercase tracking-[0.2em] overflow-hidden transition-all duration-500 hover:text-black hover:bg-[#D4A853]"
            >
              <span className="relative z-10 font-semibold">Reserve Session</span>
            </a>
          </div>

          <button 
            className="lg:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} className="text-[#D4A853]" /> : <Menu size={28} className="text-[#D4A853]" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 bg-[#050505] transition-transform duration-500 pt-28 px-6 ${
        mobileMenuOpen ? "translate-x-0" : "translate-x-full"
      } lg:hidden`}>
        <div className="flex flex-col gap-8 text-lg font-['Playfair_Display'] tracking-widest uppercase">
          <a href="#home" onClick={() => setMobileMenuOpen(false)} className="border-b border-white/10 pb-4 text-[#D4A853]">Home</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)} className="border-b border-white/10 pb-4 text-white/80 hover:text-[#D4A853]">About</a>
          <a href="#services" onClick={() => setMobileMenuOpen(false)} className="border-b border-white/10 pb-4 text-white/80 hover:text-[#D4A853]">Services</a>
          <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="border-b border-white/10 pb-4 text-white/80 hover:text-[#D4A853]">Gallery</a>
          <a 
            href={CALENDLY_LINK} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-8 px-6 py-4 bg-[#D4A853] text-black text-center font-bold text-sm tracking-[0.2em] font-['Mulish']"
          >
            BOOK APPOINTMENT
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Abstract luxury background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-[#050505] z-10" />
          <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-[#A886CD]/10 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D4A853]/10 rounded-full blur-[100px] mix-blend-screen" />
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjEyLCAxNjgsIDgzLCAwLjA1KSIvPjwvc3ZnPg==')] opacity-50 z-0" />
        </div>

        <div className="container relative z-20 mx-auto px-6 md:px-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] w-12 bg-[#D4A853]" />
              <p className="text-[#D4A853] text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold">
                Premium Vehicle Detailing in Nixa ● Ozark ● Springfield
              </p>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-['Playfair_Display'] font-medium leading-[1.1] mb-8">
              The Art of <br />
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-[#D4A853] to-[#A886CD]">
                Automotive
              </span><br />
              <span className="italic font-light">Perfection.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/60 font-light max-w-2xl mb-12 leading-relaxed">
              Elevating the standard of automotive care. Experience uncompromising attention to detail, premium ceramic coatings, and masterful paint correction tailored for the discerning owner.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <a 
                href={CALENDLY_LINK} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative px-10 py-4 bg-[#D4A853] text-black text-xs uppercase tracking-[0.2em] font-bold overflow-hidden text-center"
              >
                <div className="absolute inset-0 w-0 bg-white transition-all duration-[400ms] ease-out group-hover:w-full" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Commission a Service
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </a>
              <a 
                href="#services" 
                className="px-10 py-4 border border-white/20 text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-white/5 transition-colors text-center"
              >
                Explore Services
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 opacity-50">
          <span className="text-[10px] uppercase tracking-[0.2em] rotate-90 mb-6">Scroll</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-[#D4A853] to-transparent" />
        </div>
      </section>

      {/* Divider */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4A853]/30 to-transparent" />

      {/* Services Section */}
      <section id="services" className="py-32 relative">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-5xl font-['Playfair_Display'] mb-6">Signature Services</h2>
            <div className="w-16 h-[2px] bg-[#D4A853] mx-auto mb-8" />
            <p className="text-white/60 max-w-2xl mx-auto font-light text-lg">
              Meticulous craftsmanship applied to every surface. We utilize only the finest products and proven techniques to restore and protect your investment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Ceramic Coating */}
            <div className="group relative border border-white/10 bg-[#0A0A0A] p-10 hover:border-[#D4A853]/50 transition-all duration-500 lg:col-span-2 lg:row-span-2 flex flex-col justify-end overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#050505] z-0" />
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield size={120} className="text-[#D4A853]" />
              </div>
              <div className="relative z-10 mt-32">
                <div className="text-[#D4A853] mb-6"><Shield size={32} /></div>
                <h3 className="text-3xl font-['Playfair_Display'] mb-4 group-hover:text-[#D4A853] transition-colors">Ceramic Coating</h3>
                <p className="text-white/60 leading-relaxed font-light mb-8 max-w-xl">
                  The ultimate protection for your vehicle's clear coat. Our premium ceramic coatings provide years of unrivaled gloss, extreme hydrophobicity, and defense against environmental contaminants.
                </p>
                <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#D4A853] hover:text-white transition-colors font-bold">
                  Book Consultation <ChevronRight size={14} />
                </a>
              </div>
            </div>

            {/* Paint Correction */}
            <div className="group border border-white/10 bg-[#0A0A0A] p-10 hover:border-[#D4A853]/50 transition-all duration-500 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#A886CD]/5 rounded-tl-full" />
              <div className="relative z-10">
                <div className="text-[#D4A853] mb-6"><Sparkles size={28} /></div>
                <h3 className="text-xl font-['Playfair_Display'] mb-4">Paint Correction</h3>
                <p className="text-white/60 text-sm leading-relaxed font-light mb-8">
                  Removing swirl marks, scratches, and oxidation to reveal a flawless, mirror-like finish beneath.
                </p>
              </div>
              <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer" className="relative z-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50 group-hover:text-[#D4A853] transition-colors">
                Learn More <ChevronRight size={14} />
              </a>
            </div>

            {/* Interior Detailing */}
            <div className="group border border-white/10 bg-[#0A0A0A] p-10 hover:border-[#D4A853]/50 transition-all duration-500 flex flex-col justify-between relative overflow-hidden">
               <div className="absolute left-0 bottom-0 w-32 h-32 bg-[#D4A853]/5 rounded-tr-full" />
               <div className="relative z-10">
                <div className="text-[#D4A853] mb-6"><Car size={28} /></div>
                <h3 className="text-xl font-['Playfair_Display'] mb-4">Interior Restoration</h3>
                <p className="text-white/60 text-sm leading-relaxed font-light mb-8">
                  Deep cleaning, leather conditioning, and fabric protection for a cabin that feels pristine and smells luxurious.
                </p>
              </div>
              <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer" className="relative z-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50 group-hover:text-[#D4A853] transition-colors">
                Learn More <ChevronRight size={14} />
              </a>
            </div>

            {/* Exterior Detailing */}
            <div className="group border border-white/10 bg-[#0A0A0A] p-10 hover:border-[#D4A853]/50 transition-all duration-500 flex flex-col justify-between">
              <div>
                <div className="text-[#D4A853] mb-6"><Droplets size={28} /></div>
                <h3 className="text-xl font-['Playfair_Display'] mb-4">Exterior Detailing</h3>
                <p className="text-white/60 text-sm leading-relaxed font-light mb-8">
                  Comprehensive safe-wash methods, decontamination, and premium sealant application.
                </p>
              </div>
              <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50 group-hover:text-[#D4A853] transition-colors">
                Learn More <ChevronRight size={14} />
              </a>
            </div>

            {/* Headlight Restoration */}
            <div className="group border border-white/10 bg-[#0A0A0A] p-10 hover:border-[#D4A853]/50 transition-all duration-500 flex flex-col justify-between">
              <div>
                <div className="text-[#D4A853] mb-6"><CheckCircle size={28} /></div>
                <h3 className="text-xl font-['Playfair_Display'] mb-4">Headlight Restoration</h3>
                <p className="text-white/60 text-sm leading-relaxed font-light mb-8">
                  Restoring clarity to hazy lenses, improving nighttime visibility and aesthetic appeal.
                </p>
              </div>
              <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50 group-hover:text-[#D4A853] transition-colors">
                Learn More <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* About Section */}
      <section id="about" className="py-32 relative overflow-hidden">
        {/* Abstract shape */}
        <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full z-0" />
        <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#D4A853]/10 rounded-full z-0" />

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="w-full lg:w-1/2">
              <div className="relative aspect-[3/4] max-w-md mx-auto lg:mx-0">
                {/* Image Placeholder with premium styling */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#D4A853]/20 flex items-center justify-center p-8">
                  <div className="text-center opacity-30">
                     <Award size={64} className="mx-auto mb-4 text-[#D4A853]" />
                     <p className="font-['Playfair_Display'] text-xl italic">Excellence in every detail</p>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-24 h-24 border-t-2 border-l-2 border-[#D4A853]" />
                <div className="absolute -bottom-6 -right-6 w-24 h-24 border-b-2 border-r-2 border-[#D4A853]" />
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <p className="text-[#D4A853] text-xs uppercase tracking-[0.3em] font-bold mb-6">Our Philosophy</p>
              <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] mb-8 leading-tight">
                Not Just Clean.<br /><span className="italic text-white/70">Immaculate.</span>
              </h2>
              
              <div className="space-y-6 text-white/70 font-light text-lg mb-12">
                <p>
                  Apex Detailing was founded on a simple premise: vehicles are more than transportation; they are investments and passions that deserve expert care.
                </p>
                <p>
                  Serving Nixa ● Ozark ● Springfield, we bring unparalleled convenience without compromising on quality. Our mobile service delivers a studio-grade detailing experience directly to your driveway.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="text-[#D4A853]" size={20} />
                    <h4 className="font-['Playfair_Display'] text-xl">Master Technicians</h4>
                  </div>
                  <p className="text-sm text-white/50 font-light">Certified experts in paint correction and ceramic application.</p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="text-[#D4A853]" size={20} />
                    <h4 className="font-['Playfair_Display'] text-xl">Mobile Luxury</h4>
                  </div>
                  <p className="text-sm text-white/50 font-light">We bring our fully-equipped studio to your home or office.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4A853]/30 to-transparent" />

      {/* Gallery Section */}
      <section id="gallery" className="py-32">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] mb-4">The Portfolio</h2>
              <p className="text-white/60 font-light max-w-xl">
                A showcase of transformations. Behold the depth, clarity, and gloss achieved through our meticulous processes.
              </p>
            </div>
            <a href="https://www.instagram.com/apexdetailing_sf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-bold hover:text-[#D4A853] transition-colors pb-2 border-b border-[#D4A853]">
              View Instagram <Instagram size={14} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gallery Item 1 */}
            <div className="group relative aspect-[4/5] overflow-hidden border border-white/5 hover:border-[#D4A853]/50 transition-colors duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#0A0A0A] group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10" />
              <div className="absolute bottom-0 left-0 p-8 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <p className="text-[#D4A853] text-[10px] uppercase tracking-widest mb-2">Paint Correction</p>
                <h4 className="text-xl font-['Playfair_Display']">Porsche 911 GT3</h4>
              </div>
            </div>

            {/* Gallery Item 2 */}
            <div className="group relative aspect-[4/5] overflow-hidden border border-white/5 hover:border-[#D4A853]/50 transition-colors duration-500 md:translate-y-12">
              <div className="absolute inset-0 bg-gradient-to-br from-[#151515] to-[#0D0D0D] group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10" />
               <div className="absolute bottom-0 left-0 p-8 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <p className="text-[#D4A853] text-[10px] uppercase tracking-widest mb-2">Ceramic Coating</p>
                <h4 className="text-xl font-['Playfair_Display']">Mercedes G63 AMG</h4>
              </div>
            </div>

            {/* Gallery Item 3 */}
            <div className="group relative aspect-[4/5] overflow-hidden border border-white/5 hover:border-[#D4A853]/50 transition-colors duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F0F] to-[#050505] group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10" />
               <div className="absolute bottom-0 left-0 p-8 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <p className="text-[#D4A853] text-[10px] uppercase tracking-widest mb-2">Interior Restoration</p>
                <h4 className="text-xl font-['Playfair_Display']">Range Rover Autobiography</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 relative bg-[#0A0A0A] border-y border-white/5">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-5xl font-['Playfair_Display'] mb-20">Client Perspectives</h2>
          
          <div className="max-w-4xl mx-auto">
            <span className="text-6xl font-serif text-[#D4A853] opacity-50 block mb-6">"</span>
            <p className="text-2xl md:text-3xl font-light leading-relaxed mb-10 italic text-white/90">
              The level of detail is simply extraordinary. My black SUV looks better than the day it rolled off the showroom floor. The ceramic coating they applied makes maintenance incredibly easy. True professionals.
            </p>
            <div>
              <div className="flex justify-center gap-1 text-[#D4A853] mb-4">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <h4 className="font-bold text-sm uppercase tracking-[0.2em]">James R.</h4>
              <p className="text-[#D4A853] text-xs mt-1">Springfield, MO</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#A886CD]/5" />
        <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-['Playfair_Display'] mb-8">Ready for Perfection?</h2>
          <p className="text-white/60 font-light text-lg mb-12 max-w-2xl mx-auto">
            Schedule your personalized consultation and let us design a bespoke care regimen for your vehicle.
          </p>
          <a 
            href={CALENDLY_LINK} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-12 py-5 bg-[#D4A853] text-black text-sm uppercase tracking-[0.2em] font-bold hover:bg-white transition-colors duration-300"
          >
            Reserve Your Session
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#020202] pt-24 pb-12 border-t border-white/10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <img 
                  src="/__mockup/images/logo.png" 
                  alt="Apex Detailing" 
                  className="h-10 w-auto object-contain brightness-0 invert" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-xl font-['Playfair_Display'] tracking-widest font-bold uppercase text-[#D4A853]">Apex</span>
              </div>
              <p className="text-white/50 font-light text-sm max-w-md leading-relaxed mb-8">
                The premier mobile detailing service in the Ozarks, providing unmatched quality, convenience, and protection for luxury and everyday vehicles alike.
              </p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/apexdetailing_sf" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-[#D4A853] hover:border-[#D4A853] transition-all">
                  <Instagram size={18} />
                </a>
                <a href="https://www.facebook.com/apexdetailingsf" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-[#D4A853] hover:border-[#D4A853] transition-all">
                  <Facebook size={18} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-['Playfair_Display'] text-lg mb-6 tracking-wide">Contact</h4>
              <ul className="space-y-4">
                <li>
                  <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#D4A853] text-sm flex items-center gap-3 transition-colors">
                    <MapPin size={16} className="text-[#D4A853]" />
                    Mobile Service: Nixa ● Ozark ● Springfield
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/50 hover:text-[#D4A853] text-sm flex items-center gap-3 transition-colors">
                    <Phone size={16} className="text-[#D4A853]" />
                    (417) 555-0123
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/50 hover:text-[#D4A853] text-sm flex items-center gap-3 transition-colors">
                    <Mail size={16} className="text-[#D4A853]" />
                    info@apexdetailingsf.com
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-['Playfair_Display'] text-lg mb-6 tracking-wide">Links</h4>
              <ul className="space-y-3">
                <li><a href="#home" className="text-white/50 hover:text-[#D4A853] text-sm uppercase tracking-wider text-[10px] transition-colors">Home</a></li>
                <li><a href="#services" className="text-white/50 hover:text-[#D4A853] text-sm uppercase tracking-wider text-[10px] transition-colors">Services</a></li>
                <li><a href="#about" className="text-white/50 hover:text-[#D4A853] text-sm uppercase tracking-wider text-[10px] transition-colors">About</a></li>
                <li><a href="#gallery" className="text-white/50 hover:text-[#D4A853] text-sm uppercase tracking-wider text-[10px] transition-colors">Gallery</a></li>
                <li><a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer" className="text-[#D4A853] font-bold text-sm uppercase tracking-wider text-[10px] mt-2 inline-block">Book Now</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-xs">
              &copy; {new Date().getFullYear()} Apex Detailing. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-white/30">
              <a href="#" className="hover:text-white/70 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white/70 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PremiumLuxury;
