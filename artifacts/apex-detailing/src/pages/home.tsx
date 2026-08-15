import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "wouter";
import {
  Menu,
  X,
  ChevronRight,
  Star,
  Shield,
  Car,
  Sparkles,
  Droplets,
  Info,
  Instagram,
  Facebook,
  MapPin,
  Phone,
  CheckCircle2,
  ChevronsLeftRight,
  Clock,
  Award,
  ExternalLink,
  Wand2,
  Zap,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import LanguageToggle from "@/components/LanguageToggle";
import ApexHero from "@/components/hero/ApexHero";
import HeroDip from "@/components/hero/HeroDip";
import EliteServicesSection from "@/components/EliteServicesSection";
import AddonsSection from "@/components/AddonsSection";
import { useLanguage } from "@/i18n/LanguageProvider";
import OptimizedImage, { imageUrl } from "@/components/OptimizedImage";
import GalleryVideoThumb from "@/components/GalleryVideoThumb";
import { PKG_PHOTO } from "@/i18n/packageMap";
import { bookingUrl, goBookNow } from "@/lib/openBooking";

const BOOKING_LINK = "/book";
const INSTAGRAM_LINK = "https://www.instagram.com/apexdetailing_sf";
const FACEBOOK_LINK = "https://www.facebook.com/profile.php?id=61556776603500";
const GOOGLE_REVIEWS_LINK = "https://g.page/r/CQphdJbRExhREAE/review";

const NAV_ITEMS = [
  { id: "home", kind: "section" as const },
  { id: "services", kind: "section" as const },
  { id: "about", kind: "section" as const },
  { id: "gallery", kind: "section" as const },
  { id: "testimonials", kind: "section" as const },
  { id: "faq", kind: "section" as const },
  { id: "journal", kind: "path" as const, path: "blog" },
  { id: "gift", kind: "path" as const, path: "gift-cards" },
];

const services = [
  {
    id: "full-detailing",
    pkg: "full",
    icon: <Wand2 className="w-10 h-10 text-[#FF1AD8]" />,
    pricing: "$300",
  },
  {
    id: "interior-detailing",
    pkg: "interior",
    icon: <Droplets className="w-10 h-10 text-[#FF1AD8]" />,
    pricing: "$200",
  },
  {
    id: "apex-express-interior-detailing",
    pkg: "express",
    icon: <Droplets className="w-10 h-10 text-[#FF1AD8]" />,
    pricing: "$100",
  },
  {
    id: "exterior-detailing",
    pkg: "exterior",
    icon: <Car className="w-10 h-10 text-[#00E5FF]" />,
    pricing: "$150",
  },
  {
    id: "wash-clay-wax",
    pkg: "wax",
    icon: <Sparkles className="w-10 h-10 text-[#FF1AD8]" />,
    pricing: "$250",
  },
  {
    id: "headlight-restoration",
    pkg: "headlight",
    icon: <CheckCircle2 className="w-10 h-10 text-[#00E5FF]" />,
    pricing: "$125",
  },
  {
    id: "ceramic-coating",
    pkg: "ceramic",
    icon: <Shield className="w-10 h-10 text-[#00E5FF]" />,
    pricing: "Call for Quote",
  },
  {
    id: "paint-correction",
    pkg: "paint",
    icon: <Sparkles className="w-10 h-10 text-[#FF1AD8]" />,
    pricing: "$300+",
  },
];

const gallery = [
  { id: 1, title: "Paint Correction", beforeAfter: false, color: "from-blue-900 to-[#00E5FF]", thumbnail: imageUrl("paint-correction-thumbnail.jpg"), images: [
    imageUrl("paint-correction-1.jpg"),
    imageUrl("paint-correction-2.jpg"),
    imageUrl("paint-correction-3.jpg"),
    imageUrl("paint-correction-4.jpg"),
    imageUrl("paint-correction-5.jpg"),
    imageUrl("paint-correction-6.jpg"),
    imageUrl("paint-correction-7.jpg"),
    imageUrl("gallery/paint-correction/IMG_1968.jpeg"),
    imageUrl("gallery/paint-correction/IMG_1969.jpeg"),
    imageUrl("gallery/paint-correction/IMG_1970.jpeg"),
  ], currentImageIndex: 0 },
  { id: 2, title: "Ceramic Coating", beforeAfter: true, color: "from-[#FF1AD8] to-purple-900", thumbnail: imageUrl("ceramic-3.jpg"), video: imageUrl("videos/ceramic-demo.mp4") },
  { id: 3, title: "Interior Restoration", beforeAfter: true, color: "from-blue-900 to-indigo-900", thumbnail: imageUrl("interior-restoration-thumbnail.jpg"), video: imageUrl("interior-restoration-video.mp4"), images: [
    { src: imageUrl("interior-before-1.jpg"), label: "Before" },
    { src: imageUrl("interior-after-1.jpg"), label: "After" },
    { src: imageUrl("interior-before-2.jpg"), label: "Before" },
    { src: imageUrl("interior-after-2.jpg"), label: "After" },
    { src: imageUrl("interior-before-3.jpg"), label: "Before" },
    { src: imageUrl("interior-after-3.jpg"), label: "After" },
    { src: imageUrl("interior-before-4.jpg"), label: "Before" },
    { src: imageUrl("interior-after-4.jpg"), label: "After" },
    { src: imageUrl("interior-before-5.jpg"), label: "Before" },
    { src: imageUrl("interior-after-5.jpg"), label: "After" },
    { src: imageUrl("interior-before-6.jpg"), label: "Before" },
    { src: imageUrl("interior-after-6.jpg"), label: "After" },
    { src: imageUrl("interior-before-7.jpg"), label: "Before" },
    { src: imageUrl("interior-after-7.jpg"), label: "After" },
  ], currentImageIndex: 0 },
  { id: 4, title: "Exterior Detail", beforeAfter: true, color: "from-purple-900 to-black", thumbnail: imageUrl("exterior-detail-thumbnail.jpg"), video: imageUrl("exterior-detail-video.mov"), images: [
    { src: imageUrl("exterior-before-1.jpg"), label: "Before" },
    { src: imageUrl("exterior-after-1.jpg"), label: "After" },
    { src: imageUrl("exterior-before-2.jpg"), label: "Before" },
    { src: imageUrl("exterior-after-2.jpg"), label: "After" },
  ], currentImageIndex: 0 },
  { id: 5, title: "Headlights Restoration", beforeAfter: true, color: "from-cyan-900 to-blue-600", thumbnail: imageUrl("headlights-restoration-thumbnail.jpg"), video: imageUrl("headlights-video.mp4"), images: [
    { src: imageUrl("headlights-before-1.jpg"), label: "Before" },
    { src: imageUrl("headlights-after-1.jpg"), label: "After" },
    { src: imageUrl("headlights-before-2.jpg"), label: "Before" },
    { src: imageUrl("headlights-after-2.jpg"), label: "After" },
    { src: imageUrl("headlights-before-3.jpg"), label: "Before" },
    { src: imageUrl("headlights-after-3.jpg"), label: "After" },
  ], currentImageIndex: 0 },
];

  const testimonials = [
    {
      text: "Apex Detailing detailed and waxed our work vehicles, including two F-250s, a Honda Accord, an Odyssey, and a GMC Yukon. We were thrilled with the results - every vehicle looked brand new. We'll definitely be bringing our personal vehicles to Apex too.",
      author: "Sight & Sound Theater",
      name: "Sight & Sound Theater",
      location: "Branson, MO",
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
    text: "Apex Detailing detailed and waxed our work vehicles, including two F-250s, a Honda Accord, an Odyssey, and a GMC Yukon. We were thrilled with the results - every vehicle looked brand new. We'll definitely be bringing our personal vehicles to Apex too.",
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

export default function Home() {
  const { t, list } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<typeof gallery[0] | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [aboutImageIdx, setAboutImageIdx] = useState(0);
  const [mapChooserOpen, setMapChooserOpen] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [currentSliderIndex, setCurrentSliderIndex] = useState(0);
  const [sliderFading, setSliderFading] = useState(false);
  const [baVisible, setBaVisible] = useState(true);
  const [paintCorrectionPreviewIndex, setPaintCorrectionPreviewIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeFaqCategory, setActiveFaqCategory] = useState<
    "general" | "paint" | "ceramic"
  >("general");
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(null);
  const sliderTouchRef = useRef<{ x: number; y: number; dragging: boolean } | null>(null);

  const pageBubbles = useMemo(() => {
    if (typeof window === "undefined") return [];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return [];
    const mobile = window.matchMedia("(max-width: 640px)").matches;
    // Keep enough density on phones — prior 8×tiny bubbles were nearly invisible
    const count = mobile ? 6 : 12;
    return Array.from({ length: count }, (_, i) => {
      const tone = Math.random();
      return {
        id: i,
        x: Math.random() * 100,
        start: -5 + Math.random() * 95,
        size: mobile ? 14 + Math.random() * 22 : 10 + Math.random() * 16,
        drift: (Math.random() - 0.5) * (mobile ? 80 : 100),
        dur: (mobile ? 11 : 12) + Math.random() * (mobile ? 10 : 12),
        delay: -Math.random() * (mobile ? 14 : 16),
        tone: tone < 0.34 ? "pink" : tone < 0.68 ? "cyan" : "",
      };
    });
  }, []);

  const faqs: Array<{
    qKey: string;
    aKey: string;
    category: "general" | "paint" | "ceramic";
  }> = [
    { qKey: "faq.g0.q", aKey: "faq.g0.a", category: "general" },
    { qKey: "faq.g1.q", aKey: "faq.g1.a", category: "general" },
    { qKey: "faq.g2.q", aKey: "faq.g2.a", category: "general" },
    { qKey: "faq.g3.q", aKey: "faq.g3.a", category: "general" },
    { qKey: "faq.g4.q", aKey: "faq.g4.a", category: "general" },
    { qKey: "faq.g5.q", aKey: "faq.g5.a", category: "general" },
    { qKey: "faq.p0.q", aKey: "faq.p0.a", category: "paint" },
    { qKey: "faq.p1.q", aKey: "faq.p1.a", category: "paint" },
    { qKey: "faq.p2.q", aKey: "faq.p2.a", category: "paint" },
    { qKey: "faq.p3.q", aKey: "faq.p3.a", category: "paint" },
    { qKey: "faq.p4.q", aKey: "faq.p4.a", category: "paint" },
    { qKey: "faq.p5.q", aKey: "faq.p5.a", category: "paint" },
    { qKey: "faq.p6.q", aKey: "faq.p6.a", category: "paint" },
    { qKey: "faq.p7.q", aKey: "faq.p7.a", category: "paint" },
    { qKey: "faq.c0.q", aKey: "faq.c0.a", category: "ceramic" },
    { qKey: "faq.c1.q", aKey: "faq.c1.a", category: "ceramic" },
    { qKey: "faq.c2.q", aKey: "faq.c2.a", category: "ceramic" },
    { qKey: "faq.c3.q", aKey: "faq.c3.a", category: "ceramic" },
    { qKey: "faq.c4.q", aKey: "faq.c4.a", category: "ceramic" },
    { qKey: "faq.c5.q", aKey: "faq.c5.a", category: "ceramic" },
    { qKey: "faq.c6.q", aKey: "faq.c6.a", category: "ceramic" },
    { qKey: "faq.c7.q", aKey: "faq.c7.a", category: "ceramic" },
    { qKey: "faq.c8.q", aKey: "faq.c8.a", category: "ceramic" },
    { qKey: "faq.c9.q", aKey: "faq.c9.a", category: "ceramic" },
    { qKey: "faq.c10.q", aKey: "faq.c10.a", category: "ceramic" },
  ];

  const serviceCities = [
    "Nixa", "Ozark", "Springfield", "Republic", "Battlefield",
    "Rogersville", "Strafford", "Willard", "Sparta", "Highlandville",
  ];

  const beforeAfterPairs: Array<{ title: string; descKey: string; before: string; after: string }> = [
    {
      title: "Interior Restoration",
      descKey: "ba.desc.interior",
      before: imageUrl("interior-before-1.jpg"),
      after: imageUrl("interior-after-1.jpg"),
    },
    {
      title: "Interior Restoration",
      descKey: "ba.desc.interior",
      before: imageUrl("interior-before-2.jpg"),
      after: imageUrl("interior-after-2.jpg"),
    },
    {
      title: "Interior Restoration",
      descKey: "ba.desc.interior",
      before: imageUrl("interior-before-3.jpg"),
      after: imageUrl("interior-after-3.jpg"),
    },
    {
      title: "Interior Restoration",
      descKey: "ba.desc.interior",
      before: imageUrl("interior-before-7.jpg"),
      after: imageUrl("interior-after-7.jpg"),
    },
    {
      title: "Exterior Detail",
      descKey: "ba.desc.exterior",
      before: imageUrl("exterior-before-1.jpg"),
      after: imageUrl("exterior-after-1.jpg"),
    },
    {
      title: "Exterior Detail",
      descKey: "ba.desc.exterior",
      before: imageUrl("exterior-before-2.jpg"),
      after: imageUrl("exterior-after-2.jpg"),
    },
    {
      title: "Headlights Restoration",
      descKey: "ba.desc.headlights",
      before: imageUrl("headlights-before-1.jpg"),
      after: imageUrl("headlights-after-1.jpg"),
    },
    {
      title: "Headlights Restoration",
      descKey: "ba.desc.headlights",
      before: imageUrl("headlights-before-2.jpg"),
      after: imageUrl("headlights-after-2.jpg"),
    },
    {
      title: "Headlights Restoration",
      descKey: "ba.desc.headlights",
      before: imageUrl("headlights-before-3.jpg"),
      after: imageUrl("headlights-after-3.jpg"),
    },
    {
      title: "Paint Correction",
      descKey: "ba.desc.paint",
      before: imageUrl("ba/paint-correction-before.jpg"),
      after: imageUrl("ba/paint-correction-after.jpg"),
    },
  ];

  const goToBaSlide = (index: number) => {
    setSliderFading(true);
    setTimeout(() => {
      setCurrentSliderIndex(index);
      setSliderPosition(50);
      setSliderFading(false);
    }, 220);
  };

  const handleSliderDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const container = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const pos = e.type.includes('touch') 
      ? (e as React.TouchEvent<HTMLDivElement>).touches[0].clientX 
      : (e as React.MouseEvent<HTMLDivElement>).clientX;
    const newPos = Math.max(0, Math.min(100, ((pos - container.left) / container.width) * 100));
    setSliderPosition(newPos);
  };

  const aboutImages = [
    `${import.meta.env.BASE_URL}images/about-hero.jpg`,
    `${import.meta.env.BASE_URL}images/hero-1.jpg`,
    `${import.meta.env.BASE_URL}images/hero-2.jpg`,
    `${import.meta.env.BASE_URL}images/hero-3.jpg`,
    `${import.meta.env.BASE_URL}images/hero-4.jpg`,
  ];

  // Auto-rotate about images
  useEffect(() => {
    const timer = setInterval(() => {
      setAboutImageIdx((prev) => (prev + 1) % aboutImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [aboutImages.length]);

  // Before/After enter animation — start visible so mobile never stays opacity:0
  useEffect(() => {
    const el = document.getElementById("before-after");
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setBaVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setBaVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "80px 0px 80px 0px" },
    );
    io.observe(el);
    const fallback = window.setTimeout(() => setBaVisible(true), 600);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  // Auto-rotate gallery images when lightbox is open
  useEffect(() => {
    if (!selectedGalleryItem) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => {
        if (!selectedGalleryItem.images) return prev;
        const next = prev + 1;
        if (next >= selectedGalleryItem.images.length) return 0;
        return next;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, [selectedGalleryItem]);

  const handleGalleryItemClick = (item: typeof gallery[0]) => {
    setSelectedGalleryItem(item);
    setCurrentImageIndex(0);
    
    // Preload current and next image when gallery opens
    if (item.images) {
      const preloadImage = (index: number) => {
        if (index >= 0 && index < item.images.length) {
          const imageSrc = typeof item.images[index] === 'string' 
            ? item.images[index] 
            : item.images[index].src;
          const img = new Image();
          img.src = imageSrc;
        }
      };
      preloadImage(0);
      preloadImage(1);
    }
  };

  const nextImage = () => {
    if (selectedGalleryItem?.images && currentImageIndex < selectedGalleryItem.images.length - 1) {
      setIsImageTransitioning(true);
      setTimeout(() => {
        const nextIndex = currentImageIndex + 1;
        setCurrentImageIndex(nextIndex);
        setIsImageTransitioning(false);

        // Preload the image after next
        if (nextIndex + 1 < selectedGalleryItem.images.length) {
          const imageSrc = typeof selectedGalleryItem.images[nextIndex + 1] === 'string'
            ? selectedGalleryItem.images[nextIndex + 1]
            : selectedGalleryItem.images[nextIndex + 1].src;
          const img = new Image();
          img.src = imageSrc;
        }
      }, 200);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setIsImageTransitioning(true);
      setTimeout(() => {
        const prevIndex = currentImageIndex - 1;
        setCurrentImageIndex(prevIndex);
        setIsImageTransitioning(false);

        // Preload the image before previous
        if (prevIndex - 1 >= 0 && selectedGalleryItem?.images) {
          const imageSrc = typeof selectedGalleryItem.images[prevIndex - 1] === 'string'
            ? selectedGalleryItem.images[prevIndex - 1]
            : selectedGalleryItem.images[prevIndex - 1].src;
          const img = new Image();
          img.src = imageSrc;
        }
      }, 200);
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
    const sections = ["home", "services", "about", "gallery", "testimonials", "faq"];
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

  const paintCorrectionImages = [
    `${import.meta.env.BASE_URL}images/paint-correction-5.jpg`,
    `${import.meta.env.BASE_URL}images/paint-correction-2.jpg`,
    `${import.meta.env.BASE_URL}images/paint-correction-6.jpg`,
    `${import.meta.env.BASE_URL}images/paint-correction-1.jpg`,
    `${import.meta.env.BASE_URL}images/paint-correction-3.jpg`,
    `${import.meta.env.BASE_URL}images/paint-correction-4.jpg`,
    `${import.meta.env.BASE_URL}images/paint-correction-7.jpg`,
    `${import.meta.env.BASE_URL}images/gallery/paint-correction/IMG_1968.jpeg`,
    `${import.meta.env.BASE_URL}images/gallery/paint-correction/IMG_1969.jpeg`,
    `${import.meta.env.BASE_URL}images/gallery/paint-correction/IMG_1970.jpeg`,
  ];

  useEffect(() => {
    let paintCorrectionTimer: number | undefined;
    const start = window.setTimeout(() => {
      paintCorrectionTimer = window.setInterval(() => {
        setPaintCorrectionPreviewIndex((prev) => (prev + 1) % paintCorrectionImages.length);
      }, 3500);
    }, 5000);
    return () => {
      window.clearTimeout(start);
      if (paintCorrectionTimer) window.clearInterval(paintCorrectionTimer);
    };
  }, [paintCorrectionImages.length]);


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

  const openMapChooser = () => {
    setMapChooserOpen(true);
  };

  const openGoogleMaps = () => {
    window.open("https://www.google.com/maps/search/1114+E+Lakota+St,+65714+Nixa,+MO", "_blank", "noopener,noreferrer");
    setMapChooserOpen(false);
  };

  const openAppleMaps = () => {
    window.open("https://maps.apple.com/?address=1114%20E%20Lakota%20St,%20Nixa,%20MO%2065714", "_blank", "noopener,noreferrer");
    setMapChooserOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Mulish'] selection:bg-[#FF1AD8] selection:text-white apex-page">
      <div className="relative z-10">
      {/* Ambient neon bubbles — inside content stack so they stay above section BGs */}
      <div className="page-bubbles" aria-hidden="true">
        {pageBubbles.map((b) => (
          <span
            key={b.id}
            className={`page-bubble ${b.tone}`.trim()}
            style={{
              ["--x" as string]: `${b.x}%`,
              ["--start" as string]: `${b.start}%`,
              ["--size" as string]: `${b.size}px`,
              ["--drift" as string]: `${b.drift}px`,
              ["--dur" as string]: `${b.dur}s`,
              ["--delay" as string]: `${b.delay}s`,
            }}
          />
        ))}
      </div>
      {/* Navigation */}
      <nav
        className={`apex-site-nav fixed top-0 w-full z-50 overflow-visible transition-all duration-300 ${
          isScrolled
            ? "bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 py-3 max-md:pt-[max(0.65rem,env(safe-area-inset-top))]"
            : "bg-transparent py-5 max-md:pt-[max(0.75rem,env(safe-area-inset-top))]"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div
              className="brand-logo-nav relative z-10 flex items-center cursor-pointer shrink-0"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
            >
              <BrandLogo
                variant="nav"
                priority
                className="brand-logo-nav__mark h-14 md:h-16 lg:h-[4.25rem] w-auto max-w-[7.5rem] md:max-w-[9.5rem] object-contain opacity-100"
              />
              <span className="brand-logo-nav__sheen" aria-hidden="true" />
            </div>

            <div className="hidden md:flex items-center gap-2.5 lg:gap-3.5 min-w-0">
              <LanguageToggle className="shrink-0" />
              <a
                href="tel:417-527-6165"
                className="inline-flex items-center gap-1.5 text-[11px] lg:text-xs font-semibold text-white hover:text-[#00E5FF] transition-colors whitespace-nowrap shrink-0"
                aria-label="Call Apex Detailing"
              >
                <Phone className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>{t("nav.call")}</span>
              </a>
              {NAV_ITEMS.map((item) => {
                const href =
                  item.kind === "path"
                    ? `${import.meta.env.BASE_URL}${item.path}`
                    : `#${item.id}`;
                return (
                  <a
                    key={item.id}
                    href={href}
                    onClick={(e) => {
                      if (item.kind === "path") return;
                      e.preventDefault();
                      scrollToSection(item.id);
                    }}
                    className={`font-semibold text-[11px] lg:text-xs tracking-wide uppercase transition-colors relative group whitespace-nowrap ${
                      activeSection === item.id
                        ? "text-white header-shine"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {t(`nav.${item.id}`)}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FF1AD8] via-[#9D00FF] to-[#00E5FF] transition-all duration-300 group-hover:w-full" />
                  </a>
                );
              })}
              <a
                href={bookingUrl()}
                onClick={goBookNow}
                className="btn-cyber btn-cyber-sm whitespace-nowrap shrink-0"
              >
                <span>{t("nav.book")}</span>
              </a>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2 focus:outline-none drop-shadow-[0_0_10px_rgba(157,0,255,0.65)]"
                aria-label={t("nav.menu")}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`md:hidden fixed left-0 right-0 w-full bg-[#0a0a0a] border-b border-white/10 transition-all duration-300 ease-in-out overflow-hidden z-40 top-[calc(5rem+env(safe-area-inset-top))] ${
            mobileMenuOpen
              ? "max-h-[500px] opacity-100 py-4 pointer-events-auto"
              : "max-h-0 opacity-0 py-0 pointer-events-none invisible"
          }`}
        >
          <div className="flex flex-col space-y-4 px-6">
            <LanguageToggle />
            {NAV_ITEMS.map((item) => {
              const href =
                item.kind === "path"
                  ? `${import.meta.env.BASE_URL}${item.path}`
                  : `#${item.id}`;
              return (
                <a
                  key={item.id}
                  href={href}
                  onClick={(e) => {
                    if (item.kind === "path") {
                      setMobileMenuOpen(false);
                      return;
                    }
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className="text-left text-gray-300 hover:text-white font-semibold text-lg tracking-wider uppercase"
                >
                  {t(`nav.${item.id}`)}
                </a>
              );
            })}
            <a
              href={bookingUrl()}
              onClick={goBookNow}
              className="btn-cyber btn-cyber-block mt-4"
            >
              <span>{t("nav.book")}</span>
            </a>
          </div>
        </div>
      </nav>

      <ApexHero
        bookingHref={BOOKING_LINK}
        giftHref={`${import.meta.env.BASE_URL}gift-cards`}
        reviewsHref={GOOGLE_REVIEWS_LINK}
        onExplore={(e) => {
          e.preventDefault();
          scrollToSection("services");
        }}
      />
      <HeroDip />
      <EliteServicesSection addons={<AddonsSection />} />
      <HeroDip />

      {/* How It Works */}
      <section id="how" className="apex-how pt-6 pb-14 sm:pt-8 sm:pb-16 relative bg-[#050505] section-pink-wash apex-cv">
        <div className="container mx-auto px-4 sm:px-5 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-9">
            <h2 className="text-sm font-bold tracking-widest text-[#FF1AD8] uppercase mb-3">
              {t("how.kicker")}
            </h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight font-display">
              {t("how.title")}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF1AD8] via-[#9D00FF] to-[#00E5FF]">
                {t("how.titleAccent")}
              </span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto w-full">
            {[
              {
                step: "01",
                title: t("how.1.title"),
                desc: t("how.1.desc"),
                icon: <Clock className="apex-how__icon text-[#00E5FF]" strokeWidth={1.75} aria-hidden="true" />,
              },
              {
                step: "02",
                title: t("how.2.title"),
                desc: t("how.2.desc"),
                icon: <Sparkles className="apex-how__icon text-[#FF1AD8]" strokeWidth={1.75} aria-hidden="true" />,
              },
              {
                step: "03",
                title: t("how.3.title"),
                desc: t("how.3.desc"),
                icon: <Car className="apex-how__icon text-[#00E5FF]" strokeWidth={1.75} aria-hidden="true" />,
              },
            ].map((s) => (
              <div key={s.step} className="apex-how__card">
                <div className="apex-how__num">{s.step}</div>
                <div className="apex-how__icon-wrap">{s.icon}</div>
                <h4 className="apex-how__title">{s.title}</h4>
                <p className="apex-how__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <HeroDip />

      {/* About Section */}
      <section id="about" className="apex-about relative bg-[#050505] section-pink-wash apex-cv">
        <div className="apex-about__particles" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="apex-about__grid">
            <div className="apex-about__media order-2 lg:order-1 relative">
              <div className="apex-about__photo aspect-[4/5] rounded-2xl overflow-hidden relative group">
                {aboutImages.map((img, idx) => (
                  <OptimizedImage
                    key={idx}
                    src={img}
                    alt={`About image ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-opacity duration-1000 ease-in-out"
                    style={{
                      opacity: idx === aboutImageIdx ? 1 : 0,
                    }}
                    loading="lazy"
                    decoding="async"
                  />
                ))}
                <div
                  className="absolute inset-0 bg-gradient-to-tr from-[#FF1AD8]/25 to-[#00E5FF]/25 group-hover:from-[#FF1AD8]/40 group-hover:to-[#00E5FF]/40 z-10 transition-all duration-700"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent z-20">
                  <div className="inline-flex items-center gap-3 bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl border border-[#D4AF37]/30">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center overflow-hidden"
                        >
                          <Star className="w-5 h-5 text-[#E8C547]" fill="currentColor" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="font-black text-white text-lg leading-tight">⭐⭐⭐⭐⭐</p>
                      <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                        {t("about.rated")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="apex-about__copy order-1 lg:order-2">
              <h2 className="apex-about__kicker">{t("about.kicker")}</h2>
              <h3 className="apex-about__title font-display">
                <span className="apex-about__title-main">{t("about.title")}</span>{" "}
                <span className="apex-about__title-accent">{t("about.titleAccent")}</span>
              </h3>

              <div className="apex-about__body">
                <p>{t("about.p1")}</p>
                <p>
                  {t("about.p2a")}
                  <strong className="apex-about__trust apex-about__trust--gold">{t("about.p2b")}</strong>
                  {t("about.p2c")}
                </p>
                <p>
                  {t("about.p3a")}
                  <span className="apex-about__trust">{t("about.p3b")}</span>
                  {t("about.p3c")}
                  <span className="apex-about__trust">{t("about.p3d")}</span>
                  {t("about.p3e")}
                  <span className="apex-about__trust">{t("about.p3f")}</span>
                  {t("about.p3g")}
                </p>
                <p className="apex-about__verse">{t("about.verse")}</p>
                <p>{t("about.p4")}</p>
                <p>
                  {t("about.p5a")}
                  <span className="apex-about__trust">{t("about.p5b")}</span>
                  {t("about.p5c")}
                </p>
                <p className="apex-about__closer">
                  <strong>{t("about.p6")}</strong>
                </p>

                <div className="apex-about__founder">
                  <div className="apex-about__founder-photo">
                    <OptimizedImage
                      src={imageUrl("owner-michail.jpg")}
                      alt="Michail Gurov, Founder of Apex Detailing"
                      className="apex-about__founder-img"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="apex-about__founder-copy">
                    <p className="apex-about__founder-eyebrow">{t("about.meet")}</p>
                    <p className="apex-about__founder-name">Michail Gurov</p>
                    <p className="apex-about__founder-role">{t("about.role")}</p>
                    <p className="apex-about__founder-tag">{t("about.founderTag")}</p>
                  </div>
                </div>
              </div>

              <div className="apex-about__perks">
                {[
                  {
                    title: t("about.perk1.title"),
                    desc: t("about.perk1.desc"),
                    icon: <Sparkles className="apex-about__perk-icon" strokeWidth={2} />,
                  },
                  {
                    title: t("about.perk2.title"),
                    desc: t("about.perk2.desc"),
                    icon: <Shield className="apex-about__perk-icon" strokeWidth={2} />,
                  },
                  {
                    title: t("about.perk3.title"),
                    desc: t("about.perk3.desc"),
                    icon: <Clock className="apex-about__perk-icon" strokeWidth={2} />,
                  },
                  {
                    title: t("about.perk4.title"),
                    desc: t("about.perk4.desc"),
                    icon: <Award className="apex-about__perk-icon" strokeWidth={2} />,
                  },
                ].map((item, i) => (
                  <div key={i} className="apex-about__perk">
                    <div className="apex-about__perk-icon-wrap" aria-hidden="true">
                      {item.icon}
                    </div>
                    <div>
                      <h5 className="apex-about__perk-title">{item.title}</h5>
                      <p className="apex-about__perk-desc">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <HeroDip />

      {/* Before/After Slider Section */}
      <section
        id="before-after"
        className={`apex-ba relative bg-[#050505] section-pink-wash apex-cv${baVisible ? " is-visible" : ""}`}
      >
        <div className="apex-ba__particles" aria-hidden="true">
          <span /><span /><span /><span /><span /><span />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <header className="apex-ba__header">
            <h2 className="apex-ba__kicker">{t("ba.kicker")}</h2>
            <h3 className="apex-ba__title font-display">
              {t("ba.title")}{" "}
              <span className="apex-ba__title-accent">{t("ba.titleAccent")}</span>
            </h3>
          </header>

          <div className="apex-ba__stage">
            <div
              className="apex-ba__compare"
              onMouseMove={isDraggingSlider ? handleSliderDrag : undefined}
              onMouseDown={() => setIsDraggingSlider(true)}
              onMouseUp={() => setIsDraggingSlider(false)}
              onMouseLeave={() => setIsDraggingSlider(false)}
              onTouchStart={(e) => {
                sliderTouchRef.current = {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY,
                  dragging: false,
                };
              }}
              onTouchEnd={() => {
                sliderTouchRef.current = null;
                setIsDraggingSlider(false);
              }}
              onTouchMove={(e) => {
                const start = sliderTouchRef.current;
                if (!start) return;
                const dx = Math.abs(e.touches[0].clientX - start.x);
                const dy = Math.abs(e.touches[0].clientY - start.y);
                if (!start.dragging) {
                  if (dy > dx && dy > 8) return;
                  if (dx <= 8) return;
                  start.dragging = true;
                  setIsDraggingSlider(true);
                }
                handleSliderDrag(e);
              }}
              onClick={handleSliderDrag}
            >
              <OptimizedImage
                src={beforeAfterPairs[currentSliderIndex].after}
                alt="After"
                className="apex-ba__img apex-ba__img--after"
                style={{ opacity: sliderFading ? 0 : 1 }}
                loading="lazy"
                decoding="async"
              />

              <div
                className="apex-ba__before-clip"
                style={{ width: `${sliderPosition}%`, opacity: sliderFading ? 0 : 1 }}
              >
                <OptimizedImage
                  src={beforeAfterPairs[currentSliderIndex].before}
                  alt="Before"
                  className="apex-ba__img apex-ba__img--before"
                  style={{ width: `${100 / (Math.max(sliderPosition, 0.01) / 100)}%` }}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div
                className={`apex-ba__handle${isDraggingSlider ? " is-dragging" : ""}`}
                style={{ left: `${sliderPosition}%` }}
              >
                <span className="apex-ba__handle-line" />
                <span className="apex-ba__handle-knob" aria-hidden="true">
                  <ChevronsLeftRight className="apex-ba__handle-icon" strokeWidth={2.2} />
                </span>
              </div>

              <span
                className="apex-ba__label apex-ba__label--before"
                style={{ opacity: sliderPosition > 12 ? 1 : 0 }}
              >
                {t("ba.before")}
              </span>
              <span
                className="apex-ba__label apex-ba__label--after"
                style={{ opacity: sliderPosition < 88 ? 1 : 0 }}
              >
                {t("ba.after")}
              </span>
            </div>

            <div className="apex-ba__meta">
              <h4 className="apex-ba__service">{beforeAfterPairs[currentSliderIndex].title}</h4>
              <p className="apex-ba__desc">{t(beforeAfterPairs[currentSliderIndex].descKey)}</p>
            </div>

            <div className="apex-ba__controls">
              <button
                type="button"
                className="apex-ba__nav-btn"
                onClick={() =>
                  goToBaSlide((currentSliderIndex - 1 + beforeAfterPairs.length) % beforeAfterPairs.length)
                }
              >
                ← {t("ba.prev")}
              </button>
              <button
                type="button"
                className="apex-ba__nav-btn"
                onClick={() => goToBaSlide((currentSliderIndex + 1) % beforeAfterPairs.length)}
              >
                {t("ba.next")} →
              </button>
            </div>

            <div className="apex-ba__dots" role="tablist" aria-label="Before and after slides">
              {beforeAfterPairs.map((pair, idx) => (
                <button
                  key={`${pair.title}-${idx}`}
                  type="button"
                  role="tab"
                  aria-selected={idx === currentSliderIndex}
                  aria-label={`${pair.title} ${idx + 1}`}
                  className={`apex-ba__dot${idx === currentSliderIndex ? " is-active" : ""}`}
                  onClick={() => goToBaSlide(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      <HeroDip />

      {/* Gallery Section */}
      <section id="gallery" className="py-24 relative bg-[#050505] section-pink-wash apex-cv">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 sm:mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold tracking-widest text-potential uppercase mb-3">
                {t("gallery.kicker")}
              </h2>
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight font-display">
                {t("gallery.title")}{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF1AD8] via-[#9D00FF] to-[#00E5FF]">
                  {t("gallery.titleAccent")}
                </span>
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 justify-items-center">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer w-full"
                onClick={() => handleGalleryItemClick(item)}
              >
                {"video" in item && item.video ? (
                  <GalleryVideoThumb
                    src={item.video}
                    poster={item.thumbnail}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : item.id === 1 ? (
                  <div className="absolute inset-0">
                    {paintCorrectionImages.map((src, idx) => {
                      const isNear =
                        idx === paintCorrectionPreviewIndex ||
                        idx === (paintCorrectionPreviewIndex + 1) % paintCorrectionImages.length;
                      if (!isNear) return null;
                      return (
                        <OptimizedImage
                          key={src}
                          src={src}
                          alt="Paint Correction"
                          className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-opacity duration-700 ${paintCorrectionPreviewIndex === idx ? "opacity-100" : "opacity-0"}`}
                          style={{ filter: "brightness(1.1) contrast(1.1)" }}
                          loading="lazy"
                          decoding="async"
                        />
                      );
                    })}
                  </div>
                ) : item.thumbnail ? (
                  <OptimizedImage
                    src={item.thumbnail}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    style={{ filter: "brightness(1.15) contrast(1.15)" }}
                    loading="lazy"
                    decoding="async"
                  />
                ) : item.images && item.images.length > 0 ? (
                  <OptimizedImage
                    src={typeof item.images[0] === "string" ? item.images[0] : item.images[0].src}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    style={{ filter: "brightness(1.15) contrast(1.15)" }}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-80 group-hover:scale-105 transition-transform duration-700`}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {item.beforeAfter ? (
                    <span className="inline-block px-3 py-1 bg-[#00E5FF] text-black font-black text-xs uppercase tracking-widest rounded mb-3 opacity-85">
                      Results before and after
                    </span>
                  ) : item.id === 1 && (
                    <span className="inline-block px-3 py-1 bg-[#00E5FF] text-black font-black text-xs uppercase tracking-widest rounded mb-3 opacity-85">
                      Finished results
                    </span>
                  )}
                  <h4 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#FF1AD8] via-[#9D00FF] to-[#00E5FF] opacity-85" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8)) drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}>{item.title}</h4>
                  {item.images && item.images.length > 1 && (
                    <p className="text-xs text-gray-300 mt-2">
                      {item.images.length} {item.images.length === 1 ? 'result' : 'results'}
                    </p>
                  )}
                  <div className="w-12 h-1 bg-gradient-to-r from-[#FF1AD8] via-[#9D00FF] to-[#00E5FF] mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
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
              className="btn-cyber btn-cyber-lg group"
            >
              <Instagram className="w-6 h-6" />
              <span>Follow @apexdetailing_sf</span>
            </a>
          </div>
        </div>
      </section>
      <HeroDip />

      {/* Gallery Lightbox Modal */}
      {selectedGalleryItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedGalleryItem(null)}
        >
          <button
            onClick={() => setSelectedGalleryItem(null)}
            className="absolute top-4 right-20 md:top-6 md:right-24 text-white hover:text-[#00E5FF] transition-colors z-10 p-1"
            aria-label="Close"
          >
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>


          <div 
            className={`relative flex items-center justify-center ${isFullscreen ? 'w-screen h-screen' : 'max-w-4xl max-h-[90vh]'}`} 
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
            onTouchEnd={(e) => {
              setTouchEnd(e.changedTouches[0].clientX);
              const distance = touchStart - e.changedTouches[0].clientX;
              if (distance > 50 && selectedGalleryItem?.images && currentImageIndex < selectedGalleryItem.images.length - 1) {
                nextImage();
              }
              if (distance < -50 && currentImageIndex > 0) {
                prevImage();
              }
            }}
          >
            {"video" in selectedGalleryItem && selectedGalleryItem.video && !selectedGalleryItem.images ? (
              <video
                src={selectedGalleryItem.video}
                className={`${isFullscreen ? "w-full h-full" : "w-full max-h-[80vh]"} object-contain ${!isFullscreen && "rounded-xl"}`}
                controls
                playsInline
                muted
                autoPlay
                loop
                poster={"thumbnail" in selectedGalleryItem ? selectedGalleryItem.thumbnail : undefined}
              />
            ) : selectedGalleryItem.images && selectedGalleryItem.images.length > 0 ? (
              <>
                <OptimizedImage
                  src={typeof selectedGalleryItem.images[currentImageIndex] === 'string' ? selectedGalleryItem.images[currentImageIndex] : selectedGalleryItem.images[currentImageIndex].src}
                  alt={`${selectedGalleryItem.title} - Image ${currentImageIndex + 1}`}
                  className={`${isFullscreen ? 'w-full h-full' : 'w-full h-full'} object-contain ${!isFullscreen && 'rounded-xl'} transition-opacity duration-200`}
                  style={{ filter: 'brightness(0.95) contrast(1.05)', opacity: isImageTransitioning ? 0 : 1 }}
                  loading="eager"
                  decoding="async"
                />
                
                {/* Before/After Label */}
                {selectedGalleryItem.beforeAfter && typeof selectedGalleryItem.images[currentImageIndex] === 'object' && (
                  <div className="absolute top-6 left-6 bg-gradient-to-r from-[#FF1AD8] via-[#9D00FF] to-[#00E5FF] text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg opacity-85">
                    {selectedGalleryItem.images[currentImageIndex].label}
                  </div>
                )}
                
                {/* Previous Button */}
                {currentImageIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 md:left-6 top-1/2 transform -translate-y-1/2 text-white hover:text-[#00E5FF] active:text-[#00E5FF] transition-colors z-50 bg-black/50 hover:bg-black/70 active:bg-black/80 p-3 md:p-4 rounded-full cursor-pointer min-w-12 h-12 md:min-w-14 md:h-14 flex items-center justify-center"
                    aria-label="Previous image"
                    type="button"
                  >
                    <svg className="w-6 h-6 md:w-8 md:h-8 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Next Button */}
                {selectedGalleryItem.images.length > 1 && currentImageIndex < selectedGalleryItem.images.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2 text-white hover:text-[#00E5FF] active:text-[#00E5FF] transition-colors z-50 bg-black/50 hover:bg-black/70 active:bg-black/80 p-3 md:p-4 rounded-full cursor-pointer min-w-12 h-12 md:min-w-14 md:h-14 flex items-center justify-center"
                    aria-label="Next image"
                    type="button"
                  >
                    <svg className="w-6 h-6 md:w-8 md:h-8 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section id="testimonials" className="py-24 relative bg-[#050505] section-pink-wash apex-cv">
        <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-[#00E5FF]/10 rounded-full mix-blend-screen filter blur-[150px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-[#FF1AD8] uppercase mb-3">
              {t("testimonials.kicker")}
            </h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight font-display">
              {t("testimonials.title")}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF1AD8] via-[#9D00FF] to-[#00E5FF]">
                {t("testimonials.titleAccent")}
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
                    <Star key={star} className="w-5 h-5 text-[#E8C547]" fill="currentColor" />
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
      <HeroDip />

      {/* Google Reviews Showcase */}
      <section id="reviews" className="py-24 relative bg-[#050505] section-pink-wash apex-cv">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#FF1AD8]/10 rounded-full mix-blend-screen filter blur-[120px] -translate-y-1/2" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-sm font-bold tracking-widest text-potential uppercase mb-3">
              {t("reviews.kicker")}
            </h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 font-display">
              {t("reviews.title")}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF1AD8] via-[#9D00FF] to-[#00E5FF]">
                {t("reviews.titleAccent")}
              </span>
            </h3>
            <p className="text-gray-400 text-lg mb-8">
              {t("reviews.sub")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                { rating: "5.0", reviews: t("reviews.excellent"), description: t("reviews.rating") },
                { rating: "100%", reviews: t("reviews.positive"), description: t("reviews.customerRating") },
                { rating: "5h", reviews: t("reviews.response"), description: t("reviews.supportTime") },
              ].map((stat, i) => (
                <div key={i} className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-colors">
                  <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#FF1AD8] via-[#9D00FF] to-[#00E5FF] mb-2">
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
                      className={`w-4 h-4 ${star <= review.rating ? "text-[#E8C547]" : "text-gray-600"}`}
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
      <HeroDip />

      {/* Service Area */}
      <section id="area" className="py-20 sm:py-24 relative bg-[#050505] section-pink-wash apex-cv">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00E5FF]/10 rounded-full mix-blend-screen filter blur-[120px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-sm font-bold tracking-widest text-potential uppercase mb-3">
              {t("area.kicker")}
            </h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 font-display">
              {t("area.title")}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF1AD8] via-[#9D00FF] to-[#00E5FF]">
                {t("area.titleAccent")}
              </span>
            </h3>
            <p className="text-gray-400 text-lg">
              {t("area.sub")}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {serviceCities.map((city) => (
                <div
                  key={city}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#00E5FF]/50 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span className="text-sm font-bold text-gray-200">{city}, MO</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="tel:417-527-6165"
                className="flex items-center gap-3 p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#FF1AD8]/50 transition-colors"
              >
                <Phone className="w-5 h-5 text-[#FF1AD8]" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Call</p>
                  <p className="text-white font-bold">417-527-6165</p>
                </div>
              </a>
              <a
                href="https://www.google.com/maps/search/1114+E+Lakota+St,+65714+Nixa,+MO"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#00E5FF]/50 transition-colors"
              >
                <MapPin className="w-5 h-5 text-[#00E5FF]" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Shop</p>
                  <p className="text-white font-bold">1114 E Lakota St, Nixa</p>
                </div>
              </a>
              <div className="flex items-center gap-3 p-5 rounded-xl bg-white/5 border border-white/10">
                <Clock className="w-5 h-5 text-[#FF1AD8]" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{t("footer.hours")}</p>
                  <p className="text-white font-bold">Mon–Sat · 7am – 6pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <HeroDip />

      {/* FAQ Section */}
      <section id="faq" className="py-20 sm:py-24 relative bg-[#050505] section-pink-wash apex-cv">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-sm font-bold tracking-widest text-[#FF1AD8] uppercase mb-3">
              {t("faq.kicker")}
            </h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight font-display">
              {t("faq.title")}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF1AD8] via-[#9D00FF] to-[#00E5FF]">
                {t("faq.titleAccent")}
              </span>
            </h3>
          </div>

          {/* Category pills */}
          <div className="flex items-center justify-center gap-3 mb-10">
            {(
              [
                { id: "general", labelKey: "faq.general" },
                { id: "paint", labelKey: "faq.paint" },
                { id: "ceramic", labelKey: "faq.ceramic" },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveFaqCategory(cat.id);
                  setOpenFaq(null);
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 border ${
                  activeFaqCategory === cat.id
                    ? "bg-[#FF1AD8] text-white border-transparent shadow-[0_0_14px_rgba(255,26,216,0.35)]"
                    : "bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                {t(cat.labelKey)}
              </button>
            ))}
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs
              .filter((faq) => faq.category === activeFaqCategory)
              .map((faq, i) => {
                const key = `${activeFaqCategory}-${i}`;
                const isOpen = openFaq === key;
                return (
                  <div
                    key={key}
                    className={`rounded-xl border backdrop-blur-sm transition-colors ${
                      isOpen ? "bg-white/10 border-[#00E5FF]/40" : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : key)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="font-bold text-white text-base sm:text-lg">{t(faq.qKey)}</span>
                      <ChevronRight
                        className={`w-5 h-5 shrink-0 text-[#00E5FF] transition-transform duration-300 ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-gray-300 text-sm sm:text-base leading-relaxed">
                          {t(faq.aKey)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
      <HeroDip />

      {/* CTA Section */}
      <section id="cta" className="apex-cta relative bg-[#050505] section-pink-wash apex-cv">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="apex-cta__panel">
            <div className="apex-cta__glow" aria-hidden="true" />

            <div className="apex-cta__inner">
              <h2 className="apex-cta__title font-display">
                <span className="apex-cta__title-line">
                  {t("cta.titleLead")}{" "}
                  <span className="apex-cta__title-apex">{t("cta.titleApex")}</span>
                </span>
                <span className="apex-cta__title-line">{t("cta.titleEnd")}</span>
              </h2>

              <p className="apex-cta__sub">{t("cta.sub")}</p>

              <aside className="apex-cta__notice" aria-label={t("cta.important")}>
                <Info className="apex-cta__notice-icon" aria-hidden="true" strokeWidth={2.2} />
                <div className="apex-cta__notice-copy">
                  <p className="apex-cta__notice-label">{t("cta.important")}</p>
                  <p className="apex-cta__notice-text">{t("cta.noteLine1")}</p>
                  <p className="apex-cta__notice-text">{t("cta.noteLine2")}</p>
                </div>
              </aside>

              <a
                href={bookingUrl()}
                onClick={goBookNow}
                className="btn-cyber btn-cyber-xl apex-cta__btn group"
              >
                <span>{t("cta.book")}</span>
                <ChevronRight className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </section>
      <HeroDip />

      {/* Footer */}
      <footer id="contact" className="apex-footer relative bg-[#050505] apex-cv">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="apex-footer__grid">
            <div className="apex-footer__brand">
              <div className="apex-footer__logo">
                <BrandLogo
                  variant="footer"
                  className="relative z-10 h-20 w-auto max-w-[10rem] object-contain opacity-100"
                  style={{
                    filter: "drop-shadow(0 0 12px rgba(255,26,216,0.45))",
                  }}
                />
              </div>
              <p className="apex-footer__blurb">{t("footer.blurb")}</p>
              <div className="apex-footer__social">
                <a
                  href={INSTAGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apex-footer__social-btn"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href={FACEBOOK_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apex-footer__social-btn"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href={GOOGLE_REVIEWS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apex-footer__social-btn"
                  aria-label="Google Reviews"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="apex-footer__col">
              <h4 className="apex-footer__heading">{t("footer.links")}</h4>
              <ul className="apex-footer__list">
                {NAV_ITEMS.map((item) => {
                  const href =
                    item.kind === "path"
                      ? `${import.meta.env.BASE_URL}${item.path}`
                      : `#${item.id}`;
                  return (
                    <li key={item.id}>
                      <a
                        href={href}
                        onClick={(e) => {
                          if (item.kind === "path") return;
                          e.preventDefault();
                          scrollToSection(item.id);
                        }}
                        className="apex-footer__link"
                      >
                        <ChevronRight className="w-3 h-3 apex-footer__chevron" /> {t(`nav.${item.id}`)}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="apex-footer__col">
              <h4 className="apex-footer__heading">{t("footer.services")}</h4>
              <ul className="apex-footer__list">
                {services.map((service) => (
                  <li key={service.id}>
                    <a href={bookingUrl()} onClick={goBookNow} className="apex-footer__link">
                      <ChevronRight className="w-3 h-3 apex-footer__chevron apex-footer__chevron--pink" />{" "}
                      {t(`pkg.${service.pkg}.title`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="apex-footer__col apex-footer__col--contact">
              <h4 className="apex-footer__heading">{t("footer.contact")}</h4>
              <ul className="apex-footer__contact">
                <li className="apex-footer__contact-row">
                  <MapPin className="apex-footer__contact-icon apex-footer__contact-icon--cyan" />
                  <a
                    href="https://www.google.com/maps/search/1114+E+Lakota+St,+65714+Nixa,+MO"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden md:block apex-footer__contact-text"
                  >
                    <span>Located in the Nixa<br />1114 E Lakota St, 65714</span>
                  </a>
                  <button
                    onClick={openMapChooser}
                    className="md:hidden apex-footer__contact-text text-left"
                  >
                    <span>Located in the Nixa<br />1114 E Lakota St, 65714</span>
                  </button>
                </li>
                <li className="apex-footer__contact-row">
                  <Phone className="apex-footer__contact-icon apex-footer__contact-icon--pink" />
                  <a href="tel:417-527-6165" className="apex-footer__phone">
                    417-527-6165
                  </a>
                </li>
                <li className="apex-footer__contact-row">
                  <Clock className="apex-footer__contact-icon apex-footer__contact-icon--pink" />
                  <div className="apex-footer__hours">
                    <p className="apex-footer__hours-days">{t("footer.monSat")}</p>
                    <p>{t("footer.hoursTime")}</p>
                    <p className="apex-footer__hours-closed">{t("footer.closedSun")}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="apex-footer__credit">
            <a
              href="https://www.apexwebworx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="apex-footer__credit-link group"
              aria-label="APEX WEB WORX"
            >
              <OptimizedImage
                src={imageUrl("apex-webworx-logo.png")}
                loading="lazy"
                decoding="async"
                alt="APEX WEB WORX"
                className="apex-footer__credit-logo"
                noBlur
              />
              <p className="apex-footer__credit-text">
                {t("footer.designed")}{" "}
                <span className="text-potential font-bold">APEX WEB WORX</span>
              </p>
            </a>
          </div>

          <div className="apex-footer__legal">
            <p className="apex-footer__copy">
              &copy; {new Date().getFullYear()} {t("footer.rights")}
            </p>
            <div className="apex-footer__legal-links">
              <button
                onClick={() => setLegalModal("privacy")}
                className="apex-footer__legal-btn"
              >
                {t("footer.privacy")}
              </button>
              <button
                onClick={() => setLegalModal("terms")}
                className="apex-footer__legal-btn"
              >
                {t("footer.terms")}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile Action Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#050505]/95 backdrop-blur-md border-t border-white/10 px-3 py-2 grid grid-cols-2 gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] [padding-left:max(0.75rem,env(safe-area-inset-left))] [padding-right:max(0.75rem,env(safe-area-inset-right))] [padding-bottom:max(0.5rem,env(safe-area-inset-bottom))]">
        <a
          href="tel:417-527-6165"
          className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-white/10 border border-white/15 font-bold text-sm text-white"
          aria-label="Call Apex Detailing"
        >
          <Phone className="w-4 h-4 text-[#00E5FF]" />
          {t("nav.call")}
        </a>
        <a
          href={bookingUrl()}
          onClick={goBookNow}
          className="btn-cyber btn-cyber-sm btn-cyber-block"
        >
          <span>{t("nav.book")}</span>
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
      {/* Spacer so sticky bar doesn't overlap content on mobile */}
      <div className="md:hidden h-[calc(4.75rem+env(safe-area-inset-bottom))]" aria-hidden="true" />

      {/* Legal Modal: Privacy / Terms */}
      {legalModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 py-8"
          onClick={() => setLegalModal(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#111] border border-white/10 p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-display">
                {legalModal === "privacy" ? "Privacy Policy" : "Terms of Service"}
              </h3>
              <button
                onClick={() => setLegalModal(null)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-6">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>

            {legalModal === "privacy" ? (
              <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <p>
                  Apex Detailing ("we", "us") respects your privacy. This page explains what limited information we collect when you use this site or contact us, and how we use it.
                </p>
                <div>
                  <h4 className="font-black text-white text-base mb-1">Information We Collect</h4>
                  <p>We only collect information you voluntarily provide — your name, phone, email, vehicle details, and appointment preferences when you book or contact us.</p>
                </div>
                <div>
                  <h4 className="font-black text-white text-base mb-1">How We Use It</h4>
                  <p>To schedule and complete your service, send appointment reminders, follow up on the work performed, and respond to your questions. We do not sell or share your information with third parties for marketing.</p>
                </div>
                <div>
                  <h4 className="font-black text-white text-base mb-1">Cookies & Analytics</h4>
                  <p>This site may use basic analytics cookies to understand traffic. You can disable cookies in your browser at any time.</p>
                </div>
                <div>
                  <h4 className="font-black text-white text-base mb-1">Contact</h4>
                  <p>Questions about your data? Call <a href="tel:417-527-6165" className="text-[#00E5FF] underline">417-527-6165</a> or message us on Instagram or Facebook.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <p>
                  By booking a service or using this site, you agree to the following terms.
                </p>
                <div>
                  <h4 className="font-black text-white text-base mb-1">Booking & Scheduling</h4>
                  <p>All scheduling must be completed before your visit through our online booking. Please arrive on time. Significant delays may require rescheduling.</p>
                </div>
                <div>
                  <h4 className="font-black text-white text-base mb-1">Pricing</h4>
                  <p>Listed prices are starting points and reflect standard vehicle conditions. Final pricing is confirmed at inspection and depends on vehicle size, condition, and any add-on services.</p>
                </div>
                <div>
                  <h4 className="font-black text-white text-base mb-1">Cancellations</h4>
                  <p>Please give at least 24 hours' notice for cancellations or reschedules so we can offer the slot to other customers.</p>
                </div>
                <div>
                  <h4 className="font-black text-white text-base mb-1">Vehicle Condition & Liability</h4>
                  <p>We take great care with every vehicle. Customers are responsible for removing valuables before service. Pre-existing damage, mechanical issues, or worn materials are not the responsibility of Apex Detailing.</p>
                </div>
                <div>
                  <h4 className="font-black text-white text-base mb-1">Satisfaction</h4>
                  <p>If something isn't right, contact us within 24 hours of service and we'll make it right.</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setLegalModal(null)}
              className="btn-cyber btn-cyber-block mt-6"
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      )}

      {mapChooserOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#111] border border-white/10 p-6 text-center shadow-2xl">
            <h3 className="text-xl font-black uppercase tracking-wider mb-2">Open Maps</h3>
            <p className="text-gray-400 text-sm mb-6">Choose your preferred map app.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={openGoogleMaps}
                className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#00E5FF] hover:text-white transition-colors font-bold"
              >
                Google Maps
              </button>
              <button
                onClick={openAppleMaps}
                className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#FF1AD8] hover:text-white transition-colors font-bold"
              >
                Apple Maps
              </button>
            </div>
            <button
              onClick={() => setMapChooserOpen(false)}
              className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
