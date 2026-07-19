import React, { useState, useEffect } from 'react';
import { Search, MapPin, Compass, Shield, Users, Bookmark, FileText, CheckCircle2, ShieldAlert, Heart, Calendar, CreditCard, ChevronRight, MessageSquare, Plus, Check, Clock, UserCheck, AlertTriangle } from 'lucide-react';
import { Hostel, School, Booking, InspectorJob, CohabitantPost, User } from '../types';
import { formatNaira, formatDate } from '../utils';
import SchoolSelect from './SchoolSelect';
import CustomSelect from './CustomSelect';

interface StudentDashboardProps {
  activeStudent: User;
  schools: School[];
  hostels: Hostel[];
  bookings: Booking[];
  jobs: InspectorJob[];
  cohabitants: CohabitantPost[];
  bookmarks: string[];
  onToggleBookmark: (hostelId: string) => void;
  onBookHostel: (hostelId: string, inspectionChoice?: 'SELF' | 'ROOMLY') => void;
  onRequestInspection: (hostelId: string) => void;
  onConfirmSatisfaction: (bookingId: string) => void;
  onOpenDispute: (bookingId: string, reason: string, evidence: string) => void;
  onNavigateToChat: (otherId: string, hostelId?: string, bookingId?: string) => void;
  onCreateCohabitantPost: (post: Omit<CohabitantPost, 'id' | 'studentId' | 'studentName' | 'studentPhoto' | 'createdAt' | 'isClosed'>) => void;
  onCloseCohabitantPost: (postId: string) => void;
  onUploadStudentKYC: (idType: string, idNumber: string) => void;
  onUpdateProfile?: (updatedUser: User) => void;
  initialSubTab?: 'search' | 'bookings' | 'roommates' | 'bookmarks' | 'profile';
}

