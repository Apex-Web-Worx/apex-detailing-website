import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronRight,
  Star,
  Shield,
  Car,
  Sparkles,
  Droplets,
  Instagram,
  Facebook,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Award,
} from "lucide-react";

const CALENDLY_LINK = "https://calendly.com/apexdetailingsf/detailing-appointment";
const INSTAGRAM_LINK = "https://www.instagram.com/apexdetailing_sf";
const FACEBOOK_LINK = "https://www.facebook.com/apexdetailingsf";

const services = [
  {
    id: "ceramic-coating",
    title: "Ceramic Coating",
    description:
      "Ultimate protection and extreme gloss for your vehicle's paint. Lasts for years, making maintenance washes a breeze.",
    icon: <Shield className="w-10 h-10 text-[#3496FF]" />,
    features: ["Up to 5 Years Protection", "Extreme Hydrophobics", "Scratch Resistance"],
  },
  {
    id: "paint-correction",
    title: "Paint Correction",
    description:
      "Remove swirl marks, light scratches, and oxidation to restore your paint to a flawless, mirror-like finish.",
    icon: <Sparkles className="w-10 h-10 text-[#A886CD]" />,
    features: ["Swirl Mark Removal", "Deep Gloss Restoration", "Enhances Resale Value"],
  },
  {
    id: "exterior-detailing",
    title: "Exterior Detailing",
    description:
      "Thorough hand wash, decontamination, and protection to make your car turn heads everywhere you go.",
    icon: <Car className="w-10 h-10 text-[#3496FF]" />,
    features: ["Foam Cannon Wash", "Iron Decontamination", "Spray Wax Finish"],
  },
  {
    id: "interior-detailing",
    title: "Interior Detailing",
    description:
      "Deep cleaning of all interior surfaces. We extract carpets, condition leather, and leave it looking factory fresh.",
    icon: <Droplets className="w-10 h-10 text-[#A886CD]" />,
    features: ["Carpet Extraction", "Leather Conditioning", "Odor Neutralization"],
  },
  {
    id: "headlight-restoration",
    title: "Headlight Restoration",
    description:
      "Fix foggy, yellowed headlights to improve nighttime visibility and dramatically improve your car's appearance.",
    icon: <CheckCircle2 className="w-10 h-10 text-[#3496FF]" />,
    features: ["Improves Safety", "Removes Oxidation", "UV Protection Applied"],
  },
];

const gallery = [
  { id: 1, title: "Paint Correction", beforeAfter: true, color: "from-blue-900 to-[#3496FF]" },
  { id: 2, title: "Ceramic Coating", beforeAfter: false, color: "from-[#A886CD] to-purple-900" },
  { id: 3, title: "Interior Restoration", beforeAfter: true, color: "from-blue-900 to-indigo-900" },
  { id: 4, title: "Exterior Detail", beforeAfter: false, color: "from-purple-900 to-black" },
];

