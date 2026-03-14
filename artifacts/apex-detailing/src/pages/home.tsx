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
  ExternalLink,
  Wand2,
} from "lucide-react";

const CALENDLY_LINK = "https://calendly.com/apexdetailingsf/detailing-appointment";
const INSTAGRAM_LINK = "https://www.instagram.com/apexdetailing_sf";
const FACEBOOK_LINK = "https://www.facebook.com/profile.php?id=61556776603500";
const GOOGLE_REVIEWS_LINK = "https://www.google.com/search?q=Apex+Detailing&stick=H4sIAAAAAAAA_-NgU1IxqEiySE1NNLBMTrE0MEs0NLQyqDA1NLQwNE4xtDQzNzEzNEhcxMrnWJBaoeCSWpKYmZOZlw4Asn_-zDkAAAA&hl=en&mat=CcIO9BqJOsD8ElYBTVDHnnxyNghw-j2BeR4ij5jLdc0SeYrElIPH-Aq0ZuK6O8WT2yF1vWHO7tGxejyLiXsPHGKTtfQJq-8n3QWKG1vjf-yuPtfCuuaWSfTNtBNHCmAP8g&authuser=2";

const services = [
  {
    id: "full-detailing",
    title: "Full Detailing",
    description:
      "The ultimate package! Includes interior and exterior detailed cleaning and protection. Get your vehicle looking showroom fresh inside and out. Add-ons available to customize your package.",
    icon: <Wand2 className="w-10 h-10 text-[#A886CD]" />,
    pricing: "$300",
    pricingDetails: ["Coupe / Sedan: $300-$400", "Truck / Jeep / 2-Row SUV: $350 – $450", "Minivan / 3-Row SUV: $350 – $500"],
    features: [
      "Complete Exterior Detailing",
      "Complete Interior Detailing",
      "Paint Protection",
      "Professional Results",
      "Customizable Add-ons",
    ],
  },
  {
    id: "interior-detailing",
    title: "Interior Detailing",
    description:
      "Comprehensive interior cleaning that transforms every surface. From carpets to leather to air vents. Add-ons available to customize your package.",
    icon: <Droplets className="w-10 h-10 text-[#A886CD]" />,
    pricing: "$200",
    pricingDetails: ["2-Row: $200 – $300", "3-Row: $250 – $350"],
    features: [
      "Air vents cleaned",
      "Free air fresheners",
      "Steam cleaning of center console and door panels",
      "All plastic surfaces wiped down",
      "Cloth seats cleaned and steamed",
      "Spot cleaning of the headliner",
      "Cleaning of interior windows and mirrors",
      "Trunk area vacuumed",
      "Leather seats cleaned and conditioned",
      "Rubber mats washed",
      "Extensive vacuuming of the interior",
      "Floor mats steam-cleaned",
      "Steam-cleaning of brake and gas pedals",
    ],
  },
  {
    id: "wash-clay-wax",
    title: "Wash, Clay & Wax",
    description:
      "First, the vehicle receives a thorough hand wash to remove dirt, dust, and road grime. Next, a clay bar treatment is used to safely remove embedded contaminants such as tar, brake dust, and industrial fallout that normal washing cannot remove. Finally, a protective wax coating is applied to enhance shine, protect the paint, and help repel water and dirt.",
    icon: <Sparkles className="w-10 h-10 text-[#A886CD]" />,
    pricing: "$250",
    pricingDetails: ["Sedan: $250", "SUV: $300–$350"],
    features: [
      "Thorough Hand Wash",
      "Clay Bar Treatment",
      "Professional Wax Coating",
      "Enhanced Paint Protection",
      "Water & Dirt Repellent",
    ],
  },
  {
    id: "headlight-restoration",
    title: "Headlight Restoration",
    description:
      "Fix foggy, yellowed headlights to improve nighttime visibility and dramatically improve your car's appearance.",
    icon: <CheckCircle2 className="w-10 h-10 text-[#3496FF]" />,
    pricing: "$100+",
    features: ["Improves Safety", "Removes Oxidation", "UV Protection Applied"],
  },
  {
    id: "ceramic-coating",
    title: "Ceramic Coating",
    description:
      "Ultimate protection and extreme gloss for your vehicle's paint. Lasts for years, making maintenance washes a breeze.",
    icon: <Shield className="w-10 h-10 text-[#3496FF]" />,
    pricing: "Call for Quote",
    features: ["Up to 5 Years Protection", "Extreme Hydrophobics", "Scratch Resistance"],
  },
  {
    id: "paint-correction",
    title: "Paint Correction",
    description:
      "Remove swirl marks, light scratches, and oxidation to restore your paint to a flawless, mirror-like finish.",
    icon: <Sparkles className="w-10 h-10 text-[#A886CD]" />,
    pricing: "$300-$600",
    features: ["Swirl Mark Removal", "Deep Gloss Restoration", "Enhances Resale Value"],
  },
];

