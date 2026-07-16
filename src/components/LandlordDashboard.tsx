import React, { useState } from 'react';
import { Home, ShieldAlert, CheckCircle2, Shield, Plus, Power, Users, DollarSign, MessageSquare, List, ClipboardCheck, Clock, FileText, ChevronRight, X, User } from 'lucide-react';
import { Hostel, Booking, InspectorJob, User as PlatformUser, School } from '../types';
import { formatNaira, formatDate } from '../utils';
import SchoolSelect from './SchoolSelect';

interface LandlordDashboardProps {
  activeLandlord: PlatformUser;
  schools: School[];
  hostels: Hostel[];
  bookings: Booking[];
  jobs: InspectorJob[];
  onUploadKYC: (details: { idType: string; idNumber: string; idImage: string; proofDoc: string; bankName: string; bankAccount: string; bankAccountName: string }) => void;
  onAddListing: (listing: Omit<Hostel, 'id' | 'landlordId' | 'landlordName' | 'reviewsCount' | 'rating'>) => void;
  onToggleListingAvailable: (hostelId: string) => void;
  onNavigateToChat: (studentId: string, hostelId?: string, bookingId?: string) => void;
  onUpdateProfile?: (updatedUser: PlatformUser) => void;
}

export default function LandlordDashboard({
  activeLandlord,
  schools,
  hostels,
  bookings,
  jobs,
  onUploadKYC,
  onAddListing,
  onToggleListingAvailable,
  onNavigateToChat,
  onUpdateProfile
}: LandlordDashboardProps) {
  const [subTab, setSubTab] = useState<'listings' | 'escrows' | 'payouts' | 'profile'>('listings');
  const [showAddModal, setShowAddModal] = useState(false);

  // Profile settings state
  const [profileName, setProfileName] = useState(activeLandlord.name);
  const [profilePhone, setProfilePhone] = useState(activeLandlord.phone);
  const [profileEmail, setProfileEmail] = useState(activeLandlord.email);
  const [profilePic, setProfilePic] = useState(activeLandlord.profilePicture || '');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  React.useEffect(() => {
    setProfileName(activeLandlord.name);
    setProfilePhone(activeLandlord.phone);
    setProfileEmail(activeLandlord.email);
    setProfilePic(activeLandlord.profilePicture || '');
  }, [activeLandlord.id, activeLandlord.name, activeLandlord.phone, activeLandlord.email, activeLandlord.profilePicture]);

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
        ...activeLandlord,
        name: profileName,
        phone: cleanPhone.startsWith('234') ? `0${cleanPhone.slice(3)}` : cleanPhone,
        email: profileEmail,
        profilePicture: profilePic || activeLandlord.profilePicture
      });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  // Listing Form State
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState<number>(250000);
  const [newAddress, setNewAddress] = useState('');
  const [newProximity, setNewProximity] = useState<number>(0.5);
  const [newSchoolId, setNewSchoolId] = useState(schools[0]?.id || '');
  const [newRoomType, setNewRoomType] = useState<'Self-Contain' | 'Shared (2-in-a-room)' | 'Shared (4-in-a-room)' | 'Single Room'>('Self-Contain');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Mixed'>('Mixed');
  const [newDescription, setNewDescription] = useState('');
  const [newAmenities, setNewAmenities] = useState<string[]>([]);
  const [newRules, setNewRules] = useState<string[]>([]);
  const [ruleInput, setRuleInput] = useState('');

  // Onboarding Form State
  const [onboardIdType, setOnboardIdType] = useState('National ID Card (NIN)');
  const [onboardIdNum, setOnboardIdNum] = useState('');
  const [onboardBankName, setOnboardBankName] = useState('Access Bank');
  const [onboardAccountNum, setOnboardAccountNum] = useState('');
  const [onboardAccountName, setOnboardAccountName] = useState('');

  // Filter listings belonging to landlord
  const landlordHostels = hostels.filter(h => h.landlordId === activeLandlord.id);
  const landlordBookings = bookings.filter(b => b.landlordId === activeLandlord.id);
  
  // Aggregate stats
  const totalHostels = landlordHostels.length;
  const activeRentHeld = landlordBookings.filter(b => b.status === 'IN_ESCROW').reduce((acc, b) => acc + b.price, 0);
  const totalPayoutReleased = landlordBookings.filter(b => b.status === 'RELEASED').reduce((acc, b) => acc + (b.price * 0.9), 0); // 10% commission subtracted

  const handleToggleAmenity = (amenity: string) => {
    setNewAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddRule = () => {
    if (ruleInput.trim()) {
      setNewRules(prev => [...prev, ruleInput.trim()]);
      setRuleInput('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setNewRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAddress.trim()) return;

    onAddListing({
      name: newName,
      price: newPrice,
      address: newAddress,
      proximity: newProximity,
      schoolId: newSchoolId,
      roomType: newRoomType,
      gender: newGender,
      description: newDescription,
      amenities: newAmenities,
      rules: newRules,
      photos: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400'
      ],
      isAvailable: true
    });

    setShowAddModal(false);
    setNewName('');
    setNewPrice(250000);
    setNewAddress('');
    setNewProximity(0.5);
    setNewDescription('');
    setNewAmenities([]);
    setNewRules([]);
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardIdNum.trim() || !onboardAccountNum.trim() || !onboardAccountName.trim()) return;

    onUploadKYC({
      idType: onboardIdType,
      idNumber: onboardIdNum,
      idImage: 'ID_Document_' + activeLandlord.name.replace(/\s+/g, '_') + '.jpg',
      proofDoc: 'C_of_O_Property_' + activeLandlord.name.replace(/\s+/g, '_') + '.pdf',
      bankName: onboardBankName,
      bankAccount: onboardAccountNum,
      bankAccountName: onboardAccountName
    });
  };

  return (
    <div className="bg-wood-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* LANDLORD PROFILE KYC GATED LOGIC */}
        {activeLandlord.kycStatus === 'NOT_SUBMITTED' || activeLandlord.kycStatus === 'REJECTED' ? (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-wood-200/80 p-8 shadow-md">
            <div className="text-center mb-8">
              <div className="bg-amber-100 text-amber-700 p-3 rounded-2xl w-fit mx-auto mb-4">
                <ShieldAlert size={32} />
              </div>
              <h2 className="font-display font-bold text-2xl text-wood-950">Landlord Verification Gate</h2>
              <p className="text-xs text-wood-500 mt-2 max-w-md mx-auto leading-relaxed">
                Before listing hostels, Nigerian laws and Dormiversity safety mandates require government identification (NIN) and proof of property management.
              </p>
              {activeLandlord.kycStatus === 'REJECTED' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-left max-w-md mx-auto mt-4 text-xs">
                  <p className="font-bold text-red-800">Verification Rejected by Admin:</p>
                  <p className="text-red-700 mt-0.5">{activeLandlord.kycDetails?.rejectionReason || 'Uploaded ID document is blurry or property ownership could not be verified.'}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-6 text-xs text-wood-700">
              <div className="bg-wood-50 p-4 rounded-2xl border border-wood-100">
                <h3 className="font-bold text-sm text-wood-950 mb-4">1. Personal Identity Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1.5">Government ID Type</label>
                    <select
                      value={onboardIdType}
                      onChange={(e) => setOnboardIdType(e.target.value)}
                      className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden"
                    >
                      <option value="National ID Card (NIN)">National Identity Number (NIN)</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="Permanent Voter's Card (PVC)">Voter's Card (PVC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1.5">ID Card Registration Number</label>
                    <input
                      type="text"
                      value={onboardIdNum}
                      onChange={(e) => setOnboardIdNum(e.target.value)}
                      placeholder="E.g., 28394871038"
                      className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1.5">Upload NIN Slip / ID Doc</label>
                    <div className="border border-dashed border-wood-300 rounded-xl bg-white p-4 text-center cursor-pointer">
                      <FileText size={20} className="text-wood-400 mx-auto mb-1" />
                      <span className="font-semibold block text-[10px] text-wood-600">Simulate Upload ID</span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold mb-1.5">Upload Property Agreement / Deed</label>
                    <div className="border border-dashed border-wood-300 rounded-xl bg-white p-4 text-center cursor-pointer">
                      <Home size={20} className="text-wood-400 mx-auto mb-1" />
                      <span className="font-semibold block text-[10px] text-wood-600">Simulate Upload Property proof</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-wood-50 p-4 rounded-2xl border border-wood-100">
                <h3 className="font-bold text-sm text-wood-950 mb-4">2. Bank Payout Account (Via Paystack Subaccount)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold mb-1.5">Bank Name</label>
                    <select
                      value={onboardBankName}
                      onChange={(e) => setOnboardBankName(e.target.value)}
                      className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2.5 text-xs outline-hidden"
                    >
                      <option value="Access Bank">Access Bank</option>
                      <option value="Guaranty Trust Bank (GTB)">Guaranty Trust Bank (GTB)</option>
                      <option value="Zenith Bank">Zenith Bank</option>
                      <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                      <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1.5">10-Digit Account Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={onboardAccountNum}
                      onChange={(e) => setOnboardAccountNum(e.target.value)}
                      placeholder="E.g., 0123456789"
                      className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1.5">Verified Bank Account Name</label>
                    <input
                      type="text"
                      value={onboardAccountName}
                      onChange={(e) => setOnboardAccountName(e.target.value)}
                      placeholder="E.g., Gabriel Benson O."
                      className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-wood-600 hover:bg-wood-700 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
              >
                Submit Landlord Verification Profile
              </button>
            </form>
          </div>
        ) : activeLandlord.kycStatus === 'PENDING' ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-wood-200 p-8 shadow-xs text-center space-y-6">
            <div className="bg-amber-100 text-amber-700 p-3 rounded-full w-fit mx-auto mb-4 animate-bounce">
              <Clock size={32} />
            </div>
            <h2 className="font-display font-bold text-xl text-wood-950">Documents Under Audit Review</h2>
            <p className="text-sm text-wood-600 leading-relaxed max-w-md mx-auto">
              Your profile is currently marked as **PENDING**. Our verification team is auditing your property certificate and NIN records. 
            </p>
            <div className="bg-wood-50 p-4 rounded-2xl border border-wood-100 inline-block text-left text-xs max-w-sm">
              <p className="font-bold text-wood-950">How to bypass in this Demo:</p>
              <p className="text-wood-600 mt-1">Switch to the **ADMIN** portal using the "Viewing As" workspace toggler in the top navbar. You can approve this account from there in 2 seconds!</p>
            </div>
          </div>
        ) : (
          /* APPROVED LANDLORD DASHBOARD */
          <div className="space-y-8">
            
            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-wood-200/80 p-6 rounded-2xl shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-wood-400 uppercase tracking-wider">My Hostels</p>
                  <p className="font-display font-bold text-2xl text-wood-950 mt-1">{totalHostels}</p>
                </div>
                <div className="bg-wood-50 p-3 rounded-xl text-wood-600"><Home size={20} /></div>
              </div>

              <div className="bg-white border border-wood-200/80 p-6 rounded-2xl shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-wood-400 uppercase tracking-wider">Locked in Escrow</p>
                  <p className="font-display font-bold text-2xl text-amber-700 mt-1">{formatNaira(activeRentHeld)}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl text-amber-600"><Shield size={20} /></div>
              </div>

              <div className="bg-white border border-wood-200/80 p-6 rounded-2xl shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-wood-400 uppercase tracking-wider">Total Net Earnings</p>
                  <p className="font-display font-bold text-2xl text-emerald-700 mt-1">{formatNaira(totalPayoutReleased)}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600"><DollarSign size={20} /></div>
              </div>
            </div>

            {/* Tab controls */}
            <div className="flex justify-between items-center border-b border-wood-200 pb-3 gap-4 flex-wrap">
              <div className="flex space-x-2">
                <button
                  onClick={() => setSubTab('listings')}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${subTab === 'listings' ? 'bg-wood-600 text-white shadow-2xs' : 'bg-white border border-wood-200 text-wood-600 hover:text-wood-950'}`}
                >
                  My Hostel Listings
                </button>
                <button
                  onClick={() => setSubTab('escrows')}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer relative ${subTab === 'escrows' ? 'bg-wood-600 text-white shadow-2xs' : 'bg-white border border-wood-200 text-wood-600 hover:text-wood-950'}`}
                >
                  Active Rent Escrows
                  {landlordBookings.filter(b => b.status === 'IN_ESCROW').length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">
                      {landlordBookings.filter(b => b.status === 'IN_ESCROW').length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSubTab('payouts')}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${subTab === 'payouts' ? 'bg-wood-600 text-white shadow-2xs' : 'bg-white border border-wood-200 text-wood-600 hover:text-wood-950'}`}
                >
                  Payout History
                </button>
                <button
                  onClick={() => setSubTab('profile')}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${subTab === 'profile' ? 'bg-wood-600 text-white shadow-2xs' : 'bg-white border border-wood-200 text-wood-600 hover:text-wood-950'}`}
                >
                  My Profile
                </button>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-wood-600 hover:bg-wood-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Create listing</span>
              </button>
            </div>

            {/* LISTINGS SUBTAB */}
            {subTab === 'listings' && (
              <div className="space-y-4">
                {landlordHostels.length === 0 ? (
                  <div className="bg-white py-16 text-center rounded-3xl border border-wood-200/80 shadow-xs max-w-md mx-auto">
                    <Home size={36} className="text-wood-300 mx-auto mb-2" />
                    <h4 className="font-display font-bold text-base text-wood-950">You haven't listed any hostels</h4>
                    <p className="text-xs text-wood-500 mt-1 mb-4">Add your property near universities and start receiving escrow-secured rent bookings.</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-4 py-2 bg-wood-600 hover:bg-wood-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Add Hostel
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {landlordHostels.map(hostel => {
                      const school = schools.find(s => s.id === hostel.schoolId);
                      const relatedInspections = jobs.filter(j => j.hostelId === hostel.id && j.status === 'COMPLETED');
                      
                      return (
                        <div key={hostel.id} className="bg-white border border-wood-200 rounded-2xl overflow-hidden hover:shadow-xs transition-all flex flex-col justify-between">
                          <div className="h-40 bg-wood-100 relative">
                            <img src={hostel.photos[0]} alt={hostel.name} className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 bg-wood-950/80 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                              {hostel.roomType}
                            </div>
                            <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-white/90 px-2 py-1 rounded-md backdrop-blur-xs text-[10px] font-bold text-wood-900">
                              <span className={`w-2 h-2 rounded-full ${hostel.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                              <span>{hostel.isAvailable ? 'AVAILABLE' : 'OCCUPIED'}</span>
                            </div>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="font-display font-bold text-base text-wood-950">{hostel.name}</h4>
                                <p className="font-bold text-wood-950 text-base">{formatNaira(hostel.price)}</p>
                              </div>
                              <p className="text-xs text-wood-400 mt-1">{school?.name || 'Served School'}</p>
                              
                              <p className="text-xs text-wood-600 leading-relaxed mt-2.5 line-clamp-2">
                                {hostel.description}
                              </p>

                              {/* Completed Inspections Tracker */}
                              <div className="mt-4 pt-3 border-t border-wood-100">
                                <span className="text-[10px] font-bold text-wood-400 uppercase tracking-wider block mb-1">Vetting History</span>
                                {relatedInspections.length > 0 ? (
                                  <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg text-xs font-medium border border-emerald-100 flex items-center justify-between">
                                    <span>✓ Roomly Inspected and Approved</span>
                                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">VERIFIED</span>
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-wood-500">No inspector reviews submitted yet for this hostel.</p>
                                )}
                              </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-wood-100 flex items-center justify-between gap-2 text-xs">
                              <button
                                onClick={() => onToggleListingAvailable(hostel.id)}
                                className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-1 cursor-pointer transition-colors ${
                                  hostel.isAvailable ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                }`}
                              >
                                <Power size={12} />
                                <span>{hostel.isAvailable ? 'Mark as occupied' : 'Mark as available'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ESCROWS SUBTAB */}
            {subTab === 'escrows' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-wood-900">Tenant Booking Rent Vaults</h3>
                
                {landlordBookings.length === 0 ? (
                  <p className="text-xs text-wood-500 bg-white p-6 rounded-2xl border border-wood-200">No student has booked your hostels yet.</p>
                ) : (
                  landlordBookings.map(booking => (
                    <div key={booking.id} className="bg-white border border-wood-200 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-2xs transition-all">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-wood-950">{booking.hostelName}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            booking.status === 'IN_ESCROW' ? 'bg-amber-100 text-amber-800' :
                            booking.status === 'RELEASED' ? 'bg-emerald-100 text-emerald-800' :
                            booking.status === 'DISPUTED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-xs text-wood-500 mt-1">Tenant: {booking.studentName} ({booking.studentPhone})</p>
                        <p className="text-[10px] text-wood-400 mt-1">Booked on {formatDate(booking.createdAt)}</p>
                      </div>

                      <div className="md:text-right">
                        <p className="text-[10px] text-wood-400 uppercase font-bold tracking-wider">Vault Rent Value</p>
                        <p className="font-bold text-wood-950 text-lg leading-none mt-0.5">{formatNaira(booking.price)}</p>
                        <p className="text-[9px] text-wood-500 mt-1">Dormiversity retains 10% commission on escrow release</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onNavigateToChat(booking.studentId, booking.hostelId, booking.id)}
                          className="px-3.5 py-1.5 bg-wood-50 hover:bg-wood-100 text-wood-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Chat with Tenant
                        </button>
                        {booking.status === 'DISPUTED' && (
                          <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-100 max-w-xs text-left">
                            <p>⚠️ In Dispute: {booking.disputeReason}</p>
                            <p className="text-[10px] font-normal text-red-600 mt-0.5">Admin Support is investigating the property condition.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PAYOUTS SUBTAB */}
            {subTab === 'payouts' && (
              <div className="bg-white border border-wood-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="p-4 bg-wood-50 border-b border-wood-100">
                  <h3 className="font-bold text-sm text-wood-950">Payout Financial Ledger</h3>
                  <p className="text-xs text-wood-500 mt-0.5">Rent funds released to bank account (90% of total paid, 10% retained commission).</p>
                </div>
                
                <div className="divide-y divide-wood-100 text-xs">
                  {landlordBookings.filter(b => b.status === 'RELEASED').length === 0 ? (
                    <div className="p-8 text-center text-wood-400">No rent funds have been released to your subaccount yet.</div>
                  ) : (
                    landlordBookings.filter(b => b.status === 'RELEASED').map(booking => (
                      <div key={booking.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-wood-50/50">
                        <div>
                          <p className="font-bold text-wood-950">{booking.hostelName}</p>
                          <p className="text-[10px] text-wood-400">Escrow released for tenant: {booking.studentName}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-right">
                          <div>
                            <span className="text-[10px] text-wood-400 block uppercase">Gross paid</span>
                            <span className="font-semibold text-wood-600">{formatNaira(booking.price)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-wood-400 block uppercase">10% Comm.</span>
                            <span className="font-semibold text-red-600">-{formatNaira(booking.price * 0.1)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-600 font-bold block uppercase">NET Payout</span>
                            <span className="font-bold text-emerald-700">{formatNaira(booking.price * 0.9)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* MY PROFILE SUBTAB */}
            {subTab === 'profile' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-wood-200/80 shadow-xs max-w-xl mx-auto">
                <h2 className="font-display font-bold text-xl text-wood-950 mb-1">Landlord Profile Settings</h2>
                <p className="text-xs text-wood-500 mb-6">Manage your contact, payout details, and vetting identity details.</p>

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  {updateSuccess && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
                      <CheckCircle2 size={16} className="text-emerald-600 animate-bounce" />
                      <span>Profile information has been successfully updated in your profile database!</span>
                    </div>
                  )}
                  {updateError && (
                    <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-800 rounded-2xl text-xs font-semibold">
                      {updateError}
                    </div>
                  )}

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
                      <label className="block font-bold text-wood-700 mb-1">Email Address (Read-only)</label>
                      <input
                        type="email"
                        disabled
                        value={profileEmail}
                        className="w-full bg-wood-100 border border-wood-200 rounded-xl px-3 py-2 text-sm text-wood-500 cursor-not-allowed outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-wood-700 mb-1">Avatar Profile Image URL</label>
                    <input
                      type="text"
                      value={profilePic}
                      onChange={(e) => setProfilePic(e.target.value)}
                      className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                    />
                  </div>

                  <div className="bg-wood-50 p-4 rounded-xl border border-wood-150 text-[11px] text-wood-600 leading-normal space-y-1">
                    <span className="font-bold text-wood-900 uppercase tracking-wide block">Verification Badge:</span>
                    {activeLandlord.kycStatus === 'APPROVED' ? (
                      <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mt-1">
                        <CheckCircle2 size={12} className="mr-1 text-emerald-600" />
                        ID Approved Landlord
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full mt-1 animate-pulse">
                        <Clock size={12} className="mr-1 text-amber-600" />
                        KYC Verification Pending Audit
                      </span>
                    )}
                    <p className="mt-2 text-wood-500 text-[10px]">Your listed payout accounts are automatically locked to your Paystack escrow ledger for tenant security.</p>
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
            )}

            {/* ADD LISTING MODAL */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto border border-wood-200 shadow-2xl animate-scaleUp">
                  
                  <div className="flex justify-between items-center mb-4 border-b border-wood-100 pb-3">
                    <h3 className="font-display font-bold text-lg text-wood-950">Publish New Hostel</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-wood-400 hover:text-wood-950">✕</button>
                  </div>

                  <form onSubmit={handleSubmitListing} className="space-y-4 text-xs text-wood-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold mb-1">Hostel/Room Name</label>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="E.g., Oakwood Premium Suites"
                          className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block font-bold mb-1">Yearly Rent (NGN)</label>
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(parseInt(e.target.value))}
                          className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden"
                          min="50000"
                          step="10000"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold mb-1">Physical Address</label>
                        <input
                          type="text"
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          placeholder="E.g., 14, Saint Finbarrs Road, Akoka"
                          className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Distance to campus gate (km)</label>
                        <input
                          type="number"
                          value={newProximity}
                          onChange={(e) => setNewProximity(parseFloat(e.target.value))}
                          className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden"
                          step="0.1"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold mb-1 text-xs text-wood-700 uppercase tracking-wide">Serviced School</label>
                        <SchoolSelect
                          schools={schools}
                          value={newSchoolId}
                          onChange={(schoolId) => setNewSchoolId(schoolId)}
                          placeholder="Select School..."
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Room Layout</label>
                        <select
                          value={newRoomType}
                          onChange={(e) => setNewRoomType(e.target.value as any)}
                          className="w-full bg-wood-50 border border-wood-200 rounded-xl px-2 py-2 text-sm outline-hidden"
                        >
                          <option value="Self-Contain">Self-Contain</option>
                          <option value="Shared (2-in-a-room)">Shared (2-in-a-room)</option>
                          <option value="Shared (4-in-a-room)">Shared (4-in-a-room)</option>
                          <option value="Single Room">Single Room</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Gender Restriction</label>
                        <select
                          value={newGender}
                          onChange={(e) => setNewGender(e.target.value as any)}
                          className="w-full bg-wood-50 border border-wood-200 rounded-xl px-2 py-2 text-sm outline-hidden"
                        >
                          <option value="Mixed">Mixed Allowed</option>
                          <option value="Male">Males Only</option>
                          <option value="Female">Females Only</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Detailed Description</label>
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Detail key structural components (borehole water, fence, pre-paid meter)..."
                        className="w-full bg-wood-50 border border-wood-200 rounded-xl p-3 text-xs outline-hidden focus:ring-1 focus:ring-wood-500"
                        rows={3}
                        required
                      />
                    </div>

                    {/* Amenities Checklist */}
                    <div>
                      <label className="block font-bold mb-2">Hostel Amenities (Check all that apply)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {['Water Running', 'Generator/Solar', 'Fenced Security', 'WiFi', 'Kitchen'].map(amenity => {
                          const isChecked = newAmenities.includes(amenity);
                          return (
                            <button
                              type="button"
                              key={amenity}
                              onClick={() => handleToggleAmenity(amenity)}
                              className={`py-2 px-1 rounded-xl border text-center font-semibold cursor-pointer ${
                                isChecked ? 'bg-wood-600 border-wood-600 text-white' : 'bg-white border-wood-200 text-wood-700 hover:bg-wood-50'
                              }`}
                            >
                              {amenity.split('/')[0]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* House Rules Creator */}
                    <div className="bg-wood-50 p-4 rounded-xl border border-wood-100">
                      <label className="block font-bold mb-1">Hostel Rules (Add rules sequentially)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={ruleInput}
                          onChange={(e) => setRuleInput(e.target.value)}
                          placeholder="E.g., No parties after 10PM"
                          className="flex-1 bg-white border border-wood-200 rounded-lg px-2.5 py-1.5 text-xs outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={handleAddRule}
                          className="px-4 py-1.5 bg-wood-600 text-white font-bold rounded-lg hover:bg-wood-700 transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                      </div>

                      {newRules.length > 0 && (
                        <ul className="mt-3 space-y-1 bg-white p-2.5 rounded-lg border border-wood-200">
                          {newRules.map((rule, index) => (
                            <li key={index} className="flex justify-between items-center text-[11px] text-wood-800">
                              <span>• {rule}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveRule(index)}
                                className="text-red-500 hover:text-red-700 font-bold"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t border-wood-100">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2.5 border border-wood-200 rounded-xl text-wood-700 font-semibold hover:bg-wood-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-wood-600 hover:bg-wood-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                      >
                        Publish listing
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
