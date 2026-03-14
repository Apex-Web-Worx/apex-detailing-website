import React from 'react';
import {
  Car,
  Droplets,
  Shield,
  Sparkles,
  Sun,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  ChevronRight,
  Star,
  CheckCircle2,
  Clock,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SleekMinimal() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bookingUrl = "https://calendly.com/apexdetailingsf/detailing-appointment";

  const services = [
    {
      title: "Interior Detailing",
      icon: <Car className="w-6 h-6 stroke-[1.5]" />,
      desc: "Deep cleaning of all surfaces, upholstery extraction, and odor removal for a pristine cabin.",
      price: "From $150"
    },
    {
      title: "Exterior Detailing",
      icon: <Droplets className="w-6 h-6 stroke-[1.5]" />,
      desc: "Meticulous hand wash, clay bar treatment, and sealant application for a brilliant shine.",
      price: "From $120"
    },
    {
      title: "Ceramic Coating",
      icon: <Shield className="w-6 h-6 stroke-[1.5]" />,
      desc: "Years of durable protection against elements with unmatched gloss and hydrophobic properties.",
      price: "From $600"
    },
    {
      title: "Paint Correction",
      icon: <Sparkles className="w-6 h-6 stroke-[1.5]" />,
      desc: "Removal of swirls, scratches, and oxidation to restore your paint to a flawless, mirror-like finish.",
      price: "From $350"
    },
    {
      title: "Headlight Restoration",
      icon: <Sun className="w-6 h-6 stroke-[1.5]" />,
      desc: "Eliminate yellowing and oxidation to improve nighttime visibility and aesthetic appeal.",
      price: "From $80"
    }
  ];

  const testimonials = [
    {
      name: "Michael R.",
      location: "Springfield",
      text: "The ceramic coating completely transformed my Porsche. The attention to detail is truly unmatched in the area."
    },
    {
      name: "Sarah T.",
      location: "Nixa",
      text: "They managed to make a 5-year-old interior look brand new again. Incredibly professional and convenient mobile service."
    },
    {
      name: "David H.",
      location: "Ozark",
      text: "Best paint correction I've ever seen. The depth and clarity they brought back to my black paint is mind-blowing."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-['Mulish'] selection:bg-[#A886CD] selection:text-white overflow-hidden">
      
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <img src="/__mockup/images/logo.png" alt="Apex Detailing Logo" className="w-full h-full object-contain filter invert" onError={(e) => {
                // Fallback if logo doesn't exist
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }} />
              <div className="hidden absolute inset-0 flex items-center justify-center bg-white/10 rounded-full border border-white/20 text-xs font-bold tracking-tighter">AD</div>
            </div>
            <span className="text-xl md:text-2xl font-light tracking-[0.2em] uppercase">Apex</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-sm font-light tracking-widest text-white/70">
              {['Services', 'About', 'Gallery', 'Reviews'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors duration-300">
                  {item}
                </a>
              ))}
            </div>
            <div className="h-4 w-px bg-white/20"></div>
            <a 
              href={bookingUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-white text-black text-sm font-medium tracking-widest uppercase hover:bg-[#A886CD] hover:text-white transition-all duration-300"
            >
              Book Now
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-black/95 backdrop-blur-lg z-40 transition-opacity duration-300 flex flex-col items-center justify-center gap-8 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {['Services', 'About', 'Gallery', 'Reviews'].map((item) => (
          <a 
            key={item} 
            href={`#${item.toLowerCase()}`} 
            className="text-2xl font-light tracking-[0.2em] uppercase text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            {item}
          </a>
        ))}
        <a 
          href={bookingUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-8 px-8 py-3 border border-white text-white text-sm font-medium tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300"
          onClick={() => setMobileMenuOpen(false)}
        >
          Book Appointment
        </a>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#A886CD]/10 rounded-full blur-[120px] mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#3496FF]/10 rounded-full blur-[100px] mix-blend-screen opacity-40"></div>
        
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center mt-12">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-[#A886CD] animate-pulse"></span>
            <span className="text-xs font-medium tracking-[0.15em] text-white/80 uppercase">Premium Vehicle Detailing in Nixa <span className="location-separator">●</span> Ozark <span className="location-separator">●</span> Springfield</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[1.1] mb-6 max-w-5xl">
            Perfection is in <br/>
            <span className="font-normal bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-[#A886CD]">the details.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 font-light max-w-2xl mb-12 leading-relaxed">
            Elevating automotive care in Nixa <span className="location-separator">●</span> Ozark <span className="location-separator">●</span> Springfield. Experience meticulous craftsmanship and uncompromising quality.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <a 
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-4 bg-white text-black overflow-hidden flex items-center gap-3"
            >
              <span className="relative z-10 text-sm font-semibold tracking-[0.2em] uppercase">Secure Your Spot</span>
              <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#A886CD] to-[#3496FF] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-white group-hover:opacity-0 transition-opacity duration-500"></div>
            </a>
            
            <a 
              href="#services"
              className="px-8 py-4 text-sm font-medium tracking-[0.2em] uppercase text-white/70 hover:text-white transition-colors"
            >
              Explore Services
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <div className="text-[10px] uppercase tracking-[0.3em] font-light">Scroll</div>
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 relative">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">Our Services</h2>
              <p className="text-white/60 font-light text-lg leading-relaxed">
                Comprehensive detailing solutions tailored to protect your investment and restore its showroom brilliance.
              </p>
            </div>
            <a href={bookingUrl} className="text-sm font-light tracking-[0.2em] uppercase text-[#3496FF] hover:text-white transition-colors flex items-center gap-2">
              View Full Pricing <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div 
                key={index}
                className="group relative p-8 border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-500 flex flex-col h-full"
              >
                <div className="mb-6 p-4 rounded-2xl bg-white/5 inline-flex w-fit text-[#A886CD] group-hover:text-[#3496FF] transition-colors duration-500">
                  {service.icon}
                </div>
                <h3 className="text-xl font-normal tracking-wide mb-3">{service.title}</h3>
                <p className="text-white/50 font-light text-sm leading-relaxed mb-8 flex-grow">
                  {service.desc}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <span className="text-sm font-light text-white/70">{service.price}</span>
                  <a href={bookingUrl} className="text-xs font-medium tracking-[0.1em] uppercase text-white opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1">
                    Book <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
            
            {/* Custom package card to fill grid */}
            <div className="group relative p-8 border border-[#A886CD]/30 bg-gradient-to-br from-[#A886CD]/10 to-transparent flex flex-col h-full justify-center items-center text-center">
              <h3 className="text-xl font-normal tracking-wide mb-3">Custom Package</h3>
              <p className="text-white/60 font-light text-sm leading-relaxed mb-6">
                Need something specific? Let's build a customized detailing plan for your vehicle.
              </p>
              <a 
                href={bookingUrl}
                className="px-6 py-2 border border-white/20 text-xs font-medium tracking-[0.15em] uppercase hover:bg-white hover:text-black transition-all duration-300"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-8 leading-tight">
                Not just clean.<br/>
                <span className="text-[#A886CD]">Flawless.</span>
              </h2>
              <div className="space-y-6 text-white/60 font-light text-lg leading-relaxed">
                <p>
                  Apex Detailing was founded on a simple principle: treating every vehicle as a masterpiece. We don't just wash cars; we perform automotive restoration.
                </p>
                <p>
                  Serving the Nixa <span className="location-separator">●</span> Ozark <span className="location-separator">●</span> Springfield areas, we bring premium detailing services directly to you. Whether it's removing years of swirl marks or applying a 5-year ceramic coating, our methodical approach ensures perfection.
                </p>
              </div>
              
              <div className="mt-12 space-y-4">
                {[
                  "Licensed, insured, and certified professionals",
                  "Premium chemicals and specialized equipment",
                  "Convenient mobile service available",
                  "Satisfaction guarantee on all work"
                ].map((point, i) => (
                  <div key={i} className="flex items-center gap-4 text-sm font-light">
                    <CheckCircle2 className="w-5 h-5 text-[#3496FF] shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/5] md:aspect-square rounded-sm overflow-hidden bg-gradient-to-tr from-[#A886CD]/20 to-[#3496FF]/20 border border-white/10 relative">
                {/* Abstract visualization replacing actual image */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                   <Shield className="w-16 h-16 text-white/20 mb-6" />
                   <div className="text-2xl font-light tracking-widest uppercase mb-2">Precision</div>
                   <div className="text-white/40 font-light text-sm">Automotive Aesthetics</div>
                </div>
              </div>
              
              {/* Experience badge */}
              <div className="absolute -bottom-8 -left-8 bg-black border border-white/10 p-6 backdrop-blur-md">
                <div className="text-4xl font-light mb-1">100+</div>
                <div className="text-xs tracking-[0.2em] uppercase text-white/50">Vehicles Perfected</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-32">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">Recent Work</h2>
            <p className="text-white/60 font-light text-lg">
              A glimpse into our pursuit of perfection.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Gallery Item 1 */}
            <div className="group relative aspect-square overflow-hidden bg-zinc-900 border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 transition-transform duration-700 group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="text-xs font-bold tracking-[0.2em] uppercase text-[#A886CD] mb-2">Ceramic Coating</div>
                  <div className="text-lg font-light">Porsche 911 GT3</div>
                </div>
              </div>
            </div>
            
            {/* Gallery Item 2 */}
            <div className="group relative aspect-square md:col-span-2 lg:col-span-1 overflow-hidden bg-zinc-900 border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 to-zinc-800 transition-transform duration-700 group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="text-xs font-bold tracking-[0.2em] uppercase text-[#3496FF] mb-2">Paint Correction</div>
                  <div className="text-lg font-light">BMW M4 Competition</div>
                </div>
              </div>
            </div>
            
            {/* Gallery Item 3 */}
            <div className="group relative aspect-square lg:row-span-2 overflow-hidden bg-zinc-900 border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-950 transition-transform duration-700 group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="text-xs font-bold tracking-[0.2em] uppercase text-[#A886CD] mb-2">Full Detail</div>
                  <div className="text-lg font-light">Mercedes G-Wagon</div>
                </div>
              </div>
            </div>

            {/* Gallery Item 4 */}
            <div className="group relative aspect-square md:col-span-2 overflow-hidden bg-zinc-900 border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 transition-transform duration-700 group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="text-xs font-bold tracking-[0.2em] uppercase text-white mb-2">Interior Restoration</div>
                  <div className="text-lg font-light">Range Rover Autobiography</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <a href="https://www.instagram.com/apexdetailing_sf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-light tracking-[0.1em] text-white/60 hover:text-white transition-colors">
              <Instagram className="w-4 h-4" /> Follow our work on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-32 bg-white/[0.02] border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row gap-12 justify-between items-start mb-16">
            <h2 className="text-3xl md:text-5xl font-light tracking-tight max-w-md leading-tight">
              Client <br/>Experiences
            </h2>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="w-6 h-6 fill-[#A886CD] text-[#A886CD]" />
              ))}
              <span className="ml-4 font-light text-white/60">5.0 Average Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((review, i) => (
              <div key={i} className="p-8 border border-white/10 bg-black">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className="w-4 h-4 fill-white text-white" />
                  ))}
                </div>
                <p className="text-white/80 font-light leading-relaxed mb-8 text-sm">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{review.name}</div>
                    <div className="text-xs text-white/40 tracking-wider uppercase">{review.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 border-y border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#A886CD]/5 to-[#3496FF]/5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-light mb-8">Ready for perfection?</h2>
          <p className="text-white/60 font-light text-lg mb-12 max-w-2xl mx-auto">
            Book your appointment today and experience the Apex difference. Availability is limited.
          </p>
          <a 
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-5 bg-white text-black font-medium tracking-[0.2em] uppercase hover:bg-transparent hover:text-white border border-transparent hover:border-white transition-all duration-300"
          >
            Schedule Service
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-10 bg-black">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-8 h-8">
                  <img src="/__mockup/images/logo.png" alt="Apex Detailing Logo" className="w-full h-full object-contain filter invert" onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }} />
                </div>
                <span className="text-xl font-light tracking-[0.2em] uppercase">Apex</span>
              </div>
              <p className="text-white/50 text-sm font-light leading-relaxed mb-8 max-w-xs">
                Premium automotive detailing services for those who demand excellence in the Nixa <span className="location-separator">●</span> Ozark <span className="location-separator">●</span> Springfield areas.
              </p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/apexdetailing_sf" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://www.facebook.com/apexdetailingsf" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-white mb-6">Services</h4>
              <ul className="space-y-4 text-sm font-light text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Interior Detailing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Exterior Detailing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ceramic Coating</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Paint Correction</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Headlight Restoration</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-white mb-6">Service Areas</h4>
              <ul className="space-y-4 text-sm font-light text-white/60">
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Springfield, MO</li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Nixa, MO</li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Ozark, MO</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-white mb-6">Contact</h4>
              <ul className="space-y-4 text-sm font-light text-white/60">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:contact@apexdetailing.com" className="hover:text-white transition-colors">
                    contact@apexdetailing.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Mon-Sat: 8am - 6pm</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-light text-white/40 tracking-wider">
            <p>&copy; {new Date().getFullYear()} Apex Detailing. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
