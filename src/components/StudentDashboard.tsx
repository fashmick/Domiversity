import React, { useState, useEffect } from 'react';
import { Search, MapPin, Compass, Shield, Users, Bookmark, FileText, CheckCircle2, ShieldAlert, Heart, Calendar, CreditCard, ChevronRight, MessageSquare, Plus, Check, Clock, UserCheck, AlertTriangle, Lock, X, RefreshCw, Building, Flag, HelpCircle, ShieldCheck } from 'lucide-react';
import { Hostel, School, Booking, InspectorJob, CohabitantPost, User } from '../types';
import { formatNaira, formatDate, getApiUrl } from '../utils';
import SchoolSelect from './SchoolSelect';
import CustomSelect from './CustomSelect';
import ReportHostelModal from './ReportHostelModal';
import RefundModal from './RefundModal';
import FaqSection from './FaqSection';

interface StudentDashboardProps {
  activeStudent: User;
  schools: School[];
  hostels: Hostel[];
  bookings: Booking[];
  jobs: InspectorJob[];
  cohabitants: CohabitantPost[];
  bookmarks: string[];
  users?: User[];
  onToggleBookmark: (hostelId: string) => void;
  onBookHostel: (hostelId: string, inspectionChoice?: 'SELF' | 'ROOMLY', inspectorId?: string) => void;
  onRequestInspection: (hostelId: string, inspectorId?: string) => void;
  onConfirmSatisfaction: (bookingId: string) => void;
  onOpenDispute: (bookingId: string, reason: string, evidence: string) => void;
  onCancelBooking?: (bookingId: string, reason: string) => void;
  onNavigateToChat: (otherId: string, hostelId?: string, bookingId?: string) => void;
  onCreateCohabitantPost: (post: Omit<CohabitantPost, 'id' | 'studentId' | 'studentName' | 'studentPhoto' | 'createdAt' | 'isClosed'>) => void;
  onCloseCohabitantPost: (postId: string) => void;
  onUpdateProfile?: (updatedUser: User) => void;
  onDeleteAccount?: (userId: string) => void;
  onCompleteJob?: (jobId: string) => void;
  initialSubTab?: 'search' | 'bookings' | 'roommates' | 'bookmarks' | 'faqs' | 'profile';
}

