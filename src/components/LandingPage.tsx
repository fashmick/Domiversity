import React, { useState, useEffect, useRef } from 'react';
import { Search, Shield, HelpCircle, GraduationCap, CheckCircle, ArrowRight, Star, DollarSign, PenTool, ClipboardCheck, Compass, Home, ShieldAlert, Menu, X } from 'lucide-react';
import { School, User } from '../types';
import { formatNaira } from '../utils';
import SchoolSelect from './SchoolSelect';
import { motion, AnimatePresence } from 'motion/react';
import DormiversityLogo from './DormiversityLogo';

const CAROUSEL_SLIDES = [
  {
    title: "No Agent Wahala!",
    subtitle: "Direct Landlord Escrow • Zero Stress",
    description: "Tired of outrageous agency fees, fake caretakers, and duplicate key scams? Dormiversity cuts out the fraudulent middlemen. Rent directly from vetted landlords with our robust secure escrow protection.",
    badge: "No Middlemen",
    badgeColor: "bg-red-500/20 text-red-200 border-red-500/30",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1200",
    role: "BOTH"
  },
  {
    title: "100% Secure Student Escrow",
    subtitle: "Rent Held Safe From Fraud",
    description: "Your rent stays in a secure holding subaccount. The maximum window for inspection is 3 days after payment, keeping your funds fully protected from scams.",
    badge: "Escrow Guarantee",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1200",
    role: "STUDENT"
  },
  {
    title: "Government-Verified Landlords",
    subtitle: "Zero Fake Listings, Zero Scams",
    description: "Every landlord goes through strict NIN government-issued ID and property document auditing before listing, fully eliminating ghost properties and duplicate keys.",
    badge: "Audited Listers",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200",
    role: "LANDLORD"
  },
  {
    title: "Accredited Campus Vetting",
    subtitle: "Hire a Student Inspector for ₦5,000",
    description: "Not in town yet? Order a trusted student inspector to physically visit the room, run water taps, check power stability, and upload real photographic reports.",
    badge: "Room Vetted First",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200",
    role: "INSPECTOR"
  },
  {
    title: "Smart Roommate Finder",
    subtitle: "Split Yearly Rent Costs Easily",
    description: "Dormiversity connects verified tertiary students looking to co-rent. Filter by study habits, clean lifestyles, and budgets, and publish cohabitant flyer spaces.",
    badge: "Social Matchmaking",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200",
    role: "STUDENT"
  }
];

const STUDENT_STEPS = [
  {
    badge: "01. Search & Select",
    title: "Find Your Perfect Fit",
    description: "Browse safe hostels near your institution. Filter by gender restrictions, room type, budget, and exact distance to campus.",
    icon: Search,
    color: "amber",
    tagLine: "Smart Discovery",
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent"
  },
  {
    badge: "02. Secure Escrow",
    title: "100% Vetted Listings",
    description: "Book a physical visit or pay a flat ₦5,000 for a vetted Roomly Inspector to visit the room and upload clear photos and reviews before your booking settles.",
    icon: Shield,
    color: "amber",
    tagLine: "Physical Verification",
    gradient: "from-amber-500/10 via-yellow-500/5 to-transparent"
  },
  {
    badge: "03. Move In & Release",
    title: "Risk-Free Escrow",
    description: "Pay rent safely via Paystack. Your money stays in escrow. You have a maximum of 3 days after payment to inspect and release the funds or open a dispute.",
    icon: CheckCircle,
    color: "amber",
    tagLine: "Financial Security",
    gradient: "from-amber-500/10 via-emerald-500/5 to-transparent"
  }
];

const LANDLORD_STEPS = [
  {
    badge: "01. Onboard & KYC",
    title: "Verified Host Status",
    description: "Upload a valid government ID (NIN, driver license) and proof of property ownership. Our Admin reviews and approves you to keep our student community 100% safe.",
    icon: ShieldAlert,
    color: "emerald",
    tagLine: "KYC Gate",
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent"
  },
  {
    badge: "02. Publish Listings",
    title: "Connect with Thousands",
    description: "List single or shared student rooms, specify house rules, and upload clear photos. Chat with interested students via our secure, scam-free in-app message system.",
    icon: Home,
    color: "emerald",
    tagLine: "Instant Reach",
    gradient: "from-emerald-500/10 via-green-500/5 to-transparent"
  },
  {
    badge: "03. Secure Payouts",
    title: "Direct Rent Settlements",
    description: "Students pay immediately upon Booking. Funds are safely locked. Once the student checks in or the automatic timer expires, receive 90% of your rent straight to your bank account.",
    icon: DollarSign,
    color: "emerald",
    tagLine: "Protected Revenue",
    gradient: "from-emerald-500/10 via-lime-500/5 to-transparent"
  }
];