const testimonials = [
  {
    name: "Michael T.",
    location: "Springfield, MO",
    text: "Apex Detailing completely transformed my 5-year-old truck. The paint correction and ceramic coating makes it look better than the day I bought it off the lot. Incredible attention to detail.",
  },
  {
    name: "Sarah W.",
    location: "Nixa, MO",
    text: "The interior detail was mind-blowing. With two kids, my SUV was a disaster zone. They got out stains I thought were permanent and it smells brand new again.",
  },
  {
    name: "David R.",
    location: "Ozark, MO",
    text: "Professional, punctual, and passionate about their work. The convenience of them coming to me is great, but the quality of the finish is what will keep me coming back.",
  },
];

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-['Mulish'] overflow-x-hidden selection:bg-[#A886CD] selection:text-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-[0_0_20px_rgba(52,150,255,0.1)]"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <img
                src={`${import.meta.env.BASE_URL}images/logo.png`}
                alt="Apex Detailing Logo"
                className="h-10 w-auto object-contain"
              />
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {["Home", "Services", "About", "Gallery", "Testimonials"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="text-gray-300 hover:text-white font-semibold text-sm tracking-wider uppercase transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#A886CD] to-[#3496FF] transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
              <a
                href={CALENDLY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-bold text-white rounded-md group"
              >
                <span className="absolute w-full h-full bg-gradient-to-br from-[#A886CD] via-[#3496FF] to-[#A886CD] group-hover:from-[#3496FF] group-hover:via-[#A886CD] group-hover:to-[#3496FF] transition-all duration-500 bg-[length:200%_200%] bg-[0%_0%] group-hover:bg-[100%_100%]" />
                <span className="absolute inset-1 bg-[#0a0a0a] rounded-[4px] transition-all duration-300 group-hover:bg-opacity-0" />
                <span className="relative flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                  BOOK NOW <ChevronRight className="w-4 h-4" />
                </span>
              </a>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2 focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`md:hidden absolute top-full left-0 w-full bg-[#0a0a0a] border-b border-white/10 transition-all duration-300 ease-in-out overflow-hidden ${
            mobileMenuOpen ? "max-h-[400px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"
          }`}
        >
          <div className="flex flex-col space-y-4 px-6">
            {["Home", "Services", "About", "Gallery", "Testimonials"].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-left text-gray-300 hover:text-white font-semibold text-lg tracking-wider uppercase"
              >
                {item}
              </button>
            ))}
            <a
              href={CALENDLY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-center py-3 bg-gradient-to-r from-[#A886CD] to-[#3496FF] font-bold rounded-md shadow-[0_0_15px_rgba(52,150,255,0.4)]"
            >
              BOOK NOW
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-[#A886CD] rounded-full mix-blend-screen filter blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-[#3496FF] rounded-full mix-blend-screen filter blur-[100px] animate-[pulse_8s_ease-in-out_infinite_1s]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-[#3496FF] animate-pulse" />
            <span className="text-sm font-bold tracking-widest text-gray-300 uppercase">
              Prestige Vehicle Detailing in Nixa/Ozarks
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6 drop-shadow-2xl uppercase">
            Unleash Your <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] via-white to-[#3496FF]">
              Car's True Potential
            </span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-10 font-medium">
            Premium mobile auto detailing, ceramic coating, and paint correction services serving
            Springfield, Nixa, and Ozark. We bring the showroom shine to your driveway.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <a
              href={CALENDLY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center px-8 py-4 font-black text-white transition-all duration-300 ease-in-out bg-transparent border-0 rounded-lg cursor-pointer overflow-hidden text-lg"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#A886CD] to-[#3496FF] opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute inset-0 w-full h-full rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_30px_rgba(52,150,255,0.6)]" />
              <span className="relative flex items-center gap-2">
                BOOK YOUR DETAIL{" "}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
            <button
              onClick={() => scrollToSection("services")}
              className="inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 ease-in-out bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 backdrop-blur-sm text-lg"
            >
              EXPLORE SERVICES
            </button>
          </div>

          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60 hover:opacity-100 transition-all duration-500">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-[#A886CD]" />
              <span className="font-bold">Certified Installers</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-[#3496FF]" fill="currentColor" />
              <span className="font-bold">5-Star Rated</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[#A886CD]" />
              <span className="font-bold">Mobile Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 relative z-10 border-t border-white/5 bg-[#0d0d0d]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-[#3496FF] uppercase mb-3">
              What We Do
            </h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
              Elite{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] to-[#3496FF]">
                Services
              </span>
            </h3>
            <p className="text-gray-400 text-lg">
              We offer comprehensive detailing solutions tailored to protect your investment and keep
              your vehicle looking immaculate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`group relative p-[1px] rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                  index === services.length - 1 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <span className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 group-hover:from-[#A886CD] group-hover:to-[#3496FF] transition-all duration-500 opacity-50 group-hover:opacity-100" />
                <div className="relative h-full bg-[#111] p-8 rounded-2xl flex flex-col z-10 transition-all duration-500">
                  <div className="mb-6 p-4 rounded-xl bg-white/5 inline-flex w-fit group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                    {service.icon}
                  </div>
                  <h4 className="text-2xl font-black mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#A886CD] group-hover:to-[#3496FF] transition-all duration-300">
                    {service.title}
                  </h4>
                  <p className="text-gray-400 mb-6 flex-grow">{service.description}</p>
                  <ul className="space-y-2 mb-8">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#3496FF]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={CALENDLY_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-2 font-bold text-sm tracking-widest text-white uppercase group/btn"
                  >
                    Book Now{" "}
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:text-[#3496FF] transition-all" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#A886CD]/10 rounded-full mix-blend-screen filter blur-[120px] -translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#A886CD] to-[#3496FF] opacity-20 group-hover:opacity-40 transition-opacity duration-700 z-10" />
                <div
                  className="absolute inset-0 bg-cover bg-center mix-blend-luminosity scale-100 group-hover:scale-105 transition-transform duration-1000"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80')",
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent z-20">
                  <div className="inline-flex items-center gap-3 bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center overflow-hidden"
                        >
                          <Star className="w-5 h-5 text-[#3496FF]" fill="currentColor" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="font-black text-white text-lg leading-tight">100+</p>
                      <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                        5-Star Reviews
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-[#A886CD] to-[#3496FF] rounded-2xl -z-10 blur-xl opacity-50" />
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-sm font-bold tracking-widest text-[#A886CD] uppercase mb-3">
                The Apex Standard
              </h2>
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8 leading-tight">
                Not Just a Wash. <br />
                An{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] to-[#3496FF]">
                  Obsession.
                </span>
              </h3>

              <div className="space-y-6 text-gray-400 text-lg mb-10">
                <p>
                  Apex Detailing was founded on a simple principle: providing unmatched quality and
                  convenience to car owners in the Ozarks. We don't cut corners, we polish them.
                </p>
                <p>
                  As a mobile detailing service, we bring our fully-equipped setup directly to your
                  home or office in Springfield, Nixa, and Ozark. You get your time back while we
                  restore your vehicle to pristine condition.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    title: "Mobile Service",
                    desc: "We come to you, fully equipped",
                    icon: <MapPin className="text-[#3496FF]" />,
                  },
                  {
                    title: "Premium Products",
                    desc: "Professional-grade chemicals only",
                    icon: <Shield className="text-[#A886CD]" />,
                  },
                  {
                    title: "Insured & Certified",
                    desc: "Peace of mind for your investment",
                    icon: <Award className="text-[#3496FF]" />,
                  },
                  {
                    title: "Flexible Scheduling",
                    desc: "Book easily online anytime",
                    icon: <Clock className="text-[#A886CD]" />,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <h5 className="font-bold text-white mb-1">{item.title}</h5>
                      <p className="text-sm text-gray-400 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 relative bg-[#0d0d0d] border-y border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold tracking-widest text-[#3496FF] uppercase mb-3">
                Our Work
              </h2>
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                Results That{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] to-[#3496FF]">
                  Speak
                </span>
              </h3>
            </div>
            <a
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-bold text-sm tracking-widest hover:text-[#A886CD] transition-colors uppercase"
            >
              View More on Instagram <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-80 group-hover:scale-105 transition-transform duration-700`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {item.beforeAfter && (
                    <span className="inline-block px-3 py-1 bg-[#3496FF] text-black font-black text-xs uppercase tracking-widest rounded mb-3">
                      Before & After
                    </span>
                  )}
                  <h4 className="text-2xl font-black text-white">{item.title}</h4>
                  <div className="w-12 h-1 bg-gradient-to-r from-[#A886CD] to-[#3496FF] mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-[#3496FF]/10 rounded-full mix-blend-screen filter blur-[150px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-[#A886CD] uppercase mb-3">
              Testimonials
            </h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              Client{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] to-[#3496FF]">
                Reactions
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-colors"
              >
                <Star className="absolute top-8 right-8 w-12 h-12 text-white/5" />
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-[#3496FF]" fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-300 italic mb-8 relative z-10">"{testimonial.text}"</p>
                <div>
                  <h5 className="font-bold text-white text-lg">{testimonial.name}</h5>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-[#111] border border-white/10 p-10 md:p-20 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-gradient-to-b from-[#A886CD]/20 to-[#3496FF]/20 blur-3xl" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6">
                Ready to Experience <br />
                The Apex Difference?
              </h2>
              <p className="text-xl text-gray-400 mb-10 font-medium">
                Book your appointment today. Our mobile unit will come to your location in
                Springfield, Nixa, or Ozark.
              </p>
              <a
                href={CALENDLY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center px-10 py-5 font-black text-white text-xl transition-all duration-300 ease-in-out bg-gradient-to-r from-[#A886CD] to-[#3496FF] rounded-xl overflow-hidden shadow-[0_0_40px_rgba(168,134,205,0.4)] hover:shadow-[0_0_60px_rgba(52,150,255,0.6)] hover:scale-105"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#3496FF] to-[#A886CD] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative flex items-center gap-3">
                  BOOK APPOINTMENT NOW <ChevronRight className="w-6 h-6" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#050505] border-t border-white/5 pt-20 pb-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-6">
                <img
                  src={`${import.meta.env.BASE_URL}images/logo.png`}
                  alt="Apex Detailing Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <p className="text-gray-400 mb-6 font-medium">
                Prestige vehicle detailing and ceramic coating services. Mobile perfection delivered
                to your doorstep.
              </p>
              <div className="flex gap-4">
                <a
                  href={INSTAGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#A886CD] hover:to-[#3496FF] transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href={FACEBOOK_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#3496FF] transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-black text-lg uppercase tracking-wider mb-6">Quick Links</h4>
              <ul className="space-y-3 font-medium text-gray-400">
                {["Home", "Services", "About", "Gallery", "Testimonials"].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollToSection(item.toLowerCase())}
                      className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3 text-[#3496FF]" /> {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black text-lg uppercase tracking-wider mb-6">Services</h4>
              <ul className="space-y-3 font-medium text-gray-400">
                {services.map((service) => (
                  <li
                    key={service.id}
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <ChevronRight className="w-3 h-3 text-[#A886CD]" /> {service.title}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black text-lg uppercase tracking-wider mb-6">Contact</h4>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#3496FF] shrink-0 mt-0.5" />
                  <span>Serving Springfield, Nixa, and Ozark, Missouri (Mobile Service)</span>
                </li>
                <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                  <Phone className="w-5 h-5 text-[#A886CD]" />
                  <span>Contact us via social media</span>
                </li>
                <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                  <Mail className="w-5 h-5 text-[#3496FF]" />
                  <span>DM for inquiries</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm font-medium">
              &copy; {new Date().getFullYear()} Apex Detailing. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500 font-medium">
              <span className="hover:text-white cursor-pointer transition-colors">
                Privacy Policy
              </span>
              <span className="hover:text-white cursor-pointer transition-colors">
                Terms of Service
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
