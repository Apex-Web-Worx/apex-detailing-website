import React, { useState, useEffect } from 'react';
import { Menu, X, Car, Sparkles, Droplets, Shield, Sun, ChevronRight, Star, MapPin, Phone, Mail, Instagram, Facebook, Calendar } from 'lucide-react';

export function DarkNeon() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const neonCyan = "#00F0FF";
  const neonPurple = "#BF00FF";
  
  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  const services = [
    { icon: <Sparkles className="w-8 h-8 text-[#00F0FF]" />, name: 'Interior Detailing', desc: 'Deep cleaning, stain removal, and interior revitalization.' },
    { icon: <Droplets className="w-8 h-8 text-[#00F0FF]" />, name: 'Exterior Detailing', desc: 'Precision hand wash, decontamination, and shine enhancement.' },
    { icon: <Shield className="w-8 h-8 text-[#BF00FF]" />, name: 'Ceramic Coating', desc: 'Long-lasting nano-protection for your vehicles paint.' },
    { icon: <Car className="w-8 h-8 text-[#BF00FF]" />, name: 'Paint Correction', desc: 'Swirl and scratch removal restoring showroom perfection.' },
    { icon: <Sun className="w-8 h-8 text-[#3496FF]" />, name: 'Headlight Restoration', desc: 'Clear hazy headlights for better visibility and aesthetics.' }
  ];

  return (
    <div className="min-h-screen bg-[#030308] text-white font-['Mulish'] selection:bg-[#BF00FF] selection:text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.8)_1px,transparent_1px)] bg-[length:32px_32px]"></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,240,255,0.2)_50%)] bg-[length:100%_4px]"></div>
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 border-b border-transparent ${isScrolled ? 'bg-[#030308]/90 backdrop-blur-md border-[#00F0FF]/30 [box-shadow:0_0_20px_rgba(0,240,255,0.1)] py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <a href="#home" className="relative z-10 flex items-center gap-3 group">
            <img src="/__mockup/images/logo.png" alt="Apex Detailing Logo" className="h-10 w-auto filter drop-shadow-[0_0_8px_rgba(168,134,205,0.8)]" />
            <span className="font-bold text-xl tracking-widest text-white group-hover:text-[#00F0FF] transition-colors duration-300 [text-shadow:0_0_5px_rgba(0,240,255,0)] group-hover:[text-shadow:0_0_10px_rgba(0,240,255,0.8)]">
              APEX<span className="text-[#A886CD]">DETAILING</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 z-10">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-sm uppercase tracking-[0.2em] text-gray-300 hover:text-[#00F0FF] transition-all duration-300 relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#00F0FF] transition-all duration-300 group-hover:w-full [box-shadow:0_0_10px_#00F0FF]"></span>
              </a>
            ))}
            <a 
              href="https://calendly.com/apexdetailingsf/detailing-appointment" 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-2.5 bg-transparent border border-[#00F0FF] text-[#00F0FF] uppercase tracking-wider text-sm font-bold relative overflow-hidden group hover:text-[#030308] transition-colors duration-300 [box-shadow:0_0_15px_rgba(0,240,255,0.3)_inset]"
            >
              <span className="absolute inset-0 bg-[#00F0FF] w-0 transition-all duration-300 ease-out group-hover:w-full"></span>
              <span className="relative z-10 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Book Now
              </span>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-[#00F0FF] z-10 relative"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8 [filter:drop-shadow(0_0_5px_#00F0FF)]" />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className={`fixed inset-0 bg-[#030308]/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center transition-transform duration-500 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col space-y-8 items-center text-center">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl uppercase tracking-[0.3em] text-white hover:text-[#00F0FF] transition-all duration-300 [text-shadow:0_0_15px_rgba(0,240,255,0)] hover:[text-shadow:0_0_15px_rgba(0,240,255,0.8)]"
            >
              {link.name}
            </a>
          ))}
          <a 
            href="https://calendly.com/apexdetailingsf/detailing-appointment" 
            target="_blank" 
            rel="noreferrer"
            className="mt-8 px-8 py-4 bg-[#00F0FF] text-[#030308] uppercase tracking-[0.2em] font-bold [box-shadow:0_0_30px_rgba(0,240,255,0.6)]"
          >
            Book Appointment
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 flex items-center justify-center min-h-[90vh] z-10">
        <div className="absolute inset-0 overflow-hidden">
          {/* Neon Orbs */}
          <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-[#A886CD]/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[25vw] h-[25vw] bg-[#00F0FF]/10 rounded-full blur-[100px] mix-blend-screen" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <div className="inline-block mb-6 px-4 py-1.5 border border-[#BF00FF]/50 bg-[#BF00FF]/10 backdrop-blur-sm rounded-full">
            <span className="uppercase tracking-[0.2em] text-xs font-bold text-[#BF00FF] [text-shadow:0_0_8px_rgba(191,0,255,0.8)]">
              Premium Vehicle Detailing in Springfield / Nixa / Ozark
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight uppercase tracking-tight">
            <span className="block text-white">Elevate Your</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#3496FF] to-[#A886CD] [text-shadow:0_0_30px_rgba(0,240,255,0.4)]">
              Vehicle's Aura
            </span>
          </h1>
          
          <p className="max-w-2xl text-gray-400 text-lg md:text-xl mb-12 leading-relaxed font-light">
            Next-generation detailing technology meets uncompromising craftsmanship. We provide premium automotive care for those who demand absolute perfection.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <a 
              href="https://calendly.com/apexdetailingsf/detailing-appointment" 
              target="_blank" 
              rel="noreferrer"
              className="px-8 py-4 bg-transparent border-2 border-[#00F0FF] text-[#00F0FF] uppercase tracking-widest font-bold hover:bg-[#00F0FF] hover:text-[#030308] transition-all duration-300 [box-shadow:0_0_20px_rgba(0,240,255,0.4),inset_0_0_10px_rgba(0,240,255,0.2)] hover:[box-shadow:0_0_30px_rgba(0,240,255,0.8)] flex items-center justify-center gap-3"
            >
              Initialize Booking <ChevronRight className="w-5 h-5" />
            </a>
            <a 
              href="#services" 
              className="px-8 py-4 border-2 border-white/10 text-white uppercase tracking-widest font-bold hover:border-white/30 hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-3"
            >
              View Protocols
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 relative z-10 border-t border-white/5 bg-[#030308]/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wider mb-4 text-white [text-shadow:0_0_15px_rgba(255,255,255,0.3)]">
              Service <span className="text-[#00F0FF]">Protocols</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#00F0FF] to-[#BF00FF] mx-auto [box-shadow:0_0_10px_rgba(191,0,255,0.5)]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="group relative p-8 bg-[#0a0a12] border border-white/10 hover:border-[#00F0FF]/50 transition-all duration-500 overflow-hidden"
              >
                {/* Hover Glow Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Top Border Highlight */}
                <div className="absolute top-0 left-0 w-0 h-[2px] bg-[#00F0FF] transition-all duration-500 group-hover:w-full [box-shadow:0_0_10px_#00F0FF]"></div>
                
                <div className="relative z-10">
                  <div className="mb-6 p-4 inline-block bg-[#030308] border border-white/10 rounded-lg group-hover:border-[#00F0FF]/30 group-hover:[box-shadow:0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-wider mb-3 text-white group-hover:text-[#00F0FF] transition-colors duration-300">
                    {service.name}
                  </h3>
                  <p className="text-gray-400 font-light leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative z-10 overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-[80%] bg-[#BF00FF]/5 blur-[150px] rounded-full pointer-events-none"></div>
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 relative">
              <div className="aspect-square relative group">
                {/* Glitch Frame */}
                <div className="absolute inset-0 border-2 border-[#A886CD]/30 translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500 z-0"></div>
                <div className="absolute inset-0 border-2 border-[#00F0FF]/30 -translate-x-4 -translate-y-4 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-500 z-0"></div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black z-10 border border-white/10 overflow-hidden">
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(168,134,205,0.5)_1px,transparent_1px)] bg-[length:16px_16px]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img src="/__mockup/images/logo.png" alt="Apex Logo" className="w-1/2 opacity-50 grayscale contrast-200" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wider mb-8">
                The <span className="text-[#BF00FF] [text-shadow:0_0_15px_rgba(191,0,255,0.5)]">Apex</span> Standard
              </h2>
              <div className="space-y-6 text-gray-400 font-light text-lg">
                <p>
                  Apex Detailing operates at the intersection of technology and artistry. We don't just clean vehicles; we engineer perfection. Serving Springfield / Nixa / Ozark with uncompromising quality.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                  <div className="border-l-2 border-[#00F0FF] pl-4">
                    <h4 className="text-white uppercase tracking-wider font-bold mb-2 text-sm">Mobile Arsenal</h4>
                    <p className="text-sm">Fully equipped mobile units bringing the shop experience directly to your location.</p>
                  </div>
                  <div className="border-l-2 border-[#BF00FF] pl-4">
                    <h4 className="text-white uppercase tracking-wider font-bold mb-2 text-sm">Advanced Compounds</h4>
                    <p className="text-sm">Utilizing industry-leading ceramic coatings and correction polymers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 relative z-10 bg-[#020205]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wider mb-4">
                Visual <span className="text-[#3496FF] [text-shadow:0_0_15px_rgba(52,150,255,0.5)]">Telemetry</span>
              </h2>
              <div className="w-24 h-1 bg-[#3496FF] [box-shadow:0_0_10px_rgba(52,150,255,0.5)]"></div>
            </div>
            <a href="https://www.instagram.com/apexdetailing_sf" target="_blank" rel="noreferrer" className="hidden md:flex items-center gap-2 text-[#00F0FF] hover:text-white transition-colors uppercase tracking-widest text-sm font-bold mt-6 md:mt-0">
              <Instagram className="w-5 h-5" /> Access Main Feed
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="aspect-[4/5] relative group overflow-hidden bg-[#0a0a12] border border-white/5">
                <div className={`absolute inset-0 bg-gradient-to-br ${item % 2 === 0 ? 'from-[#00F0FF]/20 to-[#A886CD]/10' : 'from-[#BF00FF]/20 to-[#3496FF]/10'} opacity-50`}></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>
                
                {/* Hover Borders */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#00F0FF]/50 transition-colors duration-300 z-20 pointer-events-none"></div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="px-4 py-2 bg-[#00F0FF]/20 border border-[#00F0FF] text-[#00F0FF] uppercase tracking-widest text-xs font-bold">
                    View Data
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <a href="https://www.instagram.com/apexdetailing_sf" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#00F0FF] uppercase tracking-widest text-sm font-bold border border-[#00F0FF]/30 px-6 py-3 rounded-full bg-[#00F0FF]/5">
              <Instagram className="w-5 h-5" /> Access Main Feed
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative z-10 border-y border-white/5 bg-[#030308]/80 backdrop-blur-md">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "J. Matrix", text: "The ceramic coating process was flawless. My vehicle looks better than the day it left the assembly line." },
              { name: "S. Connor", text: "Precision interior detailing. They eliminated every imperfection. Highly recommended protocol." },
              { name: "T. Anderson", text: "Paint correction was absolute perfection. The attention to detail is unmatched in the Ozarks region." }
            ].map((testimonial, i) => (
              <div key={i} className="p-8 border border-white/10 bg-[#0a0a12] relative group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#BF00FF]/20 to-transparent"></div>
                <Star className="w-6 h-6 text-[#00F0FF] mb-6 [filter:drop-shadow(0_0_5px_#00F0FF)]" />
                <p className="text-gray-300 font-light italic mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-[#A886CD]"></div>
                  <h4 className="text-white uppercase tracking-wider text-sm font-bold">{testimonial.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Footer */}
      <footer id="contact" className="pt-24 pb-8 relative z-10 bg-black">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00F0FF]/50 to-transparent"></div>
        
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-2">
              <a href="#home" className="inline-flex items-center gap-3 mb-6">
                <img src="/__mockup/images/logo.png" alt="Apex Detailing Logo" className="h-8 w-auto filter drop-shadow-[0_0_8px_rgba(168,134,205,0.8)]" />
                <span className="font-bold text-xl tracking-widest text-white [text-shadow:0_0_10px_rgba(0,240,255,0.3)]">
                  APEX<span className="text-[#A886CD]">DETAILING</span>
                </span>
              </a>
              <p className="text-gray-400 font-light max-w-sm mb-8">
                Prestige vehicle detailing services for those who demand absolute perfection in Springfield / Nixa / Ozark.
              </p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/apexdetailing_sf" target="_blank" rel="noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center text-gray-400 hover:text-[#00F0FF] hover:border-[#00F0FF] hover:[box-shadow:0_0_10px_rgba(0,240,255,0.3)] transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.facebook.com/apexdetailingsf" target="_blank" rel="noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center text-gray-400 hover:text-[#3496FF] hover:border-[#3496FF] hover:[box-shadow:0_0_10px_rgba(52,150,255,0.3)] transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white uppercase tracking-widest font-bold mb-6 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#BF00FF]" /> Coverage Area
              </h4>
              <ul className="space-y-3 text-gray-400 font-light">
                <li className="hover:text-white transition-colors cursor-default">Springfield, MO</li>
                <li className="hover:text-white transition-colors cursor-default">Nixa, MO</li>
                <li className="hover:text-white transition-colors cursor-default">Ozark, MO</li>
                <li className="text-sm mt-4 text-[#A886CD]">Mobile Service Available</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white uppercase tracking-widest font-bold mb-6 text-sm">Comms Channel</h4>
              <ul className="space-y-4">
                <li>
                  <a href="https://calendly.com/apexdetailingsf/detailing-appointment" target="_blank" rel="noreferrer" className="text-[#00F0FF] hover:text-white transition-colors font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Book Appointment
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider">
              &copy; {new Date().getFullYear()} Apex Detailing. All rights reserved.
            </p>
            <div className="flex gap-6 text-gray-500 text-xs uppercase tracking-wider">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DarkNeon;