const gallery = [
  { id: 1, title: "Paint Correction", beforeAfter: true, color: "from-blue-900 to-[#3496FF]", images: [
    `${import.meta.env.BASE_URL}images/paint-correction-1.jpg`,
  ], currentImageIndex: 0 },
  { id: 2, title: "Ceramic Coating", beforeAfter: false, color: "from-[#A886CD] to-purple-900", video: `${import.meta.env.BASE_URL}videos/ceramic-coating-demo.MOV` },
  { id: 3, title: "Interior Restoration", beforeAfter: true, color: "from-blue-900 to-indigo-900", images: [
    `${import.meta.env.BASE_URL}images/interior-restoration-1.jpg`,
    `${import.meta.env.BASE_URL}images/interior-restoration-2.jpg`,
    `${import.meta.env.BASE_URL}images/interior-restoration-3.jpg`,
    `${import.meta.env.BASE_URL}images/interior-restoration-4.jpg`,
    `${import.meta.env.BASE_URL}images/interior-restoration-5.jpg`,
  ], currentImageIndex: 0 },
  { id: 4, title: "Exterior Detail", beforeAfter: true, color: "from-purple-900 to-black", images: [
    `${import.meta.env.BASE_URL}images/exterior-detail-1.jpg`,
    `${import.meta.env.BASE_URL}images/exterior-detail-2.jpg`,
    `${import.meta.env.BASE_URL}images/exterior-detail-3.jpg`,
    `${import.meta.env.BASE_URL}images/exterior-detail-4.jpg`,
    `${import.meta.env.BASE_URL}images/exterior-detail-5.jpg`,
  ], currentImageIndex: 0 },
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
    name: "Jennifer M.",
    location: "Nixa, MO",
    text: "They completely restored my headlights and the difference is night and day. Professional, thorough, and they even took care to protect my vehicle. Highly recommend!",
  },
];

const googleReviews = [
  {
    name: "David Sallee",
    rating: 5,
    date: "Google Review",
    text: "Misha's waxing was fantastic and very, very reasonable. I would recommend him to anyone. Made my BMW X5 look like brand new. Also did extra treatment on wheels at no charge. Misha was very professional and he knows his stuff on detailing. Great young man and father of three.",
  },
  {
    name: "larry perkins",
    rating: 5,
    date: "Google Review",
    text: "Read reviews of Apex Detailing and decided to give them a try. Wow, Michail did a full detail of the inside of my Lexus and a wash and claybar of the exterior. I am very picky about my car and the detail he did made the interior look better than when I purchased the car. I can highly recommend Michail and I will use him again on my Lexus.",
  },
  {
    name: "Mark Coble",
    rating: 5,
    date: "Google Review",
    text: "Apex Detailing made our Honda look like the day it was new! We are very satisfied with the quality of workmanship and would highly recommend Apex for anyone looking to restore their vehicle's appearance to showroom condition.",
  },
  {
    name: "Darrell Coad",
    rating: 5,
    date: "Google Review",
    text: "Mikhail with Apex Detailing did the exterior of my truck and when I went to pick it up I could not believe how great my truck looked, like brand new. He is a Christian and such a delightful person, I give him top of the scale performance, will definitely be going back.",
  },
  {
    name: "Zach Maddox",
    rating: 5,
    date: "Google Review",
    text: "Apex did a great job detailing our SUV. Very professional and reasonably priced.",
  },
  {
    name: "Nicolle Mckeag",
    rating: 5,
    date: "Google Review",
    text: "Apex got my car looking better than ever, and this isn't the first time I've gotten it detailed. The owner is very detail oriented and made my car shine inside and out. Turn around time was great and my car was ready in time for my visitors.",
  },
];