const INSPECTOR_STEPS = [
  {
    badge: "01. Register & Enroll",
    title: "Independent Agent Network",
    description: "Register as an independent Inspector. Select the tertiary institutions or areas where you actively live or study. Supply a valid ID for admin approval.",
    icon: GraduationCap,
    color: "blue",
    tagLine: "Student Network",
    gradient: "from-blue-500/10 via-indigo-500/5 to-transparent"
  },
  {
    badge: "02. Site Visits",
    title: "Validate Hostels Locally",
    description: "Claim job alerts from students requesting an inspection. Visit the hostel locally, verify details (borehole water, walls, security), and take high-resolution photos.",
    icon: Compass,
    color: "blue",
    tagLine: "Verification Jobs",
    gradient: "from-blue-500/10 via-cyan-500/5 to-transparent"
  },
  {
    badge: "03. Earn NGN 4,500",
    title: "Guaranteed Quick Cash",
    description: "Submit the checklists and written reports online. Once uploaded, earn your 90% share (₦4,500) from the student inspection fee paid directly to your account.",
    icon: DollarSign,
    color: "blue",
    tagLine: "Fast Rewards",
    gradient: "from-blue-500/10 via-violet-500/5 to-transparent"
  }
];

interface LandingPageProps {
  schools: School[];
  users: User[];
  onSelectRole: (role: 'STUDENT' | 'LANDLORD' | 'INSPECTOR' | 'ADMIN', userId: string) => void;
  onSearchSchool: (schoolId: string) => void;
}