export default function StudentDashboard({
  activeStudent,
  schools,
  hostels,
  bookings,
  jobs,
  cohabitants,
  bookmarks,
  onToggleBookmark,
  onBookHostel,
  onRequestInspection,
  onConfirmSatisfaction,
  onOpenDispute,
  onNavigateToChat,
  onCreateCohabitantPost,
  onCloseCohabitantPost,
  onUploadStudentKYC,
  onUpdateProfile,
  initialSubTab
}: StudentDashboardProps) {
  const [subTab, setSubTab] = useState<'search' | 'bookings' | 'roommates' | 'bookmarks' | 'profile'>(initialSubTab || 'search');

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>(activeStudent.schoolId || '');
  const [maxBudget, setMaxBudget] = useState<number>(500000);
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Inspection Choice selection during Rent Booking
  const [inspectionChoice, setInspectionChoice] = useState<'SELF' | 'ROOMLY'>('SELF');

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
  const [mockCard, setMockCard] = useState('access');
  const [disputeBookingId, setDisputeBookingId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  
  // KYC form states
  const [kycIdType, setKycIdType] = useState('Student ID Card');
  const [kycIdNumber, setKycIdNumber] = useState('');
  const [kycSubmitted, setKycSubmitted] = useState(false);

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

  // Filtering hostels
  const filteredHostels = hostels.filter(hostel => {
    const matchesKeyword = hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) || hostel.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchool = selectedSchool ? hostel.schoolId === selectedSchool : true;
    const matchesBudget = hostel.price <= maxBudget;
    const matchesGender = selectedGender ? hostel.gender === selectedGender || hostel.gender === 'Mixed' : true;
    const matchesType = selectedRoomType ? hostel.roomType === selectedRoomType : true;
    const matchesAmenities = selectedAmenities.every(amenity => hostel.amenities.includes(amenity));
    return matchesKeyword && matchesSchool && matchesBudget && matchesGender && matchesType && matchesAmenities && hostel.isAvailable;
  });

  const studentBookings = bookings.filter(b => b.studentId === activeStudent.id);
  const studentJobs = jobs.filter(j => j.studentId === activeStudent.id);
  const bookmarkedHostels = hostels.filter(h => bookmarks.includes(h.id));

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

  const handleConfirmPaystackPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowPaystackModal({ isOpen: false, hostelId: '', type: 'RENT' });
      
      if (showPaystackModal.type === 'RENT') {
        onBookHostel(showPaystackModal.hostelId, inspectionChoice);
      } else {
        onRequestInspection(showPaystackModal.hostelId);
      }
    }, 2000);
  };

  const handleSubmitDispute = (bookingId: string) => {
    if (!disputeReason.trim()) return;
    onOpenDispute(bookingId, disputeReason, disputeEvidence || 'Photographic evidence attached to file.');
    setDisputeBookingId(null);
    setDisputeReason('');
    setDisputeEvidence('');
  };

  const handleCreateRoommatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostDescription.trim() || !activeStudent.schoolId) return;

    onCreateCohabitantPost({
      schoolId: activeStudent.schoolId,
      budget: newPostBudget,
      gender: activeStudent.kycDetails?.idType ? 'Female' : 'Male', // Mock gender based on profile or fallback
      habits: newPostHabits.length > 0 ? newPostHabits : ['Studious', 'Quiet'],
      description: newPostDescription
    });

    setShowCreatePostModal(false);
    setNewPostDescription('');
    setNewPostHabits([]);
  };

  const toggleNewPostHabit = (habit: string) => {
    setNewPostHabits(prev => 
      prev.includes(habit) ? prev.filter(h => h !== habit) : [...prev, habit]
    );
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycIdNumber.trim()) return;
    onUploadStudentKYC(kycIdType, kycIdNumber);
    setKycSubmitted(true);
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

          <div className="flex bg-wood-50 p-1.5 rounded-2xl border border-wood-200 overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => setSubTab('search')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${subTab === 'search' ? 'bg-white text-wood-950 shadow-xs' : 'text-wood-600 hover:text-wood-950'}`}
            >
              Search Hostels
            </button>
            <button
              onClick={() => setSubTab('roommates')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${subTab === 'roommates' ? 'bg-white text-wood-950 shadow-xs' : 'text-wood-600 hover:text-wood-950'}`}
            >
              Roommates Find
            </button>
            <button
              onClick={() => setSubTab('bookings')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap relative ${subTab === 'bookings' ? 'bg-white text-wood-950 shadow-xs' : 'text-wood-600 hover:text-wood-950'}`}
            >
              My Bookings
              {studentBookings.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-wood-500 text-white rounded-full text-[10px] font-bold">
                  {studentBookings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setSubTab('bookmarks')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${subTab === 'bookmarks' ? 'bg-white text-wood-950 shadow-xs' : 'text-wood-600 hover:text-wood-950'}`}
            >
              Bookmarks
            </button>
            <button
              onClick={() => setSubTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${subTab === 'profile' ? 'bg-white text-wood-950 shadow-xs' : 'text-wood-600 hover:text-wood-950'}`}
            >
              Profile / KYC
            </button>
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
                  placeholder="Search by street name, landmark, or hostel name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-0 outline-hidden focus:ring-0 text-sm text-wood-950 placeholder-wood-400"
                />
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
                    const alreadyBooked = studentBookings.some(b => b.hostelId === hostel.id);
                    
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
                              className="px-3.5 py-2.5 bg-wood-50 hover:bg-wood-100 text-wood-800 text-xs font-semibold rounded-xl transition-all cursor-pointer flex-1"
                            >
                              Explore Details
                            </button>
                            
                            {alreadyBooked ? (
                              <button
                                disabled
                                className="px-3.5 py-2.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 cursor-not-allowed flex-1"
                              >
                                <CheckCircle2 size={14} />
                                <span>Booked</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartPayment(hostel.id, 'RENT')}
                                className="px-3.5 py-2.5 bg-wood-600 hover:bg-wood-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs flex-1 text-center"
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
              studentBookings.map(booking => {
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
                        <h4 className="text-xs font-bold text-wood-700 uppercase tracking-wider mb-2">Roomly Inspection Report</h4>
                        {inspection ? (
                          <div className="bg-wood-50 p-4 rounded-xl border border-wood-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <p className="font-bold text-wood-950 text-sm">Vetting Status: {inspection.status}</p>
                              <p className="text-xs text-wood-500 mt-0.5">Assigned Inspector: {inspection.inspectorName || 'Tunde Alao'}</p>
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

                        {booking.status === 'IN_ESCROW' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setDisputeBookingId(booking.id)}
                              className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                              Not Satisfied / Dispute
                            </button>
                            <button
                              onClick={() => onConfirmSatisfaction(booking.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                            >
                              Satisfied / Release Rent (90%)
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Open Dispute Dialog Box */}
                      {disputeBookingId === booking.id && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl space-y-4 animate-fadeIn mt-4">
                          <div className="flex items-start space-x-2">
                            <ShieldAlert className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
                            <div>
                              <h5 className="text-xs font-bold text-red-800">Escalate Escrow Dispute</h5>
                              <p className="text-[11px] text-red-700 leading-normal mt-0.5">Please outline what was wrong with the room. Funds will be completely frozen from being transferred to the Landlord until our Admin Support resolves the case.</p>
                            </div>
                          </div>

                          <div className="space-y-3 text-xs">
                            <div>
                              <label className="block font-bold text-wood-700 mb-1">Reason for Dispute</label>
                              <textarea
                                value={disputeReason}
                                onChange={(e) => setDisputeReason(e.target.value)}
                                placeholder="E.g., Borehole is completely broken, landlord has no light, room size is 50% smaller than photos..."
                                className="w-full bg-white border border-wood-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-hidden"
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-wood-700 mb-1">Evidence (Mock upload)</label>
                              <input
                                type="text"
                                value={disputeEvidence}
                                onChange={(e) => setDisputeEvidence(e.target.value)}
                                placeholder="E.g., photo_bathroom_leak.jpg, video_broken_borehole.mp4"
                                className="w-full bg-white border border-wood-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-hidden"
                              />
                            </div>

                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setDisputeBookingId(null)}
                                className="px-3.5 py-1.5 bg-white text-wood-700 border border-wood-200 rounded-lg font-semibold cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSubmitDispute(booking.id)}
                                disabled={!disputeReason.trim()}
                                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg font-bold cursor-pointer"
                              >
                                Submit to Admin
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 3. ROOMMATE MATCHER SUBTAB */}
        {subTab === 'roommates' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-wood-200 pb-3">
              <div>
                <h2 className="font-display font-bold text-xl text-wood-950">Roommate Matching Flyer Space</h2>
                <p className="text-xs text-wood-500 mt-1">Browse other tertiary students looking to split hostel costs, or create your own post.</p>
              </div>
              <button
                onClick={() => setShowCreatePostModal(true)}
                className="px-4 py-2.5 bg-wood-600 hover:bg-wood-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Publish Post</span>
              </button>
            </div>

            {/* Create Roommate Post Modal Overlay */}
            {showCreatePostModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
                <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-wood-200 shadow-2xl animate-scaleUp">
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
                      <label className="block font-bold text-wood-700 mb-1">Description (Tell prospective matches about yourself)</label>
                      <textarea
                        value={newPostDescription}
                        onChange={(e) => setNewPostDescription(e.target.value)}
                        placeholder="E.g., I am in 300 Level CS, I study a lot, very clean, am looking to find someone to rent a self-contain apartment with..."
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
              {cohabitants.map(post => {
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
              })}
            </div>
          </div>
        )}

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
                    <label className="block font-bold text-wood-700 mb-1">Phone Number (NGR)</label>
                    <input
                      type="tel"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-wood-700 mb-1">Email Address (Read-only)</label>
                    <input
                      type="email"
                      disabled
                      value={profileEmail}
                      className="w-full bg-wood-100 border border-wood-200 rounded-xl px-3 py-2 text-sm text-wood-500 cursor-not-allowed outline-hidden"
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

            {/* IDENTITY VERIFICATION CARD */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-wood-200/80 shadow-xs">
              <h2 className="font-display font-bold text-xl text-wood-950 mb-1">Verify Student Identity Card</h2>
              <p className="text-xs text-wood-500 mb-6">Verified students receive an "ID Verified Badge" on roommate finder lists, improving matches.</p>

              {activeStudent.kycStatus === 'APPROVED' ? (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex items-start space-x-3 text-emerald-800">
                  <CheckCircle2 size={24} className="text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-base flex items-center space-x-1.5">
                      <span>Verification Approved!</span>
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">VERIFIED</span>
                    </h4>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                      Your identity credentials ({activeStudent.kycDetails?.idType}) have been reviewed and approved by Dormiversity Administration. Your roommate flyer is marked with a checkmark badge.
                    </p>
                  </div>
                </div>
              ) : activeStudent.kycStatus === 'PENDING' ? (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start space-x-3 text-amber-800">
                  <Clock size={24} className="text-amber-600 flex-shrink-0 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-base">KYC Review Pending</h4>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      You have uploaded your student details. Our System Administrators are auditing the NIN slip/School registration document. Review time is typically less than an hour in this Demo.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleKycSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-wood-700 mb-1">Card Document Type</label>
                      <CustomSelect
                        value={kycIdType}
                        onChange={(val) => setKycIdType(val)}
                        options={[
                          { value: 'Student ID Card', label: 'Student Registration ID Card' },
                          { value: 'National Identity Number (NIN)', label: 'NIN Slip Card' },
                          { value: 'Voter\'s Card', label: 'Permanent Voter\'s Card (PVC)' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-wood-700 mb-1">ID Registration Number</label>
                      <input
                        type="text"
                        value={kycIdNumber}
                        onChange={(e) => setKycIdNumber(e.target.value)}
                        placeholder="E.g., CSS/2023/048 or 100984725384"
                        className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-wood-700 mb-1">Upload Photo (Drag-and-drop simulated)</label>
                    <div className="border border-dashed border-wood-300 rounded-2xl bg-wood-50/50 p-6 text-center">
                      <FileText size={28} className="text-wood-400 mx-auto mb-2" />
                      <p className="font-bold text-wood-950">Click or Drag your ID photo file here</p>
                      <p className="text-[10px] text-wood-500 mt-0.5">Supports PDF, JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-wood-600 hover:bg-wood-700 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Submit KYC for Audit
                  </button>
                </form>
              )}
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
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden border border-wood-200 shadow-2xl animate-scaleUp">
            
            {/* Paystack Header */}
            <div className="p-5 bg-[#09a5db] text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <CreditCard size={20} />
                <span className="font-bold tracking-tight">paystack Checkout</span>
              </div>
              <button
                onClick={() => setShowPaystackModal({ isOpen: false, hostelId: '', type: 'RENT' })}
                className="text-white/80 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Paystack Checkout Content */}
            <div className="p-6 text-center space-y-6 text-xs">
              <div>
                <p className="text-wood-400 font-semibold uppercase tracking-wider">PAYMENT DESTINATION</p>
                <h4 className="font-bold text-wood-950 text-sm mt-1">Dormiversity Escrow Account</h4>
                <p className="text-[10px] text-wood-400 mt-0.5">Reference ID: PAY-DORM-{Math.floor(Math.random() * 90000) + 10000}</p>
              </div>

              {showPaystackModal.type === 'RENT' ? (
                <div className="space-y-4">
                  {/* Inspection Choice Radio Group */}
                  <div className="bg-wood-50 p-4 rounded-2xl text-left border border-wood-200 space-y-3">
                    <p className="text-[10px] font-bold text-wood-500 uppercase tracking-wider mb-1">Vetting & Inspection Choice</p>
                    
                    <label className="flex items-start space-x-3 cursor-pointer p-2 rounded-xl hover:bg-white transition-all">
                      <input 
                        type="radio" 
                        name="inspection-opt" 
                        checked={inspectionChoice === 'SELF'} 
                        onChange={() => setInspectionChoice('SELF')}
                        className="mt-1 text-wood-600 focus:ring-wood-500"
                      />
                      <div>
                        <p className="font-bold text-wood-900 text-xs">Inspect Myself (Free)</p>
                        <p className="text-[10px] text-wood-500 leading-normal">You will physically travel to inspect the room yourself during your 3-day active escrow window.</p>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer p-2 rounded-xl hover:bg-white transition-all border border-transparent checked:border-wood-200">
                      <input 
                        type="radio" 
                        name="inspection-opt" 
                        checked={inspectionChoice === 'ROOMLY'} 
                        onChange={() => setInspectionChoice('ROOMLY')}
                        className="mt-1 text-wood-600 focus:ring-wood-500"
                      />
                      <div>
                        <p className="font-bold text-wood-900 text-xs flex items-center gap-1">
                          <span>Request Roomly Inspector</span>
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold text-[9px]">+₦5,000</span>
                        </p>
                        <p className="text-[10px] text-wood-500 leading-normal">Hire a vetted on-campus student inspector to visit the room, run checking protocols, and upload full photographic reviews.</p>
                      </div>
                    </label>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-left">
                    <div className="flex items-start space-x-2 text-amber-800">
                      <Shield className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <h5 className="font-bold">Rent Escrow Security</h5>
                        <p className="text-[10px] mt-0.5 text-amber-700 leading-normal">Your payment stays locked in our escrow vault. The landlord will not receive a single Naira until you complete the physical inspection and confirm your satisfaction (maximum of 3 days after payment).</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-left">
                  <div className="flex items-start space-x-2 text-blue-800">
                    <Check className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <h5 className="font-bold">Roomly Vetting Fee</h5>
                      <p className="text-[10px] mt-0.5 text-blue-700 leading-normal">You are hiring a local student inspector to perform physical verification of structural details. Fee is ₦5,000.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-b border-wood-100 py-4">
                <p className="text-wood-400 font-bold uppercase tracking-wider">Amount Payable</p>
                <p className="font-bold text-wood-950 text-2xl mt-1">
                  {showPaystackModal.type === 'RENT'
                    ? formatNaira((hostels.find(h => h.id === showPaystackModal.hostelId)?.price || 0) + (inspectionChoice === 'ROOMLY' ? 5000 : 0))
                    : '₦5,000'
                  }
                </p>
                {showPaystackModal.type === 'RENT' && inspectionChoice === 'ROOMLY' && (
                  <p className="text-[9px] text-wood-500 font-semibold mt-0.5">
                    Includes ₦5,000 Inspection Fee
                  </p>
                )}
              </div>

              <div className="space-y-2 text-left">
                <label className="block font-bold text-wood-700">Choose Card (Mock Mode)</label>
                <CustomSelect
                  value={mockCard}
                  onChange={(val) => setMockCard(val)}
                  options={[
                    { value: 'access', label: 'Access Bank Visa (•••• 4920)' },
                    { value: 'gtb', label: 'GTBank Mastercard (•••• 8821)' }
                  ]}
                />
              </div>

              {isProcessingPayment ? (
                <div className="py-4 space-y-2">
                  <Clock className="text-[#09a5db] animate-spin mx-auto" size={24} />
                  <p className="text-[#09a5db] font-bold animate-pulse">Contacting Paystack Gateway...</p>
                </div>
              ) : (
                <button
                  onClick={handleConfirmPaystackPayment}
                  className="w-full py-3 bg-[#3bb75e] hover:bg-[#329f51] text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
                >
                  Simulate Payment Success
                </button>
              )}

              <p className="text-[10px] text-wood-400 flex items-center justify-center space-x-1">
                <ShieldCheck className="text-emerald-600" size={12} />
                <span>Secured by Paystack. PCIDSS Compliant.</span>
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function ShieldCheck({ className, size }: { className?: string; size?: number }) {
  return <Check className={className} size={size} />;
}