function AddonsSection() {
  const [expandedAddon, setExpandedAddon] = useState(null);

  const interiorAddons = [
    {
      id: "pet-hair",
      name: "Pet Hair Removal",
      price: "$0 – $100",
      description: "Pet hair removal is a specialized interior detailing service designed to extract stubborn pet hair from seats, carpets, floor mats, and other fabric surfaces inside the vehicle. Professional tools such as rubber brushes, specialized vacuums, air compressors, and detailing tools are used to loosen and remove hair that is deeply embedded in upholstery fibers."
    },
    {
      id: "deep-shampooing",
      name: "Deep Shampooing & Stain Removal",
      price: "$120+",
      description: "Deep shampooing and stain removal is an intensive cleaning process designed to eliminate deeply embedded dirt, odors, and stubborn stains from carpets and upholstery. High-quality cleaning solutions and powerful extraction equipment lift contaminants from the fibers, leaving surfaces sanitized, refreshed, and looking like new."
    },
    {
      id: "plastic-uv",
      name: "Interior Plastic UV Treatment",
      price: "$60",
      description: "Interior Plastic UV Treatment protects dashboards, door panels, and other plastic surfaces from sun damage. The treatment restores the original appearance while adding a protective layer that helps prevent fading, cracking, and discoloration."
    }
  ];

  const exteriorAddons = [
    {
      id: "exterior-detailing",
      name: "Exterior Detailing",
      price: "Sedan: $150 | SUV: $200",
      description: "Comprehensive exterior cleaning and protection to make your car turn heads everywhere you go. Includes detailed hand wash, exterior windows and mirrors cleaning, wheels and tires cleaned, polished, and dressed, door jambs wiped down, and spray sealant for 1-month protection."
    },
    {
      id: "wash-clay-wax",
      name: "Wash, Clay & Wax",
      price: "Sedan: $250 | SUV: $300–$350",
      description: "First, the vehicle receives a thorough hand wash to remove dirt, dust, and road grime. Next, a clay bar treatment is used to safely remove embedded contaminants such as tar, brake dust, and industrial fallout that normal washing cannot remove. Finally, a protective wax coating is applied to enhance shine, protect the paint, and help repel water and dirt."
    },
    {
      id: "dress-exterior",
      name: "Dress Exterior Plastic",
      price: "$45",
      description: "Exterior Plastic Dressing is a detailing service that restores and protects the plastic and rubber trim on the outside of your vehicle. A professional-grade dressing is applied to faded or dull plastic surfaces to bring back their deep, rich color while adding protection against sun damage and weather."
    },
    {
      id: "clay-bar",
      name: "Clay Bar Treatment",
      price: "$55+",
      description: "Clay Bar Treatment is a detailing process that removes embedded contaminants from your vehicle's paint that regular washing cannot eliminate. Using a specialized clay bar and lubricant, the surface is gently treated to lift off bonded particles such as brake dust, tar, tree sap, and industrial fallout. This process leaves the paint smooth to the touch, improves the vehicle's shine, and prepares the surface for wax, sealant, or ceramic coating."
    },
    {
      id: "headlight",
      name: "Headlight Restoration",
      price: "$100",
      description: "Headlight Restoration is a detailing service that removes oxidation, haze, and yellowing from vehicle headlights to restore clarity and brightness. Over time, sun exposure and environmental contaminants can make headlights cloudy, reducing visibility and the overall appearance of your vehicle."
    },
    {
      id: "engine-bay",
      name: "Engine Bay Cleaning",
      price: "$60+",
      description: "Engine Bay Cleaning is a detailing service that safely cleans the engine compartment to remove built-up dirt, grease, dust, and debris. Using specialized cleaners and careful techniques, the engine bay is degreased, gently washed, and dried to restore a clean and well-maintained appearance."
    }
  ];

  const AddonCard = ({ addon }) => (
    <div
      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-[#3496FF] transition-all cursor-pointer group"
      onMouseEnter={() => addon.description && setExpandedAddon(addon.id)}
      onMouseLeave={() => setExpandedAddon(null)}
      onClick={() => addon.description && setExpandedAddon(expandedAddon === addon.id ? null : addon.id)}
    >
      <h4 className="text-base font-bold text-white mb-1">{addon.name}</h4>
      <p className="text-[#3496FF] font-bold text-sm">{addon.price}</p>
      {expandedAddon === addon.id && addon.description && (
        <p className="text-gray-300 text-xs mt-3 leading-relaxed animate-in fade-in duration-300">
          {addon.description}
        </p>
      )}
    </div>
  );

  return (
    <div className="mt-24 pt-16 border-t border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Interior Addons */}
        <div>
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] to-[#3496FF]">
              Interior Addons
            </span>
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Optional Services (Extra Charges Apply)
          </p>
          
          <div className="space-y-4">
            {interiorAddons.map(addon => (
              <AddonCard key={addon.id} addon={addon} />
            ))}
          </div>
        </div>

        {/* Exterior Addons */}
        <div>
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] to-[#3496FF]">
              Exterior Addons
            </span>
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Optional Services (Extra Charges Apply)
          </p>
          
          <div className="space-y-4">
            {exteriorAddons.map(addon => (
              <AddonCard key={addon.id} addon={addon} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<typeof gallery[0] | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleGalleryItemClick = (item: typeof gallery[0]) => {
    setSelectedGalleryItem(item);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedGalleryItem?.images && currentImageIndex < selectedGalleryItem.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = ["home", "services", "about", "gallery", "testimonials"];
    const observers = {};

    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        const observer = new IntersectionObserver(callback, {
          threshold: [0, 0.1, 0.2],
        });
        observer.observe(element);
        observers[id] = observer;
      }
    });

    return () => {
      Object.values(observers).forEach((observer) => observer.disconnect());
    };
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
      {/* Texture Overlay */}
      <div className="texture-overlay" />
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 overflow-hidden ${
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
                className="h-28 w-auto object-contain logo-shine"
                style={{ mixBlendMode: "screen" }}
              />
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {["Home", "Services", "About", "Gallery", "Testimonials"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`font-semibold text-sm tracking-wider uppercase transition-colors relative group ${
                    activeSection === item.toLowerCase()
                      ? "text-white header-shine"
                      : "text-gray-300 hover:text-white"
                  }`}
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
        {/* Soap Bubbles in Header */}
        <div className="soap-bubble absolute top-[5%] left-[5%] w-12 h-12" style={{ animationDuration: '16s', animationDelay: '0s' }} />
        <div className="soap-bubble absolute top-[10%] left-[15%] w-16 h-16" style={{ animationDuration: '18s', animationDelay: '1s' }} />
        <div className="soap-bubble absolute top-[8%] right-[10%] w-20 h-20" style={{ animationDuration: '20s', animationDelay: '2s' }} />
        <div className="soap-bubble absolute top-[15%] right-[5%] w-14 h-14" style={{ animationDuration: '17s', animationDelay: '0.5s' }} />
        <div className="soap-bubble absolute top-[3%] left-[40%] w-10 h-10" style={{ animationDuration: '19s', animationDelay: '1.5s' }} />
        <div className="soap-bubble absolute top-[12%] left-[25%] w-6 h-6" style={{ animationDuration: '15s', animationDelay: '0.8s' }} />
        <div className="soap-bubble absolute top-[7%] right-[20%] w-8 h-8" style={{ animationDuration: '17s', animationDelay: '2.5s' }} />
        <div className="soap-bubble absolute top-[20%] left-[60%] w-7 h-7" style={{ animationDuration: '16s', animationDelay: '1.2s' }} />

        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-[#A886CD] rounded-full mix-blend-screen filter blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-[#3496FF] rounded-full mix-blend-screen filter blur-[100px] animate-[pulse_8s_ease-in-out_infinite_1s]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#A886CD]/10 to-[#3496FF]/10 border border-[#A886CD]/30 backdrop-blur-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-[#3496FF] animate-pulse" />
            <span className="text-sm font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#A886CD] to-[#3496FF] uppercase">
              Nixa Ozark Springfield, MO Premium Detailing
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6 drop-shadow-2xl uppercase">
            Unleash Your <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] via-white to-[#3496FF]">
              Car's True Potential
            </span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-gray-300 mb-10 font-medium">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] via-[#A886CD] to-[#3496FF]">Premium auto detailing, ceramic coating, and paint correction</span> services serving
            <span className="text-[#3496FF] font-bold"> Nixa Ozark Springfield, MO</span>. We bring the showroom shine to your vehicle.
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
              <span className="font-bold">Professional Detailers</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-[#3496FF]" fill="currentColor" />
              <span className="font-bold">5-Star Rated</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#A886CD]" />
              <span className="font-bold">Expert Detailing</span>
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

          <div className="mb-12 p-6 rounded-xl bg-white/5 border border-[#A886CD]/30 backdrop-blur-sm max-w-3xl mx-auto">
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="font-black text-[#A886CD]">Pricing Note:</span> The price ranges listed below are standard for the majority of vehicles. The final cost will depend on the condition of your vehicle and any additional services you request. For a more accurate estimate, please contact us directly.
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
                  <h4 className="text-2xl font-black mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#A886CD] group-hover:to-[#3496FF] transition-all duration-300">
                    {service.title}
                  </h4>
                  <p className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] to-[#3496FF] mb-4">
                    {service.pricing}
                  </p>
                  {service.pricingDetails && (
                    <div className="mb-4 text-sm text-gray-300 bg-white/5 p-3 rounded-lg">
                      {service.pricingDetails.map((detail, i) => (
                        <p key={i} className="text-xs mb-1">{detail}</p>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-400 mb-6 flex-grow">{service.description}</p>
                  <ul className="space-y-2 mb-8">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#3496FF] mt-0.5 shrink-0" />
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

          {/* Addons Section - Two Column Layout */}
          <AddonsSection />
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
                      `url('${import.meta.env.BASE_URL}images/about-hero.jpg')`,
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
                      <p className="font-black text-white text-lg leading-tight">⭐⭐⭐⭐⭐</p>
                      <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                        5-Star Rated
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-[#A886CD] to-[#3496FF] rounded-2xl -z-10 blur-xl opacity-50" />
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-sm font-bold tracking-widest text-[#A886CD] uppercase mb-3">
                About Us
              </h2>
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8 leading-tight">
                Welcome to{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] to-[#3496FF]">
                  Apex Detailing
                </span>
              </h3>

              <div className="space-y-6 text-gray-400 text-lg mb-10">
                <p>
                  Where passion, precision, and purpose come together to serve you with excellence. Serving the Nixa Ozark Springfield, MO areas, we specialize in high-quality car detailing that restores beauty, protects value, and reflects the pride you have in your vehicle.
                </p>
                <p>
                  Our dedication to quality and customer satisfaction has helped us become <strong className="text-white">#1 Ranked in Nixa for 2024 and 2025</strong>, a recognition we are truly grateful for.
                </p>
                <p className="italic">
                  Our business is built on <span className="text-[#3496FF] font-semibold">Christian</span> values, with <span className="text-[#3496FF] font-semibold">Christ</span> at the center of everything we do. We believe in working with integrity, serving others with a joyful heart, and honoring <span className="text-[#3496FF] font-semibold">God</span> through the quality of our craft.
                </p>
                <p className="italic text-[#A886CD] text-sm mt-4">
                  "Whatever you do, work at it with all your heart, as working for the Lord, not for men. Colossians 3:23 (NIV)"
                </p>
                <p>
                  Apex Detailing was founded by Mikhail, who is known for his meticulous nature and commitment to perfection. What started as a personal passion for detailing has grown into a trusted service grounded in faith, excellence, and care.
                </p>
                <p>
                  At Apex, we use only premium-grade chemicals and professional techniques to ensure every vehicle gets the attention it deserves — inside and out. Whether it's a deep interior clean, paint correction, or exterior protection, our goal is to go above and beyond your expectations.
                </p>
                <p>
                  <strong className="text-white">Experience the Apex difference — where faith fuels our service and quality drives every detail.</strong>
                </p>
                <p className="mt-6">
                  <span className="text-white font-black text-lg">Mikhail Gurov</span>
                  <br />
                  <span className="text-[#A886CD] font-bold">Founder & Detailing Specialist</span>
                </p>
              </div>

              <div className="border-t border-white/10 pt-6 mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
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
                  {
                    title: "Expert Team",
                    desc: "Certified professionals on staff",
                    icon: <Sparkles className="text-[#3496FF]" />,
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => handleGalleryItemClick(item)}
              >
                {item.video ? (
                  <>
                    <video
                      src={item.video}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      muted
                      autoPlay
                      loop
                      playsInline
                      controls={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                  </>
                ) : item.images && item.images.length > 0 ? (
                  <>
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      style={{ filter: 'brightness(1.15) contrast(1.15)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  </>
                ) : (
                  <>
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-80 group-hover:scale-105 transition-transform duration-700`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  </>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {item.video && (
                    <span className="inline-block px-3 py-1 bg-[#A886CD] text-black font-black text-xs uppercase tracking-widest rounded mb-3">
                      Video
                    </span>
                  )}
                  {item.beforeAfter && (
                    <span className="inline-block px-3 py-1 bg-[#3496FF] text-black font-black text-xs uppercase tracking-widest rounded mb-3">
                      Results After
                    </span>
                  )}
                  <h4 className="text-2xl font-black text-white">{item.title}</h4>
                  {item.images && item.images.length > 1 && (
                    <p className="text-xs text-gray-300 mt-2">
                      {item.images.length} {item.images.length === 1 ? 'result' : 'results'}
                    </p>
                  )}
                  <div className="w-12 h-1 bg-gradient-to-r from-[#A886CD] to-[#3496FF] mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-400 text-lg mb-6">See more stunning transformations on Instagram</p>
            <a
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center px-10 py-5 font-black text-white text-lg transition-all duration-300 ease-in-out bg-gradient-to-r from-[#A886CD] to-[#3496FF] rounded-xl overflow-hidden shadow-[0_0_40px_rgba(168,134,205,0.4)] hover:shadow-[0_0_60px_rgba(52,150,255,0.6)] hover:scale-105"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#3496FF] to-[#A886CD] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center gap-3">
                <Instagram className="w-6 h-6" />
                Follow @apexdetailing_sf
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Gallery Lightbox Modal */}
      {selectedGalleryItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedGalleryItem(null)}
        >
          <button
            onClick={() => setSelectedGalleryItem(null)}
            className="absolute top-6 right-16 text-white hover:text-[#3496FF] transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="absolute top-6 right-6 text-white hover:text-[#3496FF] transition-colors z-10"
            aria-label={isFullscreen ? "Minimize" : "Maximize"}
          >
            {isFullscreen ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V5m0 0H5m4 0l-4 4m0 6v4m0 0H5m4 0l-4-4m6-6h4v4m0 0v4m0-4h4m-4 0l4 4m-6-10h4m0 0v-4m0 4h4m-4 0l4-4" />
                </svg>
              </div>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6v4m12 0h4v-4m0 12h-4v4m-12 0H6v-4" />
              </svg>
            )}
          </button>

          <div className={`relative flex items-center justify-center ${isFullscreen ? 'w-screen h-screen' : 'max-w-4xl max-h-[90vh]'}`} onClick={(e) => e.stopPropagation()}>
            {selectedGalleryItem.video ? (
              <video
                src={selectedGalleryItem.video}
                className={`${isFullscreen ? 'w-full h-full' : 'w-full h-full'} object-contain ${!isFullscreen && 'rounded-xl'}`}
                muted
                autoPlay
                loop
                playsInline
                controls
              />
            ) : selectedGalleryItem.images && selectedGalleryItem.images.length > 0 ? (
              <>
                <img
                  src={selectedGalleryItem.images[currentImageIndex]}
                  alt={`${selectedGalleryItem.title} - Image ${currentImageIndex + 1}`}
                  className={`${isFullscreen ? 'w-full h-full' : 'w-full h-full'} object-contain ${!isFullscreen && 'rounded-xl'}`}
                  style={{ filter: 'brightness(1.15) contrast(1.15)' }}
                />
                
                {/* Previous Button */}
                {currentImageIndex > 0 && (
                  <button
                    onClick={prevImage}
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:text-[#3496FF] transition-colors z-20 bg-black/30 hover:bg-black/50 p-3 rounded-full"
                    aria-label="Previous image"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Next Button */}
                {selectedGalleryItem.images.length > 1 && currentImageIndex < selectedGalleryItem.images.length - 1 && (
                  <button
                    onClick={nextImage}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white hover:text-[#3496FF] transition-colors z-20 bg-black/30 hover:bg-black/50 p-3 rounded-full"
                    aria-label="Next image"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                {/* Image Counter */}
                {selectedGalleryItem.images.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {currentImageIndex + 1} / {selectedGalleryItem.images.length}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

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

      {/* Google Reviews Showcase */}
      <section className="py-24 relative bg-[#0d0d0d] border-y border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#A886CD]/10 rounded-full mix-blend-screen filter blur-[120px] -translate-y-1/2" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-sm font-bold tracking-widest text-[#3496FF] uppercase mb-3">
              Google Reviews
            </h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
              Trusted by Our{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] to-[#3496FF]">
                Happy Customers
              </span>
            </h3>
            <p className="text-gray-400 text-lg mb-8">
              See what our clients are saying about Apex Detailing. We maintain a 5-star rating across all platforms.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                { rating: "5.0", reviews: "Excellent", description: "Rating" },
                { rating: "100%", reviews: "Positive", description: "Customer Rating" },
                { rating: "5h", reviews: "Response", description: "Support Time" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-colors">
                  <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#A886CD] to-[#3496FF] mb-2">
                    {stat.rating}
                  </p>
                  <p className="text-gray-300 font-bold mb-2">{stat.reviews}</p>
                  <p className="text-gray-500 text-sm uppercase tracking-wider">{stat.description}</p>
                </div>
              ))}
            </div>

          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {googleReviews.map((review, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 hover:bg-white/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h5 className="font-bold text-white text-lg">{review.name}</h5>
                    <p className="text-xs text-gray-500 mt-1">{review.date}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= review.rating ? "text-[#FFA500]" : "text-gray-600"}`}
                      fill={star <= review.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>

                <p className="text-gray-300 text-sm leading-relaxed">{review.text}</p>
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
                Book your appointment today.
              </p>
              <div className="mb-8 p-6 rounded-xl bg-white/5 border border-[#3496FF]/30 backdrop-blur-sm max-w-2xl">
                <p className="text-gray-300 text-sm leading-relaxed">
                  <span className="font-black text-[#3496FF]">Important:</span> All scheduling needs to be done prior to your visit. We appreciate your understanding and encourage you to book ahead to secure your preferred time.
                </p>
              </div>
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
                  className="h-14 w-auto object-contain logo-shine"
                  style={{ mixBlendMode: "screen" }}
                />
              </div>
              <p className="text-gray-400 mb-6 font-medium">
                Prestige vehicle detailing and ceramic coating services. Expert craftsmanship,
                exceptional results.
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
                  <a
                    href="https://www.google.com/maps/search/1114+E+Lakota+St,+65714+Nixa,+MO"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#3496FF] transition-colors cursor-pointer"
                  >
                    <span>Located in the Nixa<br />1114 E Lakota St, 65714</span>
                  </a>
                </li>
                <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                  <Phone className="w-5 h-5 text-[#A886CD]" />
                  <a href="tel:417-527-6165" className="hover:text-[#3496FF] transition-colors">417-527-6165</a>
                </li>
                <li className="flex items-start gap-3 group cursor-pointer">
                  <Mail className="w-5 h-5 text-[#3496FF] shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="group-hover:hidden">Contact us via<br />social media</span>
                    <div className="hidden group-hover:flex gap-3 pt-2">
                      <a
                        href={INSTAGRAM_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/10 hover:bg-gradient-to-r hover:from-[#A886CD] hover:to-[#3496FF] transition-all"
                        title="Instagram"
                      >
                        <Instagram className="w-5 h-5 text-white" />
                      </a>
                      <a
                        href={FACEBOOK_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/10 hover:bg-gradient-to-r hover:from-[#A886CD] hover:to-[#3496FF] transition-all"
                        title="Facebook"
                      >
                        <Facebook className="w-5 h-5 text-white" />
                      </a>
                    </div>
                  </div>
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