export default function LandingPage({ schools, users, onSelectRole, onSearchSchool }: LandingPageProps) {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Active Role State
  const [activeRole, setActiveRole] = useState<'student' | 'landlord' | 'inspector'>('student');

  // Step indices for the 3 pipelines (0, 1, or 2)
  const [studentStep, setStudentStep] = useState(0);
  const [landlordStep, setLandlordStep] = useState(0);
  const [inspectorStep, setInspectorStep] = useState(0);

  // Active step progress (0 to 100) over 6 seconds
  const [stepProgress, setStepProgress] = useState(0);

  // Helper to change active role
  const snapToRole = (role: 'student' | 'landlord' | 'inspector') => {
    setStepProgress(0);
    setActiveRole(role);
    if (role === 'student') {
      setStudentStep(0);
    } else if (role === 'landlord') {
      setLandlordStep(0);
    } else {
      setInspectorStep(0);
    }
  };

  // Handle active step progression (6-second auto transition)
  useEffect(() => {
    const intervalTime = 6000; // 6 seconds
    const stepTime = 50; // update progress every 50ms (20fps) for super smooth indicators
    const totalSteps = intervalTime / stepTime;
    let elapsedSteps = 0;

    const interval = setInterval(() => {
      elapsedSteps += 1;
      const progress = (elapsedSteps / totalSteps) * 100;
      setStepProgress(Math.min(progress, 100));

      if (elapsedSteps >= totalSteps) {
        elapsedSteps = 0;
        setStepProgress(0);
        
        if (activeRole === 'student') {
          setStudentStep((prev) => (prev + 1) % 3);
        } else if (activeRole === 'landlord') {
          setLandlordStep((prev) => (prev + 1) % 3);
        } else {
          setInspectorStep((prev) => (prev + 1) % 3);
        }
      }
    }, stepTime);

    return () => {
      clearInterval(interval);
    };
  }, [activeRole]); // Restarts loop whenever user changes role

  // Carousel States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  const handleCarouselSignUp = (role: string) => {
    sessionStorage.setItem('preferred_signup_role', role);
    window.history.pushState({}, '', '/signup');
  };

  // 7s Auto-advance with pause support
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Touch handlers for mobile swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      // Swiped Left
      nextSlide();
    } else if (diff < -50) {
      // Swiped Right
      prevSlide();
    }
    setTouchStart(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSchool) {
      onSearchSchool(selectedSchool);
    }
  };



  const students = users.filter(u => u.role === 'STUDENT');
  const landlords = users.filter(u => u.role === 'LANDLORD');
  const inspectors = users.filter(u => u.role === 'INSPECTOR');
  const admins = users.filter(u => u.role === 'ADMIN');

  return (
    <div className="bg-wood-50 min-h-screen font-sans">
      {/* Header */}
      <header className="border-b border-wood-200 bg-white sticky top-0 z-45 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DormiversityLogo size={36} showText={true} textSize="text-xl" />
          </div>

          <div className="flex items-center space-x-3">
            <a href="#how-it-works" className="hidden md:inline-block text-sm font-medium text-wood-700 hover:text-wood-950 transition-colors">How It Works</a>
            <a href="#pricing" className="hidden md:inline-block text-sm font-medium text-wood-700 hover:text-wood-950 transition-colors">Pricing</a>
            <div className="hidden md:block h-4 w-px bg-wood-200"></div>
            <button
              onClick={() => window.history.pushState({}, '', '/signin')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-wood-900 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer wood-pattern-btn-light border border-wood-250"
            >
              Sign In
            </button>
            <button
              onClick={() => window.history.pushState({}, '', '/signup')}
              className="hidden sm:inline-block px-4 py-2 wood-pattern-btn text-white rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
            >
              Sign Up
            </button>

            {/* Mobile Navigation Toggle Button */}
            <button 
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 text-wood-600 hover:text-wood-900 focus:outline-hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-wood-100 bg-white overflow-hidden shadow-md"
            >
              <div className="px-4 py-3 space-y-2 flex flex-col">
                <a 
                  href="#how-it-works" 
                  onClick={() => setMobileNavOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-medium text-wood-700 hover:text-wood-950 hover:bg-wood-50 transition-all"
                >
                  How It Works
                </a>
                <a 
                  href="#pricing" 
                  onClick={() => setMobileNavOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-medium text-wood-700 hover:text-wood-950 hover:bg-wood-50 transition-all"
                >
                  Pricing
                </a>
                <div className="border-t border-wood-100 pt-2 flex flex-col space-y-2">
                  <button
                    onClick={() => {
                      setMobileNavOpen(false);
                      window.history.pushState({}, '', '/signup');
                    }}
                    className="w-full text-center py-2 bg-amber-500 hover:bg-amber-600 text-wood-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Get Started (Sign Up)
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Auto-Rotating Hero Carousel */}
      <section 
        className="relative bg-gradient-to-b from-white to-wood-100/50 border-b border-wood-100 overflow-hidden py-12 sm:py-20"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-wood-950 rounded-3xl border border-wood-850 shadow-xl overflow-hidden min-h-[480px] flex flex-col justify-between p-8 sm:p-12">
            {/* Background Image with Dark & Warm Wood Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <img 
                src={CAROUSEL_SLIDES[currentSlide].image} 
                alt={CAROUSEL_SLIDES[currentSlide].title} 
                className="w-full h-full object-cover opacity-90 transition-transform duration-700 scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-wood-950/40 via-wood-950/10 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-wood-950/40 via-wood-950/5 to-transparent"></div>
            </div>

            {/* Top Badge Overlay */}
            <div className="relative z-10 self-start">
              <div className="inline-flex items-center space-x-2 bg-wood-900/80 border border-wood-700/60 px-3 py-1.5 rounded-full text-xs font-bold text-amber-300 uppercase tracking-wider backdrop-blur-xs">
                <Shield size={14} className="text-amber-400 animate-pulse" />
                <span>{CAROUSEL_SLIDES[currentSlide].badge}</span>
              </div>
            </div>
            
            {/* Left Content Column Overlay */}
            <div className="relative z-10 max-w-2xl mt-12 mb-6">
              {/* Content with crossfade-like key based on active slide */}
              <div className="space-y-4 animate-fadeIn">
                <h1 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight leading-tight drop-shadow-md">
                  {CAROUSEL_SLIDES[currentSlide].title}
                </h1>
                <h2 className="text-lg sm:text-xl font-semibold text-amber-300 drop-shadow-sm">
                  {CAROUSEL_SLIDES[currentSlide].subtitle}
                </h2>
                <p className="text-sm sm:text-base text-wood-100 leading-relaxed max-w-xl drop-shadow-xs">
                  {CAROUSEL_SLIDES[currentSlide].description}
                </p>

                {/* Targeted Signup Buttons for Student, Landlord, and Inspector */}
                <div className="pt-4 flex flex-wrap gap-3">
                  {(CAROUSEL_SLIDES[currentSlide].role === 'STUDENT' || CAROUSEL_SLIDES[currentSlide].role === 'BOTH') && (
                    <button
                      onClick={() => handleCarouselSignUp('STUDENT')}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-wood-950 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center space-x-1.5 active:scale-95"
                    >
                      <span>Sign Up as Student</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                  {(CAROUSEL_SLIDES[currentSlide].role === 'LANDLORD' || CAROUSEL_SLIDES[currentSlide].role === 'BOTH') && (
                    <button
                      onClick={() => handleCarouselSignUp('LANDLORD')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center space-x-1.5 active:scale-95"
                    >
                      <span>Sign Up as Landlord</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                  {CAROUSEL_SLIDES[currentSlide].role === 'INSPECTOR' && (
                    <button
                      onClick={() => handleCarouselSignUp('INSPECTOR')}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center space-x-1.5 active:scale-95"
                    >
                      <span>Sign Up as Inspector</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Controls and Dots (Removed Previous/Next buttons, Centered dot indicators) */}
            <div className="relative z-10 mt-6 flex items-center justify-center pt-6 border-t border-wood-800/60">
              {/* Dot Indicators */}
              <div className="flex items-center space-x-2.5">
                {CAROUSEL_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${currentSlide === idx ? 'w-10 bg-amber-400 animate-pulse' : 'w-2.5 bg-wood-800/80 hover:bg-wood-700'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Search Bar - Nested below Carousel but within section for unified layout */}
          <div className="mt-12">
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-lg border border-wood-200/80 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full">
                <SchoolSelect
                  schools={schools}
                  value={selectedSchool}
                  onChange={(schoolId) => setSelectedSchool(schoolId)}
                  placeholder="Type to search and select your school (e.g. UNILAG, UI, OAU)..."
                  className="border-0 bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 wood-pattern-btn text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Search Hostels</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Core Trust Badges */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white/80 p-4 rounded-xl border border-wood-100 flex items-center space-x-3">
              <div className="p-2 bg-wood-100 rounded-lg text-wood-700"><Shield size={20} /></div>
              <div>
                <p className="font-bold text-wood-950 text-sm leading-tight">Escrow Guarantee</p>
                <p className="text-xs text-wood-600">Rent held safe from fraud</p>
              </div>
            </div>
            <div className="bg-white/80 p-4 rounded-xl border border-wood-100 flex items-center space-x-3">
              <div className="p-2 bg-wood-100 rounded-lg text-wood-700"><CheckCircle size={20} /></div>
              <div>
                <p className="font-bold text-wood-950 text-sm leading-tight">Verified Landlords</p>
                <p className="text-xs text-wood-600">NIN audit verified listers</p>
              </div>
            </div>
            <div className="bg-white/80 p-4 rounded-xl border border-wood-100 flex items-center space-x-3">
              <div className="p-2 bg-wood-100 rounded-lg text-wood-700"><Compass size={20} /></div>
              <div>
                <p className="font-bold text-wood-950 text-sm leading-tight">Campus Vetting</p>
                <p className="text-xs text-wood-600">₦5,000 physical reports</p>
              </div>
            </div>
            <div className="bg-white/80 p-4 rounded-xl border border-wood-100 flex items-center space-x-3">
              <div className="p-2 bg-wood-100 rounded-lg text-wood-700"><GraduationCap size={20} /></div>
              <div>
                <p className="font-bold text-wood-950 text-sm leading-tight">Roommate Finder</p>
                <p className="text-xs text-wood-600">Split costs and match</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-wood-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest text-amber-600 uppercase">Operational Excellence</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-wood-950 tracking-tight mt-1">Dormiversity Pipelines</h2>
            <p className="text-wood-600 mt-3">Click any panel below to discover our secure, fully automated workflows for students, landlords, and inspectors.</p>
          </div>

          {/* DESKTOP VIEW: Three Panels with Click to Expand */}
          {(() => {
            const wStudent = activeRole === 'student' ? 80 : 10;
            const wLandlord = activeRole === 'landlord' ? 80 : 10;
            const wInspector = activeRole === 'inspector' ? 80 : 10;

            return (
              <div className="hidden md:flex items-stretch justify-between gap-4 h-[380px] max-w-6xl mx-auto">
                {/* Students Panel */}
                <div 
                  onClick={() => snapToRole('student')}
                  className={`h-full relative overflow-hidden rounded-3xl border select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    activeRole === 'student' 
                      ? 'border-amber-200/80 bg-gradient-to-br from-amber-500/[0.03] via-amber-50/10 to-transparent shadow-xl' 
                      : 'border-wood-200/50 bg-wood-50/30 cursor-pointer hover:border-wood-300'
                  }`}
                  style={{ width: `${wStudent}%` }}
                >
                  {wStudent > 25 ? (
                    <div className="p-8 h-full flex flex-col justify-start relative z-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.04] to-transparent pointer-events-none" />
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase">Operational Pipeline</span>
                          <h3 className="text-2xl font-bold font-display text-wood-950 mt-1">Students</h3>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                          Active Section
                        </span>
                      </div>

                      {/* Carousel Content for Students */}
                      <div className="my-auto relative">
                        <AnimatePresence mode="wait">
                          <motion.div
                             key={studentStep}
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, x: -20 }}
                             transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                             className="flex flex-col justify-center animate-fade-in"
                          >
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="p-3 bg-amber-100/80 text-amber-700 rounded-2xl border border-amber-200/30 shadow-xs">
                                {React.createElement(STUDENT_STEPS[studentStep].icon, { size: 24, className: "stroke-[2.5]" })}
                              </div>
                              <div>
                                <span className="text-xs font-medium text-amber-600 uppercase tracking-wider block">
                                  {STUDENT_STEPS[studentStep].tagLine}
                                </span>
                                <h4 className="font-bold text-lg sm:text-xl text-wood-950">{STUDENT_STEPS[studentStep].title}</h4>
                              </div>
                            </div>
                            <p className="text-sm text-wood-600 leading-relaxed max-w-xl">
                              {STUDENT_STEPS[studentStep].description}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-8 relative">
                      <div className="absolute inset-0 hover:bg-wood-100/50 transition-colors pointer-events-none" />
                      <div className="w-10 h-10 bg-amber-100/60 text-amber-700 rounded-xl flex items-center justify-center mb-6">
                        <Search size={20} />
                      </div>
                      <span className="text-xs font-bold tracking-widest text-wood-500 uppercase select-none [writing-mode:vertical-lr] rotate-180">
                        STUDENTS PIPELINE
                      </span>
                      <div className="mt-6 flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] text-wood-400 mt-1 uppercase font-semibold">Explore</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Landlords Panel */}
                <div 
                  onClick={() => snapToRole('landlord')}
                  className={`h-full relative overflow-hidden rounded-3xl border select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    activeRole === 'landlord' 
                      ? 'border-emerald-200/80 bg-gradient-to-br from-emerald-500/[0.03] via-emerald-50/10 to-transparent shadow-xl' 
                      : 'border-wood-200/50 bg-wood-50/30 cursor-pointer hover:border-wood-300'
                  }`}
                  style={{ width: `${wLandlord}%` }}
                >
                  {wLandlord > 25 ? (
                    <div className="p-8 h-full flex flex-col justify-start relative z-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] to-transparent pointer-events-none" />
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Operational Pipeline</span>
                          <h3 className="text-2xl font-bold font-display text-wood-950 mt-1">Landlords</h3>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          Active Section
                        </span>
                      </div>

                      {/* Carousel Content for Landlords */}
                      <div className="my-auto relative">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={landlordStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col justify-center animate-fade-in"
                          >
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="p-3 bg-emerald-100/80 text-emerald-700 rounded-2xl border border-emerald-200/30 shadow-xs">
                                {React.createElement(LANDLORD_STEPS[landlordStep].icon, { size: 24, className: "stroke-[2.5]" })}
                              </div>
                              <div>
                                <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider block">
                                  {LANDLORD_STEPS[landlordStep].tagLine}
                                </span>
                                <h4 className="font-bold text-lg sm:text-xl text-wood-950">{LANDLORD_STEPS[landlordStep].title}</h4>
                              </div>
                            </div>
                            <p className="text-sm text-wood-600 leading-relaxed max-w-xl">
                              {LANDLORD_STEPS[landlordStep].description}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-8 relative">
                      <div className="absolute inset-0 hover:bg-wood-100/50 transition-colors pointer-events-none" />
                      <div className="w-10 h-10 bg-emerald-100/60 text-emerald-700 rounded-xl flex items-center justify-center mb-6">
                        <Home size={20} />
                      </div>
                      <span className="text-xs font-bold tracking-widest text-wood-500 uppercase select-none [writing-mode:vertical-lr] rotate-180">
                        LANDLORDS PIPELINE
                      </span>
                      <div className="mt-6 flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-wood-400 mt-1 uppercase font-semibold">Explore</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Inspectors Panel */}
                <div 
                  onClick={() => snapToRole('inspector')}
                  className={`h-full relative overflow-hidden rounded-3xl border select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    activeRole === 'inspector' 
                      ? 'border-blue-200/80 bg-gradient-to-br from-blue-500/[0.03] via-blue-50/10 to-transparent shadow-xl' 
                      : 'border-wood-200/50 bg-wood-50/30 cursor-pointer hover:border-wood-300'
                  }`}
                  style={{ width: `${wInspector}%` }}
                >
                  {wInspector > 25 ? (
                    <div className="p-8 h-full flex flex-col justify-start relative z-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] to-transparent pointer-events-none" />
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase">Operational Pipeline</span>
                          <h3 className="text-2xl font-bold font-display text-wood-950 mt-1">Inspectors</h3>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                          Active Section
                        </span>
                      </div>

                      {/* Carousel Content for Inspectors */}
                      <div className="my-auto relative">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={inspectorStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col justify-center animate-fade-in"
                          >
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="p-3 bg-blue-100/80 text-blue-700 rounded-2xl border border-blue-200/30 shadow-xs">
                                {React.createElement(INSPECTOR_STEPS[inspectorStep].icon, { size: 24, className: "stroke-[2.5]" })}
                              </div>
                              <div>
                                <span className="text-xs font-medium text-blue-600 uppercase tracking-wider block">
                                  {INSPECTOR_STEPS[inspectorStep].tagLine}
                                </span>
                                <h4 className="font-bold text-lg sm:text-xl text-wood-950">{INSPECTOR_STEPS[inspectorStep].title}</h4>
                              </div>
                            </div>
                            <p className="text-sm text-wood-600 leading-relaxed max-w-xl">
                              {INSPECTOR_STEPS[inspectorStep].description}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-8 relative">
                      <div className="absolute inset-0 hover:bg-wood-100/50 transition-colors pointer-events-none" />
                      <div className="w-10 h-10 bg-blue-100/60 text-blue-700 rounded-xl flex items-center justify-center mb-6">
                        <GraduationCap size={20} />
                      </div>
                      <span className="text-xs font-bold tracking-widest text-wood-500 uppercase select-none [writing-mode:vertical-lr] rotate-180">
                        INSPECTORS PIPELINE
                      </span>
                      <div className="mt-6 flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] text-wood-400 mt-1 uppercase font-semibold">Explore</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* MOBILE VIEW: Touch Optimized Carousel */}
          <div className="block md:hidden max-w-lg mx-auto">
            {/* Swappers */}
            <div className="flex space-x-1 bg-wood-100 p-1 rounded-2xl border border-wood-200 mb-6">
              <button
                onClick={() => snapToRole('student')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeRole === 'student' ? 'bg-white text-amber-700 shadow-xs' : 'text-wood-500'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => snapToRole('landlord')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeRole === 'landlord' ? 'bg-white text-emerald-700 shadow-xs' : 'text-wood-500'
                }`}
              >
                Landlords
              </button>
              <button
                onClick={() => snapToRole('inspector')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeRole === 'inspector' ? 'bg-white text-blue-700 shadow-xs' : 'text-wood-500'
                }`}
              >
                Inspectors
              </button>
            </div>

            {/* Active Content Body */}
            <div className={`p-6 rounded-3xl border bg-white shadow-xs ${
              activeRole === 'student' ? 'border-amber-100' : 
              activeRole === 'landlord' ? 'border-emerald-100' : 
              'border-blue-100'
            }`}>
              <div className="flex justify-between items-center mb-6 border-b border-wood-50 pb-4">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  activeRole === 'student' ? 'text-amber-600' : 
                  activeRole === 'landlord' ? 'text-emerald-600' : 
                  'text-blue-600'
                }`}>
                  {activeRole === 'student' ? 'Student Process' : activeRole === 'landlord' ? 'Landlord Protection' : 'Inspector Pipeline'}
                </span>
              </div>

              {/* Dynamic Content Frame */}
              <div className="min-h-[150px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeRole === 'student' ? studentStep : activeRole === 'landlord' ? landlordStep : inspectorStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {(() => {
                      const steps = activeRole === 'student' ? STUDENT_STEPS : activeRole === 'landlord' ? LANDLORD_STEPS : INSPECTOR_STEPS;
                      const stepIdx = activeRole === 'student' ? studentStep : activeRole === 'landlord' ? landlordStep : inspectorStep;
                      const step = steps[stepIdx];
                      return (
                        <div>
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`p-2.5 rounded-xl border ${
                              activeRole === 'student' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                              activeRole === 'landlord' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                              'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                              {React.createElement(step.icon, { size: 20 })}
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-wood-400 block tracking-wider uppercase">
                                {step.badge}
                              </span>
                              <h4 className="font-bold text-base text-wood-950">{step.title}</h4>
                            </div>
                          </div>
                          <p className="text-sm text-wood-600 leading-relaxed mt-2">
                            {step.description}
                          </p>
                        </div>
                      );
                    })()}
                  </motion.div>
                </AnimatePresence>

                {/* Progress count timer */}
                <div className="mt-6 border-t border-wood-50 pt-4 flex justify-between text-[11px] text-wood-400 font-medium">
                  <span>Tap pipeline above to switch roles</span>
                  <span>Auto-advancing every 6s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Commission Transparency */}
      <section id="pricing" className="py-16 sm:py-24 bg-wood-100/30 border-b border-wood-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-wood-950 tracking-tight mb-4">Transparent Pricing, Zero Surprises</h2>
          <p className="text-wood-600 mb-12 max-w-2xl mx-auto">We do not believe in massive agent commissions or hidden fees. We maintain a simple, transparent fee structure to support secure housing.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-8 rounded-3xl border border-wood-200/80 shadow-xs">
              <div className="bg-wood-50 p-3 rounded-2xl w-fit text-wood-700 mb-6">
                <GraduationCap size={28} />
              </div>
              <h3 className="font-bold text-xl text-wood-950">10% Hostels Marketplace Cut</h3>
              <p className="text-wood-500 text-xs mt-1 mb-4">PAID BY LANDLORD ON OUTCOME</p>
              <p className="text-sm text-wood-600 leading-relaxed">
                Publishing is free! Dormiversity retains a flat 10% commission on bookings secured via Escrow. Landlords receive 90% of the rent amount instantly upon user approval or auto-release timeline.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-wood-200/80 shadow-xs">
              <div className="bg-wood-50 p-3 rounded-2xl w-fit text-wood-700 mb-6">
                <ClipboardCheck size={28} />
              </div>
              <h3 className="font-bold text-xl text-wood-950">₦5,000 Flat Inspection Fee</h3>
              <p className="text-wood-500 text-xs mt-1 mb-4">PAID BY STUDENT PER REQUEST</p>
              <p className="text-sm text-wood-600 leading-relaxed">
                Hire a trusted on-campus student inspector to inspect a hostel physical room structure. The inspector receives ₦4,500 (90%) and Dormiversity retains ₦500 (10%) for hosting & secure processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white border-b border-wood-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-bold text-3xl text-wood-950 tracking-tight">Voted Most Trusted App by Campus Leaders</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-wood-50/50 p-8 rounded-3xl border border-wood-100">
              <div className="flex items-center space-x-1 text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-sm text-wood-800 leading-relaxed mb-6 italic">
                "Finding a room near UNILAG was a nightmare. Dormiversity saved me from a fake agent who wanted ₦500,000 for a non-existent flat. I paid into Dormiversity escrow, hired Tunde (the inspector) for ₦5,000, got my report, moved in, and released the money. Completely stress-free!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-wood-200 rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80" alt="Student" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h5 className="font-bold text-wood-950 text-sm">Ayodeji Falola</h5>
                  <p className="text-xs text-wood-500">Unilag Engineering Student</p>
                </div>
              </div>
            </div>

            <div className="bg-wood-50/50 p-8 rounded-3xl border border-wood-100">
              <div className="flex items-center space-x-1 text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-sm text-wood-800 leading-relaxed mb-6 italic">
                "As a retired lecturer with properties around UI Agbowo, getting decent student tenants was tedious. Now, Dormiversity screens student profiles and manages payouts securely via Paystack. Everything is documented, clear, and modern. I love the KYC verification!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-wood-200 rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=80" alt="Landlord" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h5 className="font-bold text-wood-950 text-sm">Dr. (Mrs) Alabi</h5>
                  <p className="text-xs text-wood-500">Hostel Landlord, Agbowo UI</p>
                </div>
              </div>
            </div>

            <div className="bg-wood-50/50 p-8 rounded-3xl border border-wood-100">
              <div className="flex items-center space-x-1 text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-sm text-wood-800 leading-relaxed mb-6 italic">
                "I earn extra income doing hostel inspections around Ile-Ife on weekends. I pick jobs near campus, take detailed photos, and submit the checklist. Within 12 hours of submitting the report, my ₦4,500 reflects. Perfect side hustle for tertiary students!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-wood-200 rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=80" alt="Inspector" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h5 className="font-bold text-wood-950 text-sm">Emeka Okafor</h5>
                  <p className="text-xs text-wood-500">OAU Student / Roomly Inspector</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-wood-950 text-wood-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-wood-800 pb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-white">
                <DormiversityLogo size={32} showText={true} textSize="text-lg" textColor="text-white" />
              </div>
              <p className="text-xs text-wood-400 leading-relaxed">
                Nigeria's premier secure marketplace and vetting framework for tertiary student accommodations. Powered by modern escrow holding and local on-campus inspectors.
              </p>
            </div>
            <div>
              <h6 className="font-bold text-white text-sm mb-4">Student Hub</h6>
              <ul className="space-y-2 text-xs text-wood-400">
                <li><button onClick={() => window.history.pushState({}, '', '/signin')} className="hover:text-white transition-colors cursor-pointer text-left">Search Hostels</button></li>
                <li><button onClick={() => window.history.pushState({}, '', '/signin')} className="hover:text-white transition-colors cursor-pointer text-left">Roommate Finder</button></li>
                <li><button onClick={() => window.history.pushState({}, '', '/signin')} className="hover:text-white transition-colors cursor-pointer text-left">Hire Roomly Inspector</button></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Escrow Protection FAQs</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-bold text-white text-sm mb-4">Listers & Vetting</h6>
              <ul className="space-y-2 text-xs text-wood-400">
                <li><button onClick={() => window.history.pushState({}, '', '/signin')} className="hover:text-white transition-colors cursor-pointer text-left">Landlord KYC Portal</button></li>
                <li><button onClick={() => window.history.pushState({}, '', '/signin')} className="hover:text-white transition-colors cursor-pointer text-left">List Your Hostel</button></li>
                <li><button onClick={() => window.history.pushState({}, '', '/signin')} className="hover:text-white transition-colors cursor-pointer text-left">Become an Inspector</button></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Commission Breakdown</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-bold text-white text-sm mb-4">Legal & Support</h6>
              <ul className="space-y-2 text-xs text-wood-400">
                <li><button onClick={() => window.history.pushState({}, '', '/terms?tab=terms')} className="hover:text-white transition-colors cursor-pointer text-left">Terms of Service</button></li>
                <li><button onClick={() => window.history.pushState({}, '', '/terms?tab=privacy')} className="hover:text-white transition-colors cursor-pointer text-left">Privacy & NDPR Consent</button></li>
                <li><button onClick={() => window.history.pushState({}, '', '/terms?tab=dataprotection')} className="hover:text-white transition-colors cursor-pointer text-left">Data Protection Compliance</button></li>
                <li><button onClick={() => window.history.pushState({}, '', '/terms?tab=terms')} className="hover:text-white transition-colors cursor-pointer text-left">Refund & Dispute Rules</button></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-wood-500">
            <p>© 2026 Dormiversity Technologies Ltd. All rights reserved. In partnership with Paystack Gateway.</p>
            <p className="mt-2 sm:mt-0">Built for Nigerian Tertiary Scholars 🇳🇬</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