export default function StudentDashboard({
  activeStudent,
  schools,
  hostels,
  bookings,
  jobs,
  cohabitants,
  bookmarks,
  users,
  onToggleBookmark,
  onBookHostel,
  onRequestInspection,
  onConfirmSatisfaction,
  onOpenDispute,
  onCancelBooking,
  onNavigateToChat,
  onCreateCohabitantPost,
  onCloseCohabitantPost,
  onUpdateProfile,
  onDeleteAccount,
  onCompleteJob,
  initialSubTab
}: StudentDashboardProps) {
  const [subTab, setSubTab] = useState<'search' | 'bookings' | 'roommates' | 'bookmarks' | 'faqs' | 'profile'>(initialSubTab || 'search');

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Modal states for Report, Refund, and Inspector Report
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; hostelId: string; hostelName: string }>({ isOpen: false, hostelId: '', hostelName: '' });
  const [refundModal, setRefundModal] = useState<{ isOpen: boolean; bookingId: string; hostelName: string; amount: number; currentStatus: string }>({ isOpen: false, bookingId: '', hostelName: '', amount: 0, currentStatus: '' });
  const [reportInspectorModal, setReportInspectorModal] = useState<{ isOpen: boolean; inspectorId: string; inspectorName: string; hostelName?: string }>({ isOpen: false, inspectorId: '', inspectorName: '', hostelName: '' });
  const [inspectorReportReason, setInspectorReportReason] = useState('Unprofessional Behavior');
  const [inspectorReportNotes, setInspectorReportNotes] = useState('');
  const [inspectorReportSuccess, setInspectorReportSuccess] = useState(false);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>(activeStudent.schoolId || '');
  const [maxBudget, setMaxBudget] = useState<number>(500000);
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Inspection Choice selection during Rent Booking
  const [inspectionChoice, setInspectionChoice] = useState<'SELF' | 'ROOMLY'>('SELF');
  const [selectedInspectorId, setSelectedInspectorId] = useState<string>('');

  // Trigger countdown ticks
  const [, setTick] = useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 10000); // 10s tick
    return () => clearInterval(interval);
  }, []);

  // Countdown Helper
  const getCountdownText = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    const expiresTime = createdTime + 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const diff = expiresTime - now;

    if (diff <= 0) {
      return "Expired (Auto-Released)";
    }

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    return `${days}d ${hours}h ${minutes}m remaining`;
  };
  
  // Modal states
  const [detailedHostel, setDetailedHostel] = useState<Hostel | null>(null);
  const [showPaystackModal, setShowPaystackModal] = useState<{ isOpen: boolean; hostelId: string; type: 'RENT' | 'INSPECTION' }>({ isOpen: false, hostelId: '', type: 'RENT' });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [disputeBookingId, setDisputeBookingId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  // Profile settings state
  const [profileName, setProfileName] = useState(activeStudent.name);
  const [profilePhone, setProfilePhone] = useState(activeStudent.phone);
  const [profileEmail, setProfileEmail] = useState(activeStudent.email);
  const [profileDept, setProfileDept] = useState(activeStudent.department || '');
  const [profileSchool, setProfileSchool] = useState(activeStudent.schoolId || '');
  const [profilePic, setProfilePic] = useState(activeStudent.profilePicture || '');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  React.useEffect(() => {
    setProfileName(activeStudent.name);
    setProfilePhone(activeStudent.phone);
    setProfileEmail(activeStudent.email);
    setProfileDept(activeStudent.department || '');
    setProfileSchool(activeStudent.schoolId || '');
    setProfilePic(activeStudent.profilePicture || '');
  }, [activeStudent.id, activeStudent.name, activeStudent.phone, activeStudent.email, activeStudent.department, activeStudent.schoolId, activeStudent.profilePicture]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError('');

    const cleanPhone = profilePhone.replace(/[\s\-\(\)\+]/g, '');
    const isNigerian = /^(0\d{10}|234\d{10})$/.test(cleanPhone);
    if (!isNigerian) {
      setUpdateError('Please enter a valid Nigerian phone number (11 digits starting with 0, or +234 format).');
      return;
    }

    if (onUpdateProfile) {
      onUpdateProfile({
        ...activeStudent,
        name: profileName,
        phone: cleanPhone.startsWith('234') ? `0${cleanPhone.slice(3)}` : cleanPhone,
        email: profileEmail,
        department: profileDept,
        schoolId: profileSchool,
        profilePicture: profilePic || activeStudent.profilePicture
      });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  // New Cohabitant Post states
  const [newPostBudget, setNewPostBudget] = useState<number>(200000);
  const [newPostDescription, setNewPostDescription] = useState('');
  const [newPostHabits, setNewPostHabits] = useState<string[]>([]);
  const [newPostGenderPref, setNewPostGenderPref] = useState<'Male' | 'Female' | 'Any'>('Any');
  const [newPostMyGender, setNewPostMyGender] = useState<'Male' | 'Female'>('Male');
  const [roommateSearch, setRoommateSearch] = useState('');

  // Filtering hostels
  const filteredHostels = hostels.filter(hostel => {
    const term = searchTerm.toLowerCase().trim();
    const school = schools.find(s => s.id === hostel.schoolId);

    const matchesKeyword = !term || 
      hostel.name.toLowerCase().includes(term) || 
      hostel.address.toLowerCase().includes(term) ||
      hostel.roomType.toLowerCase().includes(term) ||
      hostel.gender.toLowerCase().includes(term) ||
      hostel.description.toLowerCase().includes(term) ||
      hostel.price.toString().includes(term) ||
      hostel.amenities.some(a => a.toLowerCase().includes(term)) ||
      (school && (
        school.name.toLowerCase().includes(term) ||
        (school.abbreviation && school.abbreviation.toLowerCase().includes(term)) ||
        school.state.toLowerCase().includes(term) ||
        school.type.toLowerCase().includes(term) ||
        school.ownership.toLowerCase().includes(term)
      ));

    const matchesSchool = selectedSchool ? hostel.schoolId === selectedSchool : true;
    const matchesBudget = maxBudget > 0 ? hostel.price <= maxBudget : true;
    const matchesGender = selectedGender ? hostel.gender === selectedGender || hostel.gender === 'Mixed' : true;
    const matchesType = selectedRoomType ? hostel.roomType === selectedRoomType : true;
    const matchesAmenities = selectedAmenities.every(amenity => hostel.amenities.includes(amenity));
    return matchesKeyword && matchesSchool && matchesBudget && matchesGender && matchesType && matchesAmenities && hostel.isAvailable;
  });

  const studentBookings = bookings.filter(b => b.studentId === activeStudent.id);
  const studentJobs = jobs.filter(j => j.studentId === activeStudent.id);
  const bookmarkedHostels = hostels.filter(h => bookmarks.includes(h.id));

  // Local state to simulate live refund stage updates
  const [simulatedRefundStages, setSimulatedRefundStages] = useState<Record<string, 'INITIATED' | 'ESCROW_REVERSED' | 'PAYSTACK_PROCESSING' | 'CREDITED'>>({});

  const activeBookings = studentBookings.filter(b => b.status !== 'REFUNDED' && b.studentId === activeStudent.id);
  const refundedBookings = studentBookings.filter(b => b.status === 'REFUNDED');

  // Toggle amenity selection
  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // Paystack checkout process simulation
  const handleStartPayment = (hostelId: string, type: 'RENT' | 'INSPECTION') => {
    setInspectionChoice('SELF'); // Default choice
    setShowPaystackModal({ isOpen: true, hostelId, type });
  };

  const handleConfirmPaystackPayment = async () => {
    const hostel = hostels.find(h => h.id === showPaystackModal.hostelId);
    if (!hostel) return;

    const amount = showPaystackModal.type === 'RENT' 
      ? hostel.price + (inspectionChoice === 'ROOMLY' ? 5000 : 0)
      : 5000; // inspection fee is 5000

    setIsProcessingPayment(true);

    // Retrieve public key from configuration, fall back to environment or test key
    let paystackPublicKey = ((import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY) || "pk_test_d3a39e7a83d722e03940176d755711b7d5268ea8";
    
    try {
      const configRes = await fetch(getApiUrl('/api/config'));
      if (configRes.ok) {
        const configData = await configRes.json();
        if (configData.paystackPublicKey) {
          paystackPublicKey = configData.paystackPublicKey;
          console.log("Paystack public key loaded dynamically:", paystackPublicKey);
        }
      }
    } catch (e) {
      console.warn("Could not retrieve custom Paystack key, utilizing fallback", e);
    }

    if (typeof (window as any).PaystackPop === 'undefined') {
      alert("Paystack SDK is currently loading. Please wait a moment and try again.");
      setIsProcessingPayment(false);
      return;
    }

    try {
      const handler = (window as any).PaystackPop.setup({
        key: paystackPublicKey,
        email: activeStudent.email || 'student@dormiversity.com',
        amount: amount * 100, // amount in kobo
        currency: 'NGN',
        ref: 'DORM-' + Math.floor((Math.random() * 1000000000) + 1),
        callback: function(response: any) {
          setIsProcessingPayment(false);
          setShowPaystackModal({ isOpen: false, hostelId: '', type: 'RENT' });
          
          if (showPaystackModal.type === 'RENT') {
            onBookHostel(showPaystackModal.hostelId, inspectionChoice, inspectionChoice === 'ROOMLY' ? selectedInspectorId : undefined);
          } else {
            onRequestInspection(showPaystackModal.hostelId, selectedInspectorId);
          }
          alert(`Escrow Payment Successful! Reference: ${response.reference}. Your funds are held securely in escrow.`);
        },
        onClose: function() {
          setIsProcessingPayment(false);
        }
      });
      
      handler.openIframe();
    } catch (err) {
      console.error("Paystack popup initialization error", err);
      // fallback in case of blockages
      alert("Opening fallback payment gateway...");
      setTimeout(() => {
        setIsProcessingPayment(false);
        setShowPaystackModal({ isOpen: false, hostelId: '', type: 'RENT' });
        if (showPaystackModal.type === 'RENT') {
          onBookHostel(showPaystackModal.hostelId, inspectionChoice, inspectionChoice === 'ROOMLY' ? selectedInspectorId : undefined);
        } else {
          onRequestInspection(showPaystackModal.hostelId, selectedInspectorId);
        }
      }, 1500);
    }
  };

  const handleSubmitDispute = (bookingId: string) => {
    if (!disputeReason.trim()) return;
    const words = disputeReason.trim().split(/\s+/).filter(Boolean).length;
    if (words < 10) {
      alert(`Description too short: Reason for cancellation must contain at least 10 words (currently ${words} words). Please provide more context.`);
      return;
    }
    onOpenDispute(bookingId, disputeReason, disputeEvidence || 'Photographic evidence attached to file.');
    setDisputeBookingId(null);
    setDisputeReason('');
    setDisputeEvidence('');
  };

  const handleCreateRoommatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostDescription.trim() || !activeStudent.schoolId) return;

    const words = newPostDescription.trim().split(/\s+/).filter(Boolean).length;
    if (words < 10) {
      alert(`Description too short: Roommate profile description must be at least 10 words long (currently ${words} words). Please share more about yourself and your preferences.`);
      return;
    }

    onCreateCohabitantPost({
      schoolId: activeStudent.schoolId,
      budget: newPostBudget,
      gender: newPostMyGender,
      genderPreference: newPostGenderPref,
      habits: newPostHabits.length > 0 ? newPostHabits : ['Studious', 'Quiet'],
      description: newPostDescription
    });

    setShowCreatePostModal(false);
    setNewPostDescription('');
    setNewPostMyGender('Male');
    setNewPostHabits([]);
    setNewPostGenderPref('Any');
  };

  const toggleNewPostHabit = (habit: string) => {
    setNewPostHabits(prev => 
      prev.includes(habit) ? prev.filter(h => h !== habit) : [...prev, habit]
    );
  };

  return (
    <div className="bg-wood-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Student Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-3xl border border-wood-200/80 shadow-xs gap-4">
          <div>
            <span className="text-xs font-bold text-wood-500 uppercase tracking-widest flex items-center space-x-1.5">
              <Compass size={14} />
              <span>Student Terminal</span>
            </span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-wood-950 mt-1">Hello, {activeStudent.name}!</h1>
            <p className="text-sm text-wood-600 mt-1">
              Find safe dorms, split costs with campus roommates, and verify listings through physical inspections.
            </p>
          </div>
        </div>

        {/* 1. HOSTEL SEARCH SUBTAB */}
        {subTab === 'search' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Filter Sidebar (Left) */}
            <div className="bg-white p-6 rounded-3xl border border-wood-200/80 shadow-xs h-fit space-y-6">
              <h3 className="font-display font-bold text-lg text-wood-950 border-b border-wood-100 pb-3 flex items-center space-x-2">
                <Search size={18} className="text-wood-600" />
                <span>Filters</span>
              </h3>

              {/* School Selector */}
              <div>
                <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-2">My School</label>
                <SchoolSelect
                  schools={schools}
                  value={selectedSchool}
                  onChange={(schoolId) => setSelectedSchool(schoolId)}
                  placeholder="All Schools Directory"
                />
              </div>

              {/* Price Budget Range (Input Field) */}
              <div>
                <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-2">Max Yearly Budget (₦)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-wood-500">₦</span>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={maxBudget || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setMaxBudget(isNaN(val) ? 0 : val);
                    }}
                    placeholder="E.g., 400000"
                    className="w-full pl-8 pr-4 py-2.5 bg-wood-50/50 border border-wood-200 hover:border-wood-400 rounded-xl text-sm font-semibold text-wood-950 placeholder-wood-400 focus:outline-hidden focus:ring-1 focus:ring-wood-500 transition-all shadow-2xs"
                  />
                </div>
                {maxBudget > 0 && (
                  <p className="text-[10px] text-wood-500 font-semibold mt-1.5 uppercase tracking-wider">
                    Limit: <span className="text-wood-800">{formatNaira(maxBudget)}</span> per year
                  </p>
                )}
              </div>

              {/* Gender Preference */}
              <div>
                <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-2">Gender Allowed</label>
                <div className="grid grid-cols-3 gap-1.5 bg-wood-50 p-1 rounded-xl border border-wood-200 text-xs">
                  <button
                    onClick={() => setSelectedGender('')}
                    className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${selectedGender === '' ? 'bg-white text-wood-950 shadow-2xs' : 'text-wood-500'}`}
                  >
                    Any
                  </button>
                  <button
                    onClick={() => setSelectedGender('Male')}
                    className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${selectedGender === 'Male' ? 'bg-white text-wood-950 shadow-2xs' : 'text-wood-500'}`}
                  >
                    Boys
                  </button>
                  <button
                    onClick={() => setSelectedGender('Female')}
                    className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${selectedGender === 'Female' ? 'bg-white text-wood-950 shadow-2xs' : 'text-wood-500'}`}
                  >
                    Girls
                  </button>
                </div>
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-2">Room Layout</label>
                <CustomSelect
                  value={selectedRoomType}
                  onChange={(val) => setSelectedRoomType(val)}
                  placeholder="Any Layout"
                  options={[
                    { value: '', label: 'Any Layout' },
                    { value: 'Self-Contain', label: 'Self-Contain' },
                    { value: 'Shared (2-in-a-room)', label: '2-in-a-room Shared' },
                    { value: 'Shared (4-in-a-room)', label: '4-in-a-room Shared' },
                    { value: 'Single Room', label: 'Single Room' }
                  ]}
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-2.5">Key Amenities</label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {[
                    'Water Running',
                    'Generator/Solar',
                    'Fenced Security',
                    'WiFi',
                    'Kitchen',
                    'AC/Air Conditioning',
                    'Laundry Service',
                    'Close to Campus',
                    'Prepaid Meter',
                    'Wardrobe',
                    'Balcony'
                  ].map(amenity => {
                    const isChecked = selectedAmenities.includes(amenity);
                    return (
                      <label key={amenity} className="flex items-center space-x-2 text-sm text-wood-700 cursor-pointer select-none hover:text-wood-950 transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleAmenityChange(amenity)}
                          className="rounded-md border-wood-300 text-wood-600 focus:ring-wood-500 h-4 w-4"
                        />
                        <span>{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Hostels Display Grid (Right) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Search input line */}
              <div className="bg-white p-3 rounded-2xl border border-wood-200/80 shadow-xs flex items-center space-x-2">
                <Search size={18} className="text-wood-400 ml-2" />
                <input
                  type="text"
                  placeholder="Search by school, street name, landmark, or hostel name..."
                  value={searchTerm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchTerm(val);
                    if (val.trim().length >= 2) {
                      const term = val.toLowerCase().trim();
                      const matchedSchool = schools.find(s => 
                        s.name.toLowerCase().includes(term) ||
                        (s.abbreviation && s.abbreviation.toLowerCase().includes(term)) ||
                        term.includes(s.name.toLowerCase()) ||
                        (s.abbreviation && term.includes(s.abbreviation.toLowerCase()))
                      );
                      if (matchedSchool) {
                        setSelectedSchool(matchedSchool.id);
                      }
                    }
                  }}
                  className="w-full bg-transparent border-0 outline-hidden focus:ring-0 text-sm text-wood-950 placeholder-wood-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-wood-400 hover:text-wood-600 focus:outline-none cursor-pointer pr-1"
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {filteredHostels.length === 0 ? (
                <div className="bg-white text-center py-16 px-4 rounded-3xl border border-wood-200/80 shadow-xs">
                  <Compass size={40} className="text-wood-300 mx-auto mb-3" />
                  <h4 className="font-display font-bold text-lg text-wood-950">No hostels match filters</h4>
                  <p className="text-xs text-wood-500 mt-1 max-w-sm mx-auto">Try widening your price range, choosing another institution, or turning off amenity checks.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredHostels.map(hostel => {
                    const school = schools.find(s => s.id === hostel.schoolId);
                    const isBookmarked = bookmarks.includes(hostel.id);
                    const alreadyBooked = studentBookings.some(b => b.hostelId === hostel.id && b.status !== 'REFUNDED');
                    
                    return (
                      <div key={hostel.id} className="bg-white border border-wood-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group">
                        
                        {/* Hostel Image and Tags */}
                        <div className="relative h-48 bg-wood-100 overflow-hidden">
                          <img
                            src={hostel.photos[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400'}
                            alt={hostel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Bookmark Heart Button */}
                          <button
                            onClick={() => onToggleBookmark(hostel.id)}
                            className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-wood-700 hover:text-red-500 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
                          >
                            <Heart size={16} fill={isBookmarked ? 'currentColor' : 'none'} className={isBookmarked ? 'text-red-500' : ''} />
                          </button>

                          {/* Gender restriction badge */}
                          <div className="absolute bottom-3 left-3 flex space-x-1.5">
                            <span className={`px-2.5 py-1 text-[10px] font-bold text-white rounded-md tracking-wider shadow-xs ${
                              hostel.gender === 'Male' ? 'bg-blue-600' :
                              hostel.gender === 'Female' ? 'bg-pink-600' : 'bg-wood-700'
                            }`}>
                              {hostel.gender.toUpperCase()} ONLY
                            </span>
                            <span className="px-2.5 py-1 text-[10px] font-bold bg-wood-950 text-white rounded-md tracking-wider shadow-xs uppercase">
                              {hostel.roomType}
                            </span>
                          </div>
                        </div>

                        {/* Card Details */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="font-display font-bold text-base text-wood-950 group-hover:text-wood-600 transition-colors leading-tight">
                                {hostel.name}
                              </h4>
                              <div className="text-right">
                                <p className="font-bold text-wood-950 text-base leading-none">{formatNaira(hostel.price)}</p>
                                <p className="text-[10px] text-wood-400 font-bold uppercase tracking-wider mt-0.5">/ session</p>
                              </div>
                            </div>

                            <p className="text-xs text-wood-500 font-semibold flex items-center space-x-1 mt-1">
                              <MapPin size={12} />
                              <span className="truncate">{hostel.address}</span>
                            </p>

                            <p className="text-xs text-wood-600 font-medium mt-1.5 bg-wood-50 p-1.5 rounded-lg inline-block">
                              📍 <strong>{hostel.proximity} km</strong> from {school?.name.split('(')[0] || 'Campus'}
                            </p>

                            {/* Amenities Tag Line */}
                            <div className="flex flex-wrap gap-1 mt-4">
                              {hostel.amenities.slice(0, 3).map(a => (
                                <span key={a} className="bg-wood-100 text-wood-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  {a}
                                </span>
                              ))}
                              {hostel.amenities.length > 3 && (
                                <span className="bg-wood-100 text-wood-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                  +{hostel.amenities.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-5 pt-4 border-t border-wood-100 flex items-center justify-between gap-2">
                            <button
                              onClick={() => setDetailedHostel(hostel)}
                              className="px-3 py-2 bg-wood-50 hover:bg-wood-100 text-wood-800 text-xs font-semibold rounded-xl transition-all cursor-pointer flex-1"
                            >
                              Explore
                            </button>

                            <button
                              onClick={() => setReportModal({ isOpen: true, hostelId: hostel.id, hostelName: hostel.name })}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all cursor-pointer"
                              title="Report Hostel Listing"
                            >
                              <Flag size={15} />
                            </button>
                            
                            {alreadyBooked ? (
                              <button
                                disabled
                                className="px-3 py-2 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 cursor-not-allowed flex-1"
                              >
                                <CheckCircle2 size={14} />
                                <span>Booked</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartPayment(hostel.id, 'RENT')}
                                className="px-3 py-2 bg-wood-600 hover:bg-wood-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs flex-1 text-center"
                              >
                                Book Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. MY BOOKINGS & INSPECTIONS SUBTAB */}
        {subTab === 'bookings' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wood-200 pb-3">
              <div>
                <h2 className="font-display font-bold text-xl text-wood-950">My Booked Hostels & Inspections</h2>
                <p className="text-xs text-wood-500 mt-1">Manage secure escrow countdowns, verify structures, or escalate room disputes.</p>
              </div>
            </div>
            
            {studentBookings.length === 0 ? (
              <div className="bg-white py-16 text-center rounded-3xl border border-wood-200/80 shadow-xs max-w-2xl mx-auto">
                <Clock size={40} className="text-wood-300 mx-auto mb-3 animate-pulse" />
                <h4 className="font-display font-bold text-lg text-wood-950">You haven't booked any hostels yet</h4>
                <p className="text-xs text-wood-500 mt-1 max-w-sm mx-auto mb-6">Explore the Search Hostels directory, inspect properties locally, and book rooms securely in our escrow framework.</p>
                <button
                  onClick={() => setSubTab('search')}
                  className="px-5 py-2.5 bg-wood-600 hover:bg-wood-700 text-white text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Find Hostels Now
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Active Bookings list */}
                {activeBookings.length === 0 ? (
                  <div className="bg-wood-50/50 p-6 rounded-3xl border border-dashed border-wood-200 text-center py-10">
                    <Compass size={32} className="text-wood-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-wood-900">No active housing bookings</p>
                    <p className="text-xs text-wood-500 mt-1 mb-4">You do not have any live escrow rooms right now. Check the directory to find available spaces.</p>
                    <button
                      onClick={() => setSubTab('search')}
                      className="px-4 py-2 bg-wood-600 hover:bg-wood-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                    >
                      Browse Available Hostels
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeBookings.map(booking => {
                      const inspection = studentJobs.find(j => j.hostelId === booking.hostelId);
                
                return (
                  <div key={booking.id} className="bg-white border border-wood-200/80 rounded-3xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12">
                    
                    {/* Left Pane (Hostel Photo + Basic Info) */}
                    <div className="md:col-span-4 h-48 md:h-auto bg-wood-100 relative">
                      <img src={booking.hostelPhoto} alt={booking.hostelName} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-5 flex flex-col justify-end">
                        <span className="bg-amber-500 text-white font-bold text-[10px] tracking-wider px-2 py-0.5 rounded-sm w-fit mb-2">ESCROW TRANSACTION</span>
                        <h3 className="font-display font-bold text-white text-lg leading-tight">{booking.hostelName}</h3>
                        <p className="text-wood-200 text-xs mt-1">Landlord: {booking.landlordName}</p>
                      </div>
                    </div>

                    {/* Right Pane (Payment, Escrow Details, Inspections) */}
                    <div className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-wood-100">
                        <div>
                          <p className="text-xs font-bold text-wood-400 uppercase tracking-wider">Escrow Status</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              booking.status === 'IN_ESCROW' ? 'bg-amber-100 text-amber-800' :
                              booking.status === 'RELEASED' ? 'bg-emerald-100 text-emerald-800' :
                              booking.status === 'DISPUTED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status === 'IN_ESCROW' ? '🔒 FUNDS LOCKED IN ESCROW' :
                               booking.status === 'RELEASED' ? '🔓 FUNDS RELEASED TO LANDLORD' :
                               booking.status === 'DISPUTED' ? '⚖️ IN DISPUTE MEDIATION' : booking.status}
                            </span>
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-xs font-bold text-wood-400 uppercase tracking-wider">Amount Paid (Rent)</p>
                          <p className="font-bold text-wood-950 text-xl mt-0.5">{formatNaira(booking.price)}</p>
                          <p className="text-[10px] text-wood-400 font-semibold mt-0.5">Held safely in Dormiversity bank account</p>
                        </div>
                      </div>

                      {/* Escrow Guidance Message */}
                      {booking.status === 'IN_ESCROW' && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col gap-3">
                          <div className="flex items-start space-x-2.5">
                            <Shield className="text-amber-600 mt-0.5 flex-shrink-0 animate-pulse" size={18} />
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h5 className="text-xs font-bold text-amber-800">3-Day Escrow Protection Active</h5>
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-mono font-bold text-[10px]">
                                  ⏰ {getCountdownText(booking.createdAt)}
                                </span>
                              </div>
                              <p className="text-[11px] text-amber-700 leading-relaxed mt-1">
                                Your rent is held safely in our escrow vault. The maximum window for physical structural inspection is <strong>3 days maximum after payment</strong>. Please inspect the room structure or verify your inspector report within this time. If satisfied, click <strong>"Satisfied / Release"</strong>. If you are not satisfied or find serious listing discrepancies, click <strong>"Not Satisfied / Dispute"</strong>.
                              </p>
                              <p className="text-[10px] text-amber-600 font-semibold mt-1">
                                Note: If no action is taken within the 3-day countdown window, the server automatically releases the rent (90%) to the landlord.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tied Inspection Status */}
                      <div className="border-t border-b border-wood-100 py-4">
                        <h4 className="text-xs font-bold text-wood-700 uppercase tracking-wider mb-2">Roomly Inspection Report & Vetting</h4>
                        {inspection ? (
                          <div className="bg-wood-50 p-4 rounded-xl border border-wood-100 space-y-3">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                <p className="font-bold text-wood-950 text-sm flex items-center gap-2">
                                  <span>Vetting Status: {inspection.status}</span>
                                  {inspection.status !== 'COMPLETED' ? (
                                    <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                                      🔒 Inspector Hired (Locked)
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full">
                                      ✓ Inspection Finalized
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-wood-600 font-medium mt-0.5">
                                  Assigned Inspector: <strong className="text-wood-950">{inspection.inspectorName || 'Assigned Inspector'}</strong>
                                </p>
                                {inspection.report && (
                                  <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-wood-700 bg-white p-2.5 rounded-lg border border-wood-200">
                                    <p>🚰 Borehole Water: <strong>{inspection.report.waterStatus}</strong></p>
                                    <p>⚡ Power Access: <strong>{inspection.report.powerStatus}</strong></p>
                                    <p>🛡️ Security: <strong>{inspection.report.securityStatus}</strong></p>
                                    <p>🧼 Cleanliness: <strong>{inspection.report.cleanlinessStatus}</strong></p>
                                  </div>
                                )}
                              </div>
                              {inspection.report ? (
                                <div className="sm:text-right">
                                  <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-md uppercase ${
                                    inspection.report.recommendation === 'Highly Recommended' ? 'bg-emerald-100 text-emerald-800' :
                                    inspection.report.recommendation === 'Do Not Book' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {inspection.report.recommendation}
                                  </span>
                                  <p className="text-[10px] text-wood-400 font-medium mt-1">Submitted on {formatDate(inspection.report.createdAt).split(',')[0]}</p>
                                </div>
                              ) : (
                                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">Visiting hostel physically...</span>
                              )}
                            </div>

                            {/* Inspector Action Controls */}
                            <div className="pt-2 border-t border-wood-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <button
                                onClick={() => setReportInspectorModal({
                                  isOpen: true,
                                  inspectorId: inspection.inspectorId || '',
                                  inspectorName: inspection.inspectorName || 'Inspector',
                                  hostelName: booking.hostelName
                                })}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold flex items-center space-x-1 transition-all cursor-pointer"
                              >
                                <Flag size={13} />
                                <span>Report Inspector</span>
                              </button>

                              {inspection.status !== 'COMPLETED' ? (
                                <button
                                  onClick={() => {
                                    if (onCompleteJob) {
                                      onCompleteJob(inspection.id);
                                    }
                                    alert(`Inspection marked as Done! ${inspection.inspectorName || 'The inspector'} has been released and is now available for other students.`);
                                  }}
                                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer"
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Done with Inspector</span>
                                </button>
                              ) : (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                  ✓ Inspection Service Closed
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-wood-100/30 p-3 rounded-xl border border-dashed border-wood-300 gap-2">
                            <span className="text-xs text-wood-600 font-medium">You haven't requested a Roomly Inspector for this hostel yet.</span>
                            <button
                              onClick={() => handleStartPayment(booking.hostelId, 'INSPECTION')}
                              className="px-3.5 py-1.5 bg-wood-600 hover:bg-wood-700 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-xs whitespace-nowrap"
                            >
                              Hire Inspector (₦5,000)
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Transaction Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <button
                          onClick={() => onNavigateToChat(booking.landlordId, booking.hostelId, booking.id)}
                          className="px-4 py-2 bg-wood-100 hover:bg-wood-200 text-wood-800 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
                        >
                          <MessageSquare size={14} />
                          <span>Chat with Landlord</span>
                        </button>

                        <div className="flex flex-wrap items-center gap-2">
                          {booking.status === 'IN_ESCROW' && (
                            <>
                              <button
                                onClick={() => setRefundModal({ isOpen: true, bookingId: booking.id, hostelName: booking.hostelName, amount: booking.price, currentStatus: booking.status })}
                                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center space-x-1"
                              >
                                <CreditCard size={14} />
                                <span>Request Refund (Bank Account)</span>
                              </button>
                              <button
                                onClick={() => setDisputeBookingId(booking.id)}
                                className="px-3.5 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                              >
                                Not Satisfied / Cancel Booking
                              </button>
                              <button
                                onClick={() => onConfirmSatisfaction(booking.id)}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                              >
                                Satisfied / Release Rent (90%)
                              </button>
                            </>
                          )}

                          {booking.status === 'REFUNDED' && (
                            <div className="flex items-center space-x-2">
                              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 flex items-center space-x-1">
                                <CheckCircle2 size={14} />
                                <span>Money Refunded</span>
                              </span>
                              <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-xl border border-blue-300 flex items-center space-x-1">
                                <ShieldCheck size={14} />
                                <span>Dispute Settled</span>
                              </span>
                            </div>
                          )}

                          {booking.status === 'DISPUTED' && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setRefundModal({ isOpen: true, bookingId: booking.id, hostelName: booking.hostelName, amount: booking.price, currentStatus: booking.status })}
                                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center space-x-1"
                              >
                                <CreditCard size={14} />
                                <span>Provide Bank Details for Refund</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Open Dispute / Cancel Dialog Box */}
                      {disputeBookingId === booking.id && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl space-y-4 animate-fadeIn mt-4">
                          <div className="flex items-start space-x-2">
                            <ShieldAlert className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
                            <div>
                              <h5 className="text-xs font-bold text-red-800">Cancel Booking & Request Refund</h5>
                              <p className="text-[11px] text-red-700 leading-normal mt-0.5">Please outline why you are not satisfied with the room. Once submitted, this room will automatically be made available again for other students, your booking will be cancelled, and you can search for and book another room immediately.</p>
                            </div>
                          </div>

                          <div className="space-y-3 text-xs">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block font-bold text-wood-700">Reason for Cancellation *</label>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  disputeReason.trim().split(/\s+/).filter(Boolean).length >= 10
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-red-100 text-red-900 border border-red-300'
                                }`}>
                                  {disputeReason.trim().split(/\s+/).filter(Boolean).length} / 10 words min
                                </span>
                              </div>
                              <textarea
                                value={disputeReason}
                                onChange={(e) => setDisputeReason(e.target.value)}
                                placeholder="E.g., Borehole is completely broken, landlord has no light, room size is 50% smaller than photos (minimum 10 words)..."
                                className="w-full bg-white border border-wood-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-hidden"
                                rows={3}
                              />
                            </div>

                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setDisputeBookingId(null)}
                                className="px-3.5 py-1.5 bg-white text-wood-700 border border-wood-200 rounded-lg font-semibold cursor-pointer"
                              >
                                Keep Booking
                              </button>
                              <button
                                onClick={() => {
                                  if (disputeReason.trim()) {
                                    if (onCancelBooking) {
                                      onCancelBooking(booking.id, disputeReason);
                                    } else {
                                      onOpenDispute(booking.id, disputeReason, 'Cancelled by user');
                                    }
                                    setDisputeBookingId(null);
                                    setDisputeReason('');
                                  }
                                }}
                                disabled={!disputeReason.trim()}
                                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg font-bold cursor-pointer"
                              >
                                Confirm Cancel & Release Room
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
                  </div>
                )}

                {/* Refunded Bookings tracker section */}
                {refundedBookings.length > 0 && (
                  <div className="space-y-6 mt-12 border-t border-wood-200/60 pt-8">
                    <div>
                      <h3 className="font-display font-bold text-lg text-wood-950 flex items-center space-x-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Rent Refund Tracker (100% Escrow Protection)</span>
                      </h3>
                      <p className="text-xs text-wood-500 mt-0.5">Dormiversity escrow guarantee. Track real-time Paystack reverse settlements and settlement ledger credits.</p>
                    </div>

                    <div className="space-y-6">
                      {refundedBookings.map(booking => {
                        const currentStage = simulatedRefundStages[booking.id] || booking.refundStage || 'INITIATED';
                        
                        // Define refund stage metadata
                        const stages = [
                          {
                            id: 'INITIATED',
                            label: 'Rejection Logged',
                            desc: 'Tenant room satisfaction veto submitted. Refund initiated.',
                            icon: ShieldAlert,
                            color: 'text-amber-500 bg-amber-50'
                          },
                          {
                            id: 'ESCROW_REVERSED',
                            label: 'Escrow Reversed',
                            desc: 'Rent escrow ledger reversed. Locked landlord commission cancelled.',
                            icon: Lock,
                            color: 'text-blue-500 bg-blue-50'
                          },
                          {
                            id: 'PAYSTACK_PROCESSING',
                            label: 'Paystack Gateway',
                            desc: 'Processing return transfer via original card channel.',
                            icon: CreditCard,
                            color: 'text-indigo-500 bg-indigo-50'
                          },
                          {
                            id: 'CREDITED',
                            label: 'Settled',
                            desc: 'Full rent value returned. Original pay source credited.',
                            icon: CheckCircle2,
                            color: 'text-emerald-500 bg-emerald-50'
                          }
                        ];

                        const currentStageIndex = stages.findIndex(s => s.id === currentStage);

                        const handleTriggerNextStage = () => {
                          const currentIndex = stages.findIndex(s => s.id === currentStage);
                          if (currentIndex < stages.length - 1) {
                            const nextStageId = stages[currentIndex + 1].id as any;
                            setSimulatedRefundStages(prev => ({
                              ...prev,
                              [booking.id]: nextStageId
                            }));
                          }
                        };

                        return (
                          <div key={booking.id} className="bg-white border border-wood-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col space-y-6 transition-all hover:border-wood-300">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-wood-100">
                              <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-wood-100 rounded-2xl border border-wood-100 overflow-hidden relative flex-shrink-0">
                                  <img src={booking.hostelPhoto} alt={booking.hostelName} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <span className="bg-red-50 text-red-700 font-bold text-[9px] tracking-wider px-2 py-0.5 rounded-sm uppercase inline-block">Cancelled & Refunded</span>
                                  <h4 className="font-display font-bold text-wood-950 text-base mt-1">{booking.hostelName}</h4>
                                  <p className="text-xs text-wood-500 mt-0.5">Cancellation Reason: <span className="italic">"{booking.cancelReason || 'Room conditions did not meet standards'}"</span></p>
                                </div>
                              </div>
                              <div className="sm:text-right flex flex-col items-start sm:items-end">
                                <p className="text-xs font-bold text-wood-400 uppercase tracking-wider">Refund Amount (100%)</p>
                                <p className="font-bold text-[#3bb75e] text-xl mt-0.5">{formatNaira(booking.price)}</p>
                                <span className="text-[10px] text-wood-400 mt-1">Initiated on {formatDate(booking.refundInitiatedAt || booking.createdAt).split(',')[0]}</span>
                              </div>
                            </div>

                            {/* Stepper Grid */}
                            <div>
                              <p className="text-xs font-bold text-wood-700 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                                <Clock size={12} className="text-amber-500" />
                                <span>Escrow Refund Stages</span>
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                                {stages.map((stage, idx) => {
                                  const IconComponent = stage.icon;
                                  const isCompleted = idx <= currentStageIndex;
                                  const isActive = idx === currentStageIndex;

                                  return (
                                    <div key={stage.id} className={`p-4 rounded-2xl border transition-all flex flex-col space-y-2 ${
                                      isActive ? 'bg-[#3bb75e]/5 border-[#3bb75e]/30' :
                                      isCompleted ? 'bg-wood-50/50 border-wood-200/50 opacity-80' : 'bg-white border-wood-100 opacity-40'
                                    }`}>
                                      <div className="flex items-center justify-between">
                                        <div className={`p-1.5 rounded-lg ${stage.color}`}>
                                          <IconComponent size={14} />
                                        </div>
                                        {isCompleted && !isActive ? (
                                          <span className="bg-emerald-100 text-emerald-800 p-0.5 rounded-full"><Check size={10} /></span>
                                        ) : isActive ? (
                                          <span className="flex h-2 w-2 rounded-full bg-[#3bb75e] animate-ping"></span>
                                        ) : null}
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-wood-900">{stage.label}</p>
                                        <p className="text-[10px] text-wood-500 leading-normal mt-1">{stage.desc}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* dynamic tracker checker action */}
                            <div className="bg-wood-50/60 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                              <div className="flex items-center space-x-2.5">
                                <div className="p-2 bg-white rounded-xl border border-wood-200">
                                  <Shield className="text-wood-600" size={16} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-wood-800">Dynamic Payment Processor Sync</p>
                                  <p className="text-[10px] text-wood-500">Query the active Paystack merchant ledger for secure settlement checks.</p>
                                </div>
                              </div>
                              {currentStage !== 'CREDITED' ? (
                                <button
                                  onClick={handleTriggerNextStage}
                                  className="px-4 py-2 bg-[#3bb75e] hover:bg-[#3bb75e]/90 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                                >
                                  <RefreshCw size={12} className="animate-spin" />
                                  <span>Update Settlement Status</span>
                                </button>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-1">
                                  <CheckCircle2 size={12} />
                                  <span>Fully Settled & Returned</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. ROOMMATE MATCHER SUBTAB - renamed to Roommate Finder Hub */}
        {subTab === 'roommates' && (() => {
          const filteredCohabitants = cohabitants.filter(post => {
            const term = roommateSearch.toLowerCase().trim();
            if (!term) return true;
            
            const school = schools.find(s => s.id === post.schoolId);
            const schoolName = school ? school.name.toLowerCase() : '';
            const name = post.studentName.toLowerCase();
            const desc = post.description.toLowerCase();
            const habits = post.habits.map(h => h.toLowerCase()).join(' ');
            const genderPref = (post.genderPreference || '').toLowerCase();
            const genderSelf = (post.gender || '').toLowerCase();

            return name.includes(term) || 
                   desc.includes(term) || 
                   schoolName.includes(term) || 
                   habits.includes(term) ||
                   genderPref.includes(term) ||
                   genderSelf.includes(term) ||
                   post.budget.toString().includes(term);
          });

          return (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-wood-200 pb-3 gap-4">
                <div>
                  <h2 className="font-display font-bold text-xl text-wood-950">Roommate Finder Hub</h2>
                  <p className="text-xs text-wood-500 mt-1">Browse other tertiary students looking to split hostel costs, or create your own post.</p>
                </div>
                <button
                  onClick={() => setShowCreatePostModal(true)}
                  className="px-4 py-2.5 bg-wood-600 hover:bg-wood-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-1 cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Plus size={14} />
                  <span>Publish Post</span>
                </button>
              </div>

              {/* Roommate Search Input */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-wood-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  value={roommateSearch}
                  onChange={(e) => setRoommateSearch(e.target.value)}
                  placeholder="Search roommates by name, school, habits, budget, or gender..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-wood-200 rounded-xl text-wood-950 text-xs sm:text-sm focus:border-wood-500 focus:ring-1 focus:ring-wood-500 outline-hidden transition-all placeholder-wood-400 shadow-2xs"
                />
              </div>

              {/* Create Roommate Post Modal Overlay */}
              {showCreatePostModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-wood-200 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
                    <h3 className="font-display font-bold text-lg text-wood-950 mb-1">Create "Roommate Wanted" Post</h3>
                    <p className="text-xs text-wood-500 mb-4">Post a flyer. We automatically hook it to your institution directory.</p>

                    <form onSubmit={handleCreateRoommatePost} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-bold text-wood-700 mb-1">My Maximum Yearly Budget</label>
                        <input
                          type="number"
                          value={newPostBudget}
                          onChange={(e) => setNewPostBudget(parseInt(e.target.value))}
                          className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden"
                          min="50000"
                          step="10000"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-wood-700 mb-1">My Gender</label>
                          <CustomSelect
                            value={newPostMyGender}
                            onChange={(val: any) => setNewPostMyGender(val)}
                            options={[
                              { value: 'Male', label: 'Male' },
                              { value: 'Female', label: 'Female' }
                            ]}
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-wood-700 mb-1">Preferred Roommate Gender</label>
                          <CustomSelect
                            value={newPostGenderPref}
                            onChange={(val: any) => setNewPostGenderPref(val)}
                            options={[
                              { value: 'Any', label: 'Any Gender / No Preference' },
                              { value: 'Male', label: 'Male Only' },
                              { value: 'Female', label: 'Female Only' }
                            ]}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-wood-700 mb-1.5">My Lifestyle/Study Habits</label>
                        <div className="flex flex-wrap gap-1.5">
                          {['Quiet', 'Studious', 'Non-smoker', 'Early-bird', 'No parties', 'Neat', 'Social'].map(habit => {
                            const isSelected = newPostHabits.includes(habit);
                            return (
                              <button
                                type="button"
                                key={habit}
                                onClick={() => toggleNewPostHabit(habit)}
                                className={`px-3 py-1.5 rounded-lg border font-semibold cursor-pointer ${
                                  isSelected ? 'bg-wood-600 border-wood-600 text-white' : 'bg-white border-wood-200 text-wood-700 hover:bg-wood-50'
                                }`}
                              >
                                {habit}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-bold text-wood-700">Description (Tell prospective matches about yourself) *</label>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            newPostDescription.trim().split(/\s+/).filter(Boolean).length >= 10
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {newPostDescription.trim().split(/\s+/).filter(Boolean).length} / 10 words min
                          </span>
                        </div>
                        <textarea
                          value={newPostDescription}
                          onChange={(e) => setNewPostDescription(e.target.value)}
                          placeholder="E.g., I am in 300 Level CS, I study a lot, very clean, am looking to find someone to rent a self-contain apartment with (minimum 10 words)..."
                          className="w-full bg-wood-50 border border-wood-200 rounded-xl p-3 text-xs outline-hidden focus:ring-1 focus:ring-wood-500"
                          rows={4}
                          required
                        />
                      </div>

                      <div className="flex justify-end space-x-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowCreatePostModal(false)}
                          className="px-4 py-2 border border-wood-200 rounded-lg text-wood-700 font-semibold hover:bg-wood-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-wood-600 hover:bg-wood-700 text-white font-bold rounded-lg cursor-pointer"
                        >
                          Publish Flyer
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Roommates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCohabitants.length === 0 ? (
                  <div className="col-span-full bg-white border border-wood-200 rounded-2xl p-8 text-center text-wood-500">
                    No matching roommate posts found. Try another search query or publish a new post!
                  </div>
                ) : (
                  filteredCohabitants.map(post => {
                const school = schools.find(s => s.id === post.schoolId);
                const isMe = post.studentId === activeStudent.id;
                
                return (
                  <div key={post.id} className="bg-white border border-wood-200/80 rounded-2xl p-5 flex flex-col justify-between hover:shadow-xs transition-all relative">
                    {isMe && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[9px] tracking-wider uppercase">My Post</span>
                    )}

                    <div>
                      {/* Student Profile Info */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-wood-200 overflow-hidden border border-wood-100">
                          {post.studentPhoto ? (
                            <img src={post.studentPhoto} alt={post.studentName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-wood-500 text-white font-bold flex items-center justify-center text-sm">{post.studentName.charAt(0)}</div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-wood-950">{post.studentName}</h4>
                          <p className="text-[10px] text-wood-400 font-bold uppercase tracking-wider">{school?.name.split('(')[0] || 'Institution'}</p>
                        </div>
                      </div>

                      {/* Post Budget */}
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-wood-400 uppercase tracking-wider">Split Budget Preference</span>
                        <p className="font-bold text-emerald-700 text-base leading-none mt-0.5">Up to {formatNaira(post.budget)} / yr</p>
                      </div>

                      {/* Gender and Preference */}
                      <div className="flex justify-between items-center bg-wood-50 rounded-xl p-2.5 mb-4 text-xs border border-wood-100">
                        <div>
                          <span className="block text-[9px] font-bold text-wood-400 uppercase tracking-wider">My Gender</span>
                          <span className="font-bold text-wood-700">{post.gender}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[9px] font-bold text-wood-400 uppercase tracking-wider">Roommate Wanted</span>
                          <span className="font-bold text-wood-900">
                            {post.genderPreference === 'Male' && '🙋‍♂️ Male Only'}
                            {post.genderPreference === 'Female' && '🙋‍♀️ Female Only'}
                            {(!post.genderPreference || post.genderPreference === 'Any') && '👥 Any Gender'}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-wood-700 leading-relaxed mb-4 line-clamp-4 italic">
                        "{post.description}"
                      </p>

                      {/* Habits Tag */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.habits.map(h => (
                          <span key={h} className="bg-wood-100 text-wood-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-wood-100 flex items-center gap-2">
                      {isMe ? (
                        <button
                          onClick={() => onCloseCohabitantPost(post.id)}
                          className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Close Matching Flyer
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigateToChat(post.studentId)}
                          className="w-full py-2 bg-wood-600 hover:bg-wood-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <MessageSquare size={12} />
                          <span>Message Roommate</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        );
      })()}

        {/* 4. BOOKMARKS SUBTAB */}
        {subTab === 'bookmarks' && (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-xl text-wood-950 border-b border-wood-200 pb-3">My Saved Hostels</h2>
            
            {bookmarkedHostels.length === 0 ? (
              <div className="bg-white py-16 text-center rounded-3xl border border-wood-200/80 shadow-xs max-w-lg mx-auto">
                <Bookmark size={36} className="text-wood-300 mx-auto mb-2" />
                <h4 className="font-display font-bold text-base text-wood-950">No saved hostels</h4>
                <p className="text-xs text-wood-500 mt-1">Bookmark properties in the Search menu to inspect and rent later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarkedHostels.map(hostel => (
                  <div key={hostel.id} className="bg-white border border-wood-200 rounded-2xl overflow-hidden hover:shadow-xs transition-all flex flex-col justify-between">
                    <div className="h-40 bg-wood-100 relative">
                      <img src={hostel.photos[0]} alt={hostel.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => onToggleBookmark(hostel.id)}
                        className="absolute top-2.5 right-2.5 p-1.5 bg-white text-red-500 rounded-full cursor-pointer"
                      >
                        <Heart size={14} fill="currentColor" />
                      </button>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-wood-950">{hostel.name}</h4>
                        <p className="text-xs text-wood-500 font-semibold mt-1 flex items-center"><MapPin size={10} className="mr-0.5" />{hostel.address.split(',')[1] || hostel.address}</p>
                        <p className="font-bold text-wood-950 text-sm mt-2">{formatNaira(hostel.price)} / year</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-wood-100 flex items-center justify-between gap-1.5">
                        <button
                          onClick={() => setDetailedHostel(hostel)}
                          className="px-2 py-1.5 bg-wood-50 hover:bg-wood-100 text-wood-800 text-[11px] font-bold rounded-lg cursor-pointer flex-1"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleStartPayment(hostel.id, 'RENT')}
                          className="px-2 py-1.5 bg-wood-600 hover:bg-wood-700 text-white text-[11px] font-bold rounded-lg cursor-pointer flex-1 text-center"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. PROFILE & KYC SUBTAB */}
        {subTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-8">
            {/* PERSONAL PROFILE SETTINGS CARD */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-wood-200/80 shadow-xs">
              <h2 className="font-display font-bold text-xl text-wood-950 mb-1">Account Settings & Profile</h2>
              <p className="text-xs text-wood-500 mb-6">View and update your personal information, department, and tertiary institution details.</p>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                {updateSuccess && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Your profile has been successfully saved & synced to settings!</span>
                  </div>
                )}
                {updateError && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-800 rounded-2xl text-xs font-semibold">
                    {updateError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-wood-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-wood-700 mb-1">Department / Course</label>
                    <input
                      type="text"
                      value={profileDept}
                      onChange={(e) => setProfileDept(e.target.value)}
                      className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-wood-700 mb-1">Phone Number (NGR)</label>
                    <input
                      type="tel"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-wood-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-wood-700 mb-1">Tertiary Institution</label>
                    <SchoolSelect
                      schools={schools}
                      value={profileSchool}
                      onChange={(schoolId) => setProfileSchool(schoolId)}
                      placeholder="Choose Institution..."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-wood-700 mb-1">Profile Avatar URL</label>
                    <input
                      type="text"
                      value={profilePic}
                      onChange={(e) => setProfilePic(e.target.value)}
                      placeholder="https://example.com/avatar.png"
                      className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                    />
                  </div>
                </div>

                {/* Profile Picture Upload Row */}
                <div className="bg-wood-50/50 p-4 rounded-2xl border border-wood-100 flex flex-col sm:flex-row items-center gap-4 text-left">
                  <img 
                    src={profilePic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"} 
                    alt="Profile Avatar" 
                    className="w-14 h-14 rounded-full object-cover border-2 border-wood-300 shadow-xs flex-shrink-0" 
                  />
                  <div className="flex-1 w-full space-y-1.5">
                    <label className="block font-bold text-wood-700">Upload Another Profile Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setProfilePic(event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-wood-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-wood-800 file:text-white hover:file:bg-wood-950 file:cursor-pointer"
                    />
                    <p className="text-[10px] text-wood-400 font-semibold">Supports JPG, PNG formats. Converts to Base64 automatically.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-wood-900 hover:bg-wood-950 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs uppercase tracking-wider"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>

            {/* DANGER ZONE: DELETE ACCOUNT */}
            <div className="bg-red-50/50 p-6 sm:p-8 rounded-3xl border border-red-200 shadow-xs text-left space-y-4">
              <div className="flex items-start space-x-3 text-red-800">
                <AlertTriangle size={24} className="text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-display font-bold text-base text-red-950">Danger Zone</h3>
                  <p className="text-xs text-red-700 mt-0.5 leading-normal">
                    Deleting your account is permanent. This will erase all your bookmarks, roommate flyers, bookings, and active chat histories from our database immediately.
                  </p>
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you absolutely sure you want to permanently delete your Dormiversity account? This action is completely irreversible.")) {
                      if (onDeleteAccount) {
                        onDeleteAccount(activeStudent.id);
                      }
                    }
                  }}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs uppercase tracking-wider"
                >
                  Permanently Delete My Account
                </button>
              </div>
            </div>


          </div>
        )}

      </div>

      {/* DYNAMIC HOSTEL DETAIL MODAL */}
      {detailedHostel && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-wood-200 shadow-2xl animate-scaleUp">
            
            <div className="relative h-64 bg-wood-100">
              <img src={detailedHostel.photos[0]} alt={detailedHostel.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setDetailedHostel(null)}
                className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-all cursor-pointer"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 flex gap-1.5">
                <span className="px-2.5 py-1 text-[10px] font-bold bg-wood-950 text-white rounded-md tracking-wider uppercase">
                  {detailedHostel.roomType}
                </span>
                <span className={`px-2.5 py-1 text-[10px] font-bold text-white rounded-md tracking-wider ${
                  detailedHostel.gender === 'Male' ? 'bg-blue-600' :
                  detailedHostel.gender === 'Female' ? 'bg-pink-600' : 'bg-wood-700'
                }`}>
                  {detailedHostel.gender.toUpperCase()} ONLY
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-wood-950 leading-tight">{detailedHostel.name}</h3>
                  <p className="text-xs text-wood-500 font-semibold flex items-center space-x-1 mt-1"><MapPin size={12} /><span>{detailedHostel.address}</span></p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-wood-950 text-xl leading-none">{formatNaira(detailedHostel.price)}</p>
                  <p className="text-[10px] text-wood-400 font-bold uppercase tracking-wider mt-1">/ session</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-wood-400 uppercase tracking-wider">About the Hostel</h4>
                <p className="text-sm text-wood-700 leading-relaxed">{detailedHostel.description}</p>
              </div>

              {/* Proximity / Travel */}
              <div className="bg-wood-50 p-4 rounded-xl border border-wood-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-wood-500">Campus Distance</span>
                  <p className="font-semibold text-wood-950 text-sm mt-0.5">{detailedHostel.proximity} km to School Gate</p>
                </div>
                <div>
                  <span className="font-bold text-wood-500">Listed Landlord</span>
                  <p className="font-semibold text-wood-950 text-sm mt-0.5">{detailedHostel.landlordName}</p>
                  {(() => {
                    const landlordUser = users?.find(u => u.id === detailedHostel.landlordId);
                    const schoolApprovalStatus = landlordUser?.kycDetails?.schoolApprovalStatus || 'Pending';
                    const verificationStatus = landlordUser?.kycStatus || 'NOT_SUBMITTED';
                    return landlordUser ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          verificationStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-150'
                        }`}>
                          {verificationStatus === 'APPROVED' ? '✓ ID Verified' : '⚠ ID Unverified'}
                        </span>
                        <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          schoolApprovalStatus === 'Approved' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          schoolApprovalStatus === 'Not Approved' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          🎓 School: {schoolApprovalStatus}
                        </span>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Amenities Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-wood-400 uppercase tracking-wider">Amenities Available</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-wood-700">
                  {detailedHostel.amenities.map(a => (
                    <div key={a} className="flex items-center space-x-2 bg-wood-50 border border-wood-100 p-2.5 rounded-xl">
                      <Check size={14} className="text-emerald-600 flex-shrink-0" />
                      <span className="font-semibold">{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* House Rules */}
              {detailedHostel.rules && detailedHostel.rules.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-wood-400 uppercase tracking-wider">Landlord House Rules</h4>
                  <ul className="space-y-1.5 text-xs text-wood-700 list-disc list-inside">
                    {detailedHostel.rules.map(r => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-6 border-t border-wood-100 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    onNavigateToChat(detailedHostel.landlordId, detailedHostel.id);
                    setDetailedHostel(null);
                  }}
                  className="px-5 py-3 border border-wood-200 hover:bg-wood-50 text-wood-800 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer sm:flex-1"
                >
                  <MessageSquare size={14} />
                  <span>Chat with Landlord</span>
                </button>

                <button
                  onClick={() => {
                    handleStartPayment(detailedHostel.id, 'INSPECTION');
                    setDetailedHostel(null);
                  }}
                  className="px-5 py-3 border border-wood-200 hover:bg-wood-50 text-wood-800 text-xs font-bold rounded-xl transition-all cursor-pointer sm:flex-1 text-center"
                >
                  Request Inspector (₦5,000)
                </button>

                <button
                  onClick={() => {
                    handleStartPayment(detailedHostel.id, 'RENT');
                    setDetailedHostel(null);
                  }}
                  className="px-5 py-3 bg-wood-600 hover:bg-wood-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer sm:flex-1 text-center"
                >
                  Book & Pay Escrow
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MOCK PAYSTACK OVERLAY PORTAL */}
      {showPaystackModal.isOpen && (
        <div className="fixed inset-0 bg-wood-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden border border-wood-200 shadow-2xl animate-scaleUp">
            
            {/* Paystack Premium Header */}
            <div className="p-5 bg-gradient-to-r from-[#011b33] via-[#09a5db] to-[#011b33] text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center space-x-3 relative z-10">
                <div className="p-2 bg-white/10 rounded-xl border border-white/20 backdrop-blur-xs">
                  <CreditCard size={18} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold tracking-tight text-sm">paystack</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-semibold">CHECKOUT</span>
                  </div>
                  <p className="text-[10px] text-white/80 font-medium">256-Bit SSL Encrypted Escrow Portal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaystackModal({ isOpen: false, hostelId: '', type: 'RENT' })}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-all cursor-pointer relative z-10"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Paystack Checkout Body */}
            <div className="p-6 space-y-5 text-xs text-wood-700">
              
              {/* PAYMENT DESTINATION & ESCROW VAULT CARD */}
              <div className="bg-gradient-to-br from-wood-50 via-white to-amber-50/30 p-4 rounded-2xl border border-wood-200 space-y-2 text-left shadow-2xs">
                <div className="flex justify-between items-center border-b border-wood-150 pb-2">
                  <span className="text-[10px] font-bold text-wood-400 uppercase tracking-wider flex items-center gap-1">
                    <Building size={12} className="text-wood-600" />
                    <span>Payment Destination</span>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Escrow Vault</span>
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-wood-950 text-sm">Dormiversity Escrow Account</h4>
                  <div className="flex items-center justify-between text-[11px] text-wood-500 mt-1">
                    <span>Merchant Reference ID:</span>
                    <span className="font-mono font-bold text-wood-800">PAY-DORM-{Math.floor(Math.random() * 90000) + 10000}</span>
                  </div>
                </div>
              </div>

              {showPaystackModal.type === 'RENT' ? (
                <div className="space-y-4">
                  {/* Inspection Choice Radio Group */}
                  <div className="bg-wood-50/70 p-4 rounded-2xl text-left border border-wood-200 space-y-3">
                    <p className="text-[10px] font-bold text-wood-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <ShieldCheck size={12} className="text-wood-600" />
                      <span>Vetting & Inspection Choice</span>
                    </p>
                    
                    <label className={`flex items-start space-x-3 cursor-pointer p-3 rounded-xl transition-all border ${
                      inspectionChoice === 'SELF' 
                        ? 'bg-white border-wood-600 shadow-2xs ring-1 ring-wood-500' 
                        : 'bg-white/60 border-wood-200 hover:bg-white'
                    }`}>
                      <input 
                        type="radio" 
                        name="inspection-opt" 
                        checked={inspectionChoice === 'SELF'} 
                        onChange={() => setInspectionChoice('SELF')}
                        className="mt-1 text-wood-600 focus:ring-wood-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-wood-900 text-xs">Inspect Myself (Free)</p>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">₦0 Extra</span>
                        </div>
                        <p className="text-[10px] text-wood-500 leading-normal mt-0.5">You will physically travel to inspect the room yourself during your 3-day active escrow window.</p>
                      </div>
                    </label>

                    <label className={`flex items-start space-x-3 cursor-pointer p-3 rounded-xl transition-all border ${
                      inspectionChoice === 'ROOMLY' 
                        ? 'bg-white border-amber-500 shadow-2xs ring-1 ring-amber-500' 
                        : 'bg-white/60 border-wood-200 hover:bg-white'
                    }`}>
                      <input 
                        type="radio" 
                        name="inspection-opt" 
                        checked={inspectionChoice === 'ROOMLY'} 
                        onChange={() => setInspectionChoice('ROOMLY')}
                        className="mt-1 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-wood-900 text-xs flex items-center gap-1">
                            <span>Request Roomly Inspector</span>
                          </p>
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-bold text-[9px]">+₦5,000</span>
                        </div>
                        <p className="text-[10px] text-wood-500 leading-normal mt-0.5">Hire a vetted on-campus student inspector to visit the room, run checking protocols, and upload full photographic reviews.</p>
                      </div>
                    </label>

                    {/* School Inspector Selector List */}
                    {inspectionChoice === 'ROOMLY' && (() => {
                      const hostel = hostels.find(h => h.id === showPaystackModal.hostelId);
                      const currentSchoolId = hostel?.schoolId || activeStudent.schoolId;
                      
                      // Strict filter: inspectors registered to student's/hostel's school
                      const schoolInspectors = (users || []).filter(u => 
                        u.role === 'INSPECTOR' && 
                        (u.schoolId === currentSchoolId || !u.schoolId || u.schoolId === activeStudent.schoolId)
                      );
                      const currentSchool = schools.find(s => s.id === currentSchoolId);

                      return (
                        <div className="mt-3 pt-3 border-t border-wood-200 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-wood-950">Available Inspectors at {currentSchool?.name || 'Your School'}:</span>
                            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {schoolInspectors.filter(i => !jobs.some(j => j.inspectorId === i.id && j.status !== 'COMPLETED')).length} Available
                            </span>
                          </div>
                          
                          {schoolInspectors.length === 0 ? (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center text-amber-800 text-xs">
                              No inspectors currently registered at {currentSchool?.name || 'this school'}. System will auto-assign a roving campus inspector.
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                              {schoolInspectors.map(inspector => {
                                // Check if inspector is currently hired / on assignment
                                const activeJob = jobs.find(j => j.inspectorId === inspector.id && j.status !== 'COMPLETED');
                                const isBusy = !!activeJob;
                                const isSelected = selectedInspectorId === inspector.id || (!selectedInspectorId && !isBusy && inspector.id === schoolInspectors.find(i => !jobs.some(j => j.inspectorId === i.id && j.status !== 'COMPLETED'))?.id);

                                return (
                                  <div
                                    key={inspector.id}
                                    onClick={() => {
                                      if (isBusy) {
                                        alert(`${inspector.name} is currently hired by another student for an inspection and cannot accept new requests until they complete their current assignment.`);
                                        return;
                                      }
                                      setSelectedInspectorId(inspector.id);
                                    }}
                                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                                      isBusy 
                                        ? 'bg-gray-100 border-gray-300 opacity-70 cursor-not-allowed' 
                                        : isSelected 
                                          ? 'bg-amber-100/80 border-amber-500 ring-1 ring-amber-500 shadow-3xs cursor-pointer' 
                                          : 'bg-white border-wood-200 hover:bg-wood-50 cursor-pointer'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2.5">
                                      <div className="w-8 h-8 rounded-full bg-wood-200 overflow-hidden shrink-0 border border-wood-300">
                                        {inspector.profilePicture ? (
                                          <img src={inspector.profilePicture} alt={inspector.name} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full bg-wood-700 text-white font-bold flex items-center justify-center text-xs">
                                            {inspector.name.charAt(0)}
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <h5 className="font-bold text-xs text-wood-950 flex items-center gap-1">
                                          <span>{inspector.name}</span>
                                          <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">VERIFIED</span>
                                        </h5>
                                        <p className="text-[10px] text-wood-500">
                                          {currentSchool?.abbreviation || currentSchool?.name || 'Campus Inspector'}
                                        </p>
                                      </div>
                                    </div>

                                    <div>
                                      {isBusy ? (
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-amber-200 text-amber-900 border border-amber-300">
                                          🔒 BUSY / ON ASSIGNMENT
                                        </span>
                                      ) : (
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${isSelected ? 'bg-amber-900 text-white shadow-3xs' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                                          {isSelected ? '✓ Selected' : 'Choose'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-2xl text-left">
                    <div className="flex items-start space-x-2.5 text-amber-900">
                      <Shield className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <h5 className="font-bold text-xs text-amber-950">Rent Escrow Security</h5>
                        <p className="text-[10px] mt-0.5 text-amber-800 leading-relaxed">Your payment stays locked in our escrow vault. The landlord will not receive a single Naira until you complete the physical inspection and confirm your satisfaction (maximum of 3 days after payment).</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-2xl text-left">
                  <div className="flex items-start space-x-2.5 text-blue-900">
                    <Check className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <h5 className="font-bold text-xs text-blue-950">Roomly Vetting Fee</h5>
                      <p className="text-[10px] mt-0.5 text-blue-800 leading-relaxed">You are hiring a local student inspector to perform physical verification of structural details. Fee is ₦5,000.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount Breakdown & Total */}
              <div className="bg-wood-50 p-4 rounded-2xl border border-wood-200 space-y-2 text-left">
                <div className="flex justify-between text-[11px] text-wood-600">
                  <span>
                    {showPaystackModal.type === 'RENT' ? 'Hostel Annual Rent:' : 'Vetting Fee:'}
                  </span>
                  <span className="font-bold">
                    {showPaystackModal.type === 'RENT'
                      ? formatNaira(hostels.find(h => h.id === showPaystackModal.hostelId)?.price || 0)
                      : '₦5,000'}
                  </span>
                </div>
                {showPaystackModal.type === 'RENT' && inspectionChoice === 'ROOMLY' && (
                  <div className="flex justify-between text-[11px] text-amber-800 font-medium">
                    <span>On-Campus Inspector Fee:</span>
                    <span className="font-bold">₦5,000</span>
                  </div>
                )}
                <div className="border-t border-wood-200 pt-2 flex justify-between items-center">
                  <span className="text-xs font-extrabold text-wood-950 uppercase tracking-wider">Total Amount Payable</span>
                  <span className="font-extrabold text-emerald-700 text-2xl font-display">
                    {showPaystackModal.type === 'RENT'
                      ? formatNaira((hostels.find(h => h.id === showPaystackModal.hostelId)?.price || 0) + (inspectionChoice === 'ROOMLY' ? 5000 : 0))
                      : '₦5,000'
                    }
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-left space-y-1 text-[11px] text-emerald-900 leading-relaxed">
                <span className="font-bold text-emerald-950 flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Verified Escrow Channel</span>
                </span>
                <p className="text-[10px] text-emerald-800">Your payment is collected and stored in Dormiversity's institutional escrow account. The landlord cannot touch these funds until you inspect the property or 3 days elapse.</p>
              </div>

              {isProcessingPayment ? (
                <div className="py-4 space-y-2 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <Clock className="text-[#3bb75e] animate-spin mx-auto" size={24} />
                  <p className="text-[#3bb75e] font-bold text-xs animate-pulse">Launching Paystack Secure Gateway...</p>
                </div>
              ) : (
                <button
                  onClick={handleConfirmPaystackPayment}
                  className="w-full py-3.5 bg-[#3bb75e] hover:bg-[#329f51] text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center space-x-2 group"
                >
                  <Lock size={15} className="group-hover:scale-110 transition-transform" />
                  <span>Proceed to Paystack Checkout</span>
                </button>
              )}

              <p className="text-[10px] text-wood-400 flex items-center justify-center space-x-1 pt-1">
                <ShieldCheck className="text-emerald-600" size={12} />
                <span>Secured by Paystack • PCIDSS Level 1 Compliant</span>
              </p>
            </div>

          </div>
        </div>
      )}

      {/* 6. HELP & FAQS SUBTAB */}
      {subTab === 'faqs' && (
        <div className="mt-4">
          <FaqSection userRole="STUDENT" />
        </div>
      )}

      {/* REPORT HOSTEL MODAL */}
      <ReportHostelModal
        isOpen={reportModal.isOpen}
        hostelId={reportModal.hostelId}
        hostelName={reportModal.hostelName}
        onClose={() => setReportModal({ isOpen: false, hostelId: '', hostelName: '' })}
      />

      {/* REFUND MODAL WITH AUTOMATIC BANK ACCOUNT VERIFICATION */}
      <RefundModal
        isOpen={refundModal.isOpen}
        bookingId={refundModal.bookingId}
        hostelName={refundModal.hostelName}
        amount={refundModal.amount}
        currentStatus={refundModal.currentStatus}
        onClose={() => setRefundModal({ isOpen: false, bookingId: '', hostelName: '', amount: 0, currentStatus: '' })}
        onRefundSubmitted={() => {
          if (onCancelBooking) {
            onCancelBooking(refundModal.bookingId, "Refund requested with bank account details");
          }
        }}
      />

      {/* REPORT INSPECTOR MODAL */}
      {reportInspectorModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-wood-200 relative space-y-4">
            <button
              onClick={() => {
                setReportInspectorModal({ isOpen: false, inspectorId: '', inspectorName: '', hostelName: '' });
                setInspectorReportSuccess(false);
              }}
              className="absolute top-4 right-4 text-wood-400 hover:text-wood-700 p-1 rounded-full hover:bg-wood-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Flag size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-wood-950">Report Inspector Behavior</h3>
                <p className="text-xs text-wood-500">Inspector: {reportInspectorModal.inspectorName}</p>
              </div>
            </div>

            {inspectorReportSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="mx-auto text-emerald-600" size={32} />
                <h4 className="font-bold text-sm text-emerald-950">Report Submitted to Compliance</h4>
                <p className="text-xs text-emerald-800">
                  Thank you for keeping Dormiversity safe. Our safety board has received your complaint regarding <strong>{reportInspectorModal.inspectorName}</strong> and will review the case within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setReportInspectorModal({ isOpen: false, inspectorId: '', inspectorName: '', hostelName: '' });
                    setInspectorReportSuccess(false);
                  }}
                  className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setInspectorReportSuccess(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-wood-800 mb-1">Reason for Complaint</label>
                  <select
                    value={inspectorReportReason}
                    onChange={(e) => setInspectorReportReason(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-wood-300 bg-wood-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Unprofessional Behavior">Unprofessional or Rude Behavior</option>
                    <option value="Demanding Extra Cash">Demanding Extra Unofficial Cash / Extortion</option>
                    <option value="Fake Inspection Report">Submitted False/Inaccurate Inspection Report</option>
                    <option value="No Show / Delayed">No-Show / Unreachable for Scheduled Visit</option>
                    <option value="Harassment">Safety / Harassment Concern</option>
                    <option value="Other">Other Issues</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-wood-800 mb-1">Detailed Description & Evidence Notes</label>
                  <textarea
                    rows={4}
                    required
                    value={inspectorReportNotes}
                    onChange={(e) => setInspectorReportNotes(e.target.value)}
                    placeholder="Provide details about what happened during the hostel inspection visit..."
                    className="w-full text-xs p-3 rounded-xl border border-wood-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-wood-50 focus:bg-white"
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start space-x-2">
                  <ShieldAlert size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Inspectors with 2+ verified infractions face immediate suspension and loss of their campus verification badge.
                  </span>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportInspectorModal({ isOpen: false, inspectorId: '', inspectorName: '', hostelName: '' })}
                    className="px-4 py-2 bg-wood-100 hover:bg-wood-200 text-wood-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs flex items-center space-x-1"
                  >
                    <Flag size={13} />
                    <span>Submit Formal Report</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
