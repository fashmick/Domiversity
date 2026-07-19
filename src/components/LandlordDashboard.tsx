import React, { useState, useEffect, useRef } from 'react';
import { Home, ShieldAlert, CheckCircle2, Shield, Plus, Power, Users, DollarSign, MessageSquare, List, ClipboardCheck, Clock, FileText, ChevronRight, X, User, Camera, Upload, MapPin, CreditCard, Phone, AlertCircle, Building, Check } from 'lucide-react';
import { Hostel, Booking, InspectorJob, User as PlatformUser, School } from '../types';
import { formatNaira, formatDate } from '../utils';
import SchoolSelect from './SchoolSelect';
import CustomSelect from './CustomSelect';

interface LandlordDashboardProps {
  activeLandlord: PlatformUser;
  schools: School[];
  hostels: Hostel[];
  bookings: Booking[];
  jobs: InspectorJob[];
  onUploadKYC: (details: any) => void;
  onAddListing: (listing: Omit<Hostel, 'id' | 'landlordId' | 'landlordName' | 'reviewsCount' | 'rating'>) => void;
  onToggleListingAvailable: (hostelId: string) => void;
  onNavigateToChat: (studentId: string, hostelId?: string, bookingId?: string) => void;
  onUpdateProfile?: (updatedUser: PlatformUser) => void;
  onDeleteAccount?: (userId: string) => void;
  initialSubTab?: 'listings' | 'escrows' | 'payouts' | 'profile' | 'verification';
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
  onUpdateProfile,
  onDeleteAccount,
  initialSubTab
}: LandlordDashboardProps) {
  const [subTab, setSubTab] = useState<'listings' | 'escrows' | 'payouts' | 'profile' | 'verification'>(
    initialSubTab || (activeLandlord.kycStatus !== 'APPROVED' ? 'verification' : 'listings')
  );
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Profile settings state
  const [profileName, setProfileName] = useState(activeLandlord.name);
  const [profilePhone, setProfilePhone] = useState(activeLandlord.phone);
  const [profileEmail, setProfileEmail] = useState(activeLandlord.email);
  const [profilePic, setProfilePic] = useState(activeLandlord.profilePicture || '');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    setProfileName(activeLandlord.name);
    setProfilePhone(activeLandlord.phone);
    setProfileEmail(activeLandlord.email);
    setProfilePic(activeLandlord.profilePicture || '');
  }, [activeLandlord.id, activeLandlord.name, activeLandlord.phone, activeLandlord.email, activeLandlord.profilePicture]);

  // Native camera & file state managers
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (targetField: string) => {
    setCameraTarget(targetField);
    setCameraActive(true);
    setCameraError('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access failed", err);
      setCameraError("Unable to access camera. Please check camera permissions or upload a local file instead.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraTarget('');
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        updatePhotoField(cameraTarget, dataUrl);
      }
      stopCamera();
    }
  };

  const updatePhotoField = (target: string, dataUrl: string) => {
    switch(target) {
      case 'idImage':
        setOnboardIdImage(dataUrl);
        break;
      case 'proofDocImage':
        setOnboardProofDocImage(dataUrl);
        break;
      case 'businessRegImage':
        setOnboardBusinessRegImage(dataUrl);
        break;
      case 'buildingApprovalImage':
        setOnboardBuildingApprovalImage(dataUrl);
        break;
      case 'fireSafetyImage':
        setOnboardFireSafetyImage(dataUrl);
        break;
      case 'utilityBillImage':
        setOnboardUtilityBillImage(dataUrl);
        break;
      case 'profilePicture':
        setProfilePic(dataUrl);
        break;
      case 'hostelMedia':
        setOnboardHostelMedia(prev => [...prev, dataUrl]);
        break;
    }
  };

  const handleLocalFileChange = async (targetField: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            updatePhotoField(targetField, reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error("Failed to read file", err);
      }
    }
  };

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

  // Onboarding Form States (for 11 requirements)
  const [onboardIdType, setOnboardIdType] = useState('National ID Card (NIN)');
  const [onboardIdNum, setOnboardIdNum] = useState('');
  const [onboardIdImage, setOnboardIdImage] = useState('');
  
  const [onboardProofDocType, setOnboardProofDocType] = useState('Deed of Conveyance');
  const [onboardProofDocImage, setOnboardProofDocImage] = useState('');
  
  const [onboardBusinessRegNum, setOnboardBusinessRegNum] = useState('');
  const [onboardBusinessRegImage, setOnboardBusinessRegImage] = useState('');
  
  const [onboardBuildingApprovalNum, setOnboardBuildingApprovalNum] = useState('');
  const [onboardBuildingApprovalImage, setOnboardBuildingApprovalImage] = useState('');
  
  const [onboardFireSafetyNum, setOnboardFireSafetyNum] = useState('');
  const [onboardFireSafetyImage, setOnboardFireSafetyImage] = useState('');
  
  const [onboardWaterAvailability, setOnboardWaterAvailability] = useState('Constant Borehole Running');
  const [onboardElectricityAvailability, setOnboardElectricityAvailability] = useState('Grid Connection Only');
  const [onboardUtilityBillImage, setOnboardUtilityBillImage] = useState('');
  
  const [onboardHostelMedia, setOnboardHostelMedia] = useState<string[]>([]);
  const [onboardGpsLocation, setOnboardGpsLocation] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  
  const [onboardBankName, setOnboardBankName] = useState('Access Bank');
  const [onboardAccountNum, setOnboardAccountNum] = useState('');
  const [onboardAccountName, setOnboardAccountName] = useState('');
  
  const [onboardEmergencyContactName, setOnboardEmergencyContactName] = useState('');
  const [onboardEmergencyContactPhone, setOnboardEmergencyContactPhone] = useState('');
  const [onboardEmergencyContactRelation, setOnboardEmergencyContactRelation] = useState('Next of Kin');
  
  const [onboardSchoolApprovalId, setOnboardSchoolApprovalId] = useState(schools[0]?.id || '');
  const [onboardSchoolApprovalStatus, setOnboardSchoolApprovalStatus] = useState<'Approved' | 'Pending' | 'Not Approved'>('Pending');

  const handleDetectGps = () => {
    setIsDetectingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setOnboardGpsLocation(`${lat}, ${lng}`);
          setIsDetectingGps(false);
        },
        (error) => {
          console.error(error);
          setOnboardGpsLocation("6.5182, 3.3894"); // Yaba region fallback
          setIsDetectingGps(false);
        }
      );
    } else {
      setOnboardGpsLocation("6.5182, 3.3894");
      setIsDetectingGps(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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

  // Onboarding Obsolete States (dummy placeholding to avoid compiling issues in unreferenced scopes)
  const [onboardIdType_obsolete, setOnboardIdType_obsolete] = useState('National ID Card (NIN)');
  const [onboardIdNum_obsolete, setOnboardIdNum_obsolete] = useState('');
  const [onboardBankName_obsolete, setOnboardBankName_obsolete] = useState('Access Bank');
  const [onboardAccountNum_obsolete, setOnboardAccountNum_obsolete] = useState('');
  const [onboardAccountName_obsolete, setOnboardAccountName_obsolete] = useState('');

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
    if (activeLandlord.kycStatus !== 'APPROVED') {
      alert("Verification Required: Your landlord account must be approved before publishing any listings. Please complete your onboarding or verify using the Admin Portal.");
      return;
    }
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
    if (!onboardIdNum.trim() || !onboardAccountNum.trim() || !onboardAccountName.trim() || !onboardEmergencyContactName.trim() || !onboardEmergencyContactPhone.trim()) {
      alert("Please ensure all required sections (Government ID, Property Proof, Utilities, Location, Bank Details, and Emergency Contact) are fully completed.");
      return;
    }

    onUploadKYC({
      idType: onboardIdType,
      idNumber: onboardIdNum,
      idImage: onboardIdImage || 'ID_Document_' + activeLandlord.name.replace(/\s+/g, '_') + '.jpg',
      proofDoc: onboardProofDocType,
      proofDocImage: onboardProofDocImage || 'Proof_Document_' + activeLandlord.name.replace(/\s+/g, '_') + '.jpg',
      businessRegNum: onboardBusinessRegNum || '',
      businessRegImage: onboardBusinessRegImage || (onboardBusinessRegNum ? 'CAC_Certificate_' + activeLandlord.name.replace(/\s+/g, '_') + '.jpg' : ''),
      buildingApprovalNum: onboardBuildingApprovalNum || 'BLD-APP-' + Math.floor(Math.random() * 100000),
      buildingApprovalImage: onboardBuildingApprovalImage || 'Building_Approval_' + activeLandlord.name.replace(/\s+/g, '_') + '.jpg',
      fireSafetyNum: onboardFireSafetyNum || 'FIRE-' + Math.floor(Math.random() * 100000),
      fireSafetyImage: onboardFireSafetyImage || 'Fire_Safety_Certificate_' + activeLandlord.name.replace(/\s+/g, '_') + '.jpg',
      waterAvailability: onboardWaterAvailability,
      electricityAvailability: onboardElectricityAvailability,
      utilityBillImage: onboardUtilityBillImage || 'Utility_Bill_' + activeLandlord.name.replace(/\s+/g, '_') + '.jpg',
      hostelMedia: onboardHostelMedia.length > 0 ? onboardHostelMedia : ['Hostel_Photo_1.jpg', 'Hostel_Photo_2.jpg'],
      gpsLocation: onboardGpsLocation || '6.5182, 3.3894',
      bankName: onboardBankName,
      bankAccount: onboardAccountNum,
      bankAccountName: onboardAccountName,
      emergencyContactName: onboardEmergencyContactName,
      emergencyContactPhone: onboardEmergencyContactPhone,
      emergencyContactRelation: onboardEmergencyContactRelation,
      schoolApprovalId: onboardSchoolApprovalId,
      schoolApprovalStatus: 'Pending'
    });
  };

  return (
    <div className="bg-wood-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="space-y-8 animate-fadeIn">
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
                onClick={() => setSubTab('verification')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer relative ${subTab === 'verification' ? 'bg-wood-600 text-white shadow-2xs' : 'bg-white border border-wood-200 text-wood-600 hover:text-wood-950'}`}
              >
                <div className="flex items-center gap-1.5">
                  <Shield size={14} className={activeLandlord.kycStatus === 'APPROVED' ? 'text-emerald-500' : 'text-amber-500'} />
                  <span>Verification Status</span>
                  {activeLandlord.kycStatus !== 'APPROVED' && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setSubTab('profile')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${subTab === 'profile' ? 'bg-wood-600 text-white shadow-2xs' : 'bg-white border border-wood-200 text-wood-600 hover:text-wood-950'}`}
              >
                Profile & Settings
              </button>
            </div>

            <button
              onClick={() => {
                if (activeLandlord.kycStatus !== 'APPROVED') {
                  alert("KYC Verification Required: You must pass our 11-point safety and trust audit in the 'Verification Status' tab before you can create listings.");
                  return;
                }
                setShowAddModal(true);
              }}
              disabled={activeLandlord.kycStatus !== 'APPROVED'}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer transition-all ${
                activeLandlord.kycStatus === 'APPROVED' 
                  ? 'bg-wood-600 hover:bg-wood-700 text-white shadow-2xs' 
                  : 'bg-wood-200 text-wood-400 cursor-not-allowed border border-wood-250'
              }`}
            >
              <Plus size={14} />
              <span>Create listing</span>
            </button>
          </div>

          {/* VERIFICATION TAB CONTENT */}
          {subTab === 'verification' && (
            <div className="space-y-6">
              {(activeLandlord.kycStatus === 'NOT_SUBMITTED' || activeLandlord.kycStatus === 'REJECTED') && (
                <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-wood-200/80 p-6 sm:p-8 shadow-md">
                  <div className="text-center mb-8 border-b border-wood-100 pb-6">
                    <div className="bg-amber-100 text-amber-700 p-3 rounded-2xl w-fit mx-auto mb-4">
                      <ShieldAlert size={32} />
                    </div>
                    <h2 className="font-display font-bold text-2xl text-wood-950">Landlord Safety & Trust Onboarding</h2>
                    <p className="text-xs text-wood-500 mt-2 max-w-lg mx-auto leading-relaxed">
                      Nigerian rent escrow safety laws and Dormiversity tenant protection mandates require verification of identity, ownership credentials, safety compliance, and bank coordinates.
                    </p>
                    {activeLandlord.kycStatus === 'REJECTED' && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left max-w-lg mx-auto mt-4 text-xs">
                        <p className="font-bold text-red-800 flex items-center gap-1.5">
                          <AlertCircle size={14} />
                          <span>Verification Declined by Admin:</span>
                        </p>
                        <p className="text-red-700 mt-1 pl-5">{activeLandlord.kycDetails?.rejectionReason || 'Uploaded ID document is blurry or property ownership could not be verified.'}</p>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleOnboardSubmit} className="space-y-8 text-xs text-wood-700">
              
              {/* SECTION 1: AFFILIATED SCHOOL APPROVAL */}
              <div className="bg-wood-50 p-5 rounded-2xl border border-wood-150 space-y-4">
                <div className="flex items-center gap-2 border-b border-wood-200/60 pb-2">
                  <Building size={18} className="text-wood-600" />
                  <h3 className="font-bold text-sm text-wood-950">1. School Affiliation & Approval Request</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1.5">Select Primary Campus to List Under</label>
                    <SchoolSelect
                      schools={schools}
                      value={onboardSchoolApprovalId}
                      onChange={(id) => setOnboardSchoolApprovalId(id)}
                      placeholder="Select Affiliate School..."
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1.5">School Approval Status</label>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
                      <span className="font-semibold text-amber-800">PENDING AUDIT VETT</span>
                      <span className="bg-amber-600 text-white px-2.5 py-0.5 rounded-md text-[10px] font-bold">Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: IDENTITY DOCUMENTS & EMERGENCY CONTACTS */}
              <div className="bg-wood-50 p-5 rounded-2xl border border-wood-150 space-y-5">
                <div className="flex items-center gap-2 border-b border-wood-200/60 pb-2">
                  <User size={18} className="text-wood-600" />
                  <h3 className="font-bold text-sm text-wood-950">2. Landlord Identity & Emergency Contacts</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1.5">Government ID Type</label>
                    <CustomSelect
                      value={onboardIdType}
                      onChange={(val) => setOnboardIdType(val)}
                      options={[
                        { value: 'National ID Card (NIN)', label: 'National Identity Number (NIN)' },
                        { value: 'Driver\'s License', label: 'Driver\'s License' },
                        { value: 'Permanent Voter\'s Card (PVC)', label: 'Voter\'s Card (PVC)' },
                        { value: 'International Passport', label: 'International Passport' }
                      ]}
                    />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Government ID file upload or take camera photo */}
                  <div className="border border-wood-200 bg-white rounded-2xl p-4 flex flex-col justify-between">
                    <span className="font-bold text-wood-700 block mb-2">Government Issued ID Photo</span>
                    {onboardIdImage ? (
                      <div className="relative rounded-xl overflow-hidden h-32 border border-wood-150 group">
                        <img src={onboardIdImage} alt="ID Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setOnboardIdImage('')}
                          className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-90 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-wood-50/50 p-4 min-h-32">
                        <span className="text-[10px] text-wood-400 text-center mb-3">Upload ID photo from camera or local file</span>
                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => startCamera('idImage')}
                            className="flex-1 py-1.5 bg-wood-900 text-white rounded-lg font-semibold hover:bg-black transition-colors flex items-center justify-center gap-1 text-[10px]"
                          >
                            <Camera size={12} />
                            <span>Camera</span>
                          </button>
                          <label className="flex-1 py-1.5 bg-white border border-wood-200 text-wood-700 rounded-lg font-semibold hover:bg-wood-50 transition-colors flex items-center justify-center gap-1 text-[10px] cursor-pointer text-center">
                            <Upload size={12} />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLocalFileChange('idImage', e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Emergency contact card info */}
                  <div className="border border-wood-200 bg-white rounded-2xl p-4 space-y-3">
                    <span className="font-bold text-wood-700 block border-b border-wood-100 pb-1.5">Emergency Contact / Next of Kin</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-wood-500 mb-0.5">Full Name</label>
                        <input
                          type="text"
                          value={onboardEmergencyContactName}
                          onChange={(e) => setOnboardEmergencyContactName(e.target.value)}
                          placeholder="Contact Name"
                          className="w-full bg-wood-50 border border-wood-200 rounded-lg px-2 py-1 text-xs outline-hidden"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-wood-500 mb-0.5">Relationship</label>
                        <CustomSelect
                          value={onboardEmergencyContactRelation}
                          onChange={(val) => setOnboardEmergencyContactRelation(val)}
                          options={[
                            { value: 'Next of Kin', label: 'Next of Kin' },
                            { value: 'Attorney / Legal Manager', label: 'Attorney / Manager' },
                            { value: 'Co-Owner', label: 'Co-Owner' },
                            { value: 'Family Member', label: 'Family Member' }
                          ]}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-wood-500 mb-0.5">Contact Phone Number</label>
                      <input
                        type="tel"
                        value={onboardEmergencyContactPhone}
                        onChange={(e) => setOnboardEmergencyContactPhone(e.target.value)}
                        placeholder="E.g., 08034567890"
                        className="w-full bg-wood-50 border border-wood-200 rounded-lg px-2 py-1 text-xs outline-hidden"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: LEGAL APPROVALS & COMPLIANCES */}
              <div className="bg-wood-50 p-5 rounded-2xl border border-wood-150 space-y-4">
                <div className="flex items-center gap-2 border-b border-wood-200/60 pb-2">
                  <Shield size={18} className="text-wood-600" />
                  <h3 className="font-bold text-sm text-wood-950">3. Proof of Property Ownership & Safety Compliances</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Property ownership doc */}
                  <div className="border border-wood-200 bg-white rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <label className="block font-bold text-wood-700 mb-1.5">Property Management Authority Doc Type</label>
                      <CustomSelect
                        value={onboardProofDocType}
                        onChange={(val) => setOnboardProofDocType(val)}
                        options={[
                          { value: 'Deed of Conveyance', label: 'Deed of Conveyance' },
                          { value: 'Certificate of Occupancy (C of O)', label: 'Certificate of Occupancy (C of O)' },
                          { value: 'Hostel Management Mandate Agreement', label: 'Management Mandate Agreement' },
                          { value: 'Letter of Administration', label: 'Letter of Administration' }
                        ]}
                      />
                    </div>

                    {onboardProofDocImage ? (
                      <div className="relative rounded-xl overflow-hidden h-32 border border-wood-150">
                        <img src={onboardProofDocImage} alt="Deed Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setOnboardProofDocImage('')}
                          className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-90 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-wood-50/50 p-4 min-h-28">
                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => startCamera('proofDocImage')}
                            className="flex-1 py-1.5 bg-wood-900 text-white rounded-lg font-semibold hover:bg-black transition-colors flex items-center justify-center gap-1 text-[10px]"
                          >
                            <Camera size={12} />
                            <span>Camera</span>
                          </button>
                          <label className="flex-1 py-1.5 bg-white border border-wood-200 text-wood-700 rounded-lg font-semibold hover:bg-wood-50 transition-colors flex items-center justify-center gap-1 text-[10px] cursor-pointer text-center">
                            <Upload size={12} />
                            <span>File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLocalFileChange('proofDocImage', e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CAC Business registration */}
                  <div className="border border-wood-200 bg-white rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <label className="block font-bold text-wood-700 mb-1">Business Registration Number (Optional but recommended)</label>
                      <p className="text-[10px] text-wood-400 mb-1.5">For corporate credibility (CAC RC number / BN number)</p>
                      <input
                        type="text"
                        value={onboardBusinessRegNum}
                        onChange={(e) => setOnboardBusinessRegNum(e.target.value)}
                        placeholder="E.g., RC 1829481 or BN 2849102"
                        className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-1.5 text-xs outline-hidden"
                      />
                    </div>

                    {onboardBusinessRegImage ? (
                      <div className="relative rounded-xl overflow-hidden h-32 border border-wood-150">
                        <img src={onboardBusinessRegImage} alt="CAC Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setOnboardBusinessRegImage('')}
                          className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-90 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-wood-50/50 p-4 min-h-24">
                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => startCamera('businessRegImage')}
                            className="flex-1 py-1.5 bg-wood-900 text-white rounded-lg font-semibold hover:bg-black transition-colors flex items-center justify-center gap-1 text-[10px]"
                          >
                            <Camera size={12} />
                            <span>Camera</span>
                          </button>
                          <label className="flex-1 py-1.5 bg-white border border-wood-200 text-wood-700 rounded-lg font-semibold hover:bg-wood-50 transition-colors flex items-center justify-center gap-1 text-[10px] cursor-pointer text-center">
                            <Upload size={12} />
                            <span>File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLocalFileChange('businessRegImage', e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Building Approval & Fire Safety Certificate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Building Approval */}
                  <div className="border border-wood-200 bg-white rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <label className="block font-bold text-wood-700 mb-1">Building Approval Certificate (Legal Compliance)</label>
                      <input
                        type="text"
                        value={onboardBuildingApprovalNum}
                        onChange={(e) => setOnboardBuildingApprovalNum(e.target.value)}
                        placeholder="E.g., LASBCA / FHA Reference ID"
                        className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-1.5 text-xs outline-hidden mb-2"
                        required
                      />
                    </div>

                    {onboardBuildingApprovalImage ? (
                      <div className="relative rounded-xl overflow-hidden h-32 border border-wood-150">
                        <img src={onboardBuildingApprovalImage} alt="Building Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setOnboardBuildingApprovalImage('')}
                          className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-90 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-wood-50/50 p-4 min-h-24">
                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => startCamera('buildingApprovalImage')}
                            className="flex-1 py-1.5 bg-wood-900 text-white rounded-lg font-semibold hover:bg-black transition-colors flex items-center justify-center gap-1 text-[10px]"
                          >
                            <Camera size={12} />
                            <span>Camera</span>
                          </button>
                          <label className="flex-1 py-1.5 bg-white border border-wood-200 text-wood-700 rounded-lg font-semibold hover:bg-wood-50 transition-colors flex items-center justify-center gap-1 text-[10px] cursor-pointer text-center">
                            <Upload size={12} />
                            <span>File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLocalFileChange('buildingApprovalImage', e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fire Safety Certificate */}
                  <div className="border border-wood-200 bg-white rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <label className="block font-bold text-wood-700 mb-1">Fire Safety Certificate (Student Safety Mandate)</label>
                      <input
                        type="text"
                        value={onboardFireSafetyNum}
                        onChange={(e) => setOnboardFireSafetyNum(e.target.value)}
                        placeholder="E.g., Federal Fire Service Ref Code"
                        className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-1.5 text-xs outline-hidden mb-2"
                        required
                      />
                    </div>

                    {onboardFireSafetyImage ? (
                      <div className="relative rounded-xl overflow-hidden h-32 border border-wood-150">
                        <img src={onboardFireSafetyImage} alt="Fire Safety Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setOnboardFireSafetyImage('')}
                          className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-90 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-wood-50/50 p-4 min-h-24">
                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => startCamera('fireSafetyImage')}
                            className="flex-1 py-1.5 bg-wood-900 text-white rounded-lg font-semibold hover:bg-black transition-colors flex items-center justify-center gap-1 text-[10px]"
                          >
                            <Camera size={12} />
                            <span>Camera</span>
                          </button>
                          <label className="flex-1 py-1.5 bg-white border border-wood-200 text-wood-700 rounded-lg font-semibold hover:bg-wood-50 transition-colors flex items-center justify-center gap-1 text-[10px] cursor-pointer text-center">
                            <Upload size={12} />
                            <span>File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLocalFileChange('fireSafetyImage', e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: UTILITIES, GPS LOCATION & HOSTEL MEDIA */}
              <div className="bg-wood-50 p-5 rounded-2xl border border-wood-150 space-y-4">
                <div className="flex items-center gap-2 border-b border-wood-200/60 pb-2">
                  <MapPin size={18} className="text-wood-600" />
                  <h3 className="font-bold text-sm text-wood-950">4. Utility Setup, GPS Mapping & Hostel Showcase Photos</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-wood-700 mb-1">Water Running Availability</label>
                    <CustomSelect
                      value={onboardWaterAvailability}
                      onChange={(val) => setOnboardWaterAvailability(val)}
                      options={[
                        { value: 'Constant Borehole Running', label: 'Constant Borehole Running' },
                        { value: 'Municipal Public Mains', label: 'Municipal Public Mains' },
                        { value: 'Storage Tanker Deliveries', label: 'Storage Tanker Deliveries' },
                        { value: 'Manual Well & Pump', label: 'Manual Well & Pump' }
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-wood-700 mb-1">Electricity Grid / Backup</label>
                    <CustomSelect
                      value={onboardElectricityAvailability}
                      onChange={(val) => setOnboardElectricityAvailability(val)}
                      options={[
                        { value: 'Grid Connection Only', label: 'Grid Connection Only' },
                        { value: 'Grid + Constant Solar Power Backup', label: 'Grid + Solar Power Backup' },
                        { value: 'Grid + Standby Generator Power Schedule', label: 'Grid + Generator Power Schedule' },
                        { value: '100% Off-Grid Premium Solar Hybrid', label: '100% Off-Grid Solar Hybrid' }
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-wood-700 mb-1">GPS Coordinates (Accurate Mapping)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={onboardGpsLocation}
                        onChange={(e) => setOnboardGpsLocation(e.target.value)}
                        placeholder="E.g., 6.5182, 3.3894"
                        className="flex-1 bg-white border border-wood-200 rounded-xl px-2.5 py-2 text-xs font-mono outline-hidden"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleDetectGps}
                        disabled={isDetectingGps}
                        className="px-3 bg-wood-900 text-white rounded-xl hover:bg-black transition-colors flex items-center justify-center disabled:bg-wood-300"
                        title="Locate Me via Geolocation"
                      >
                        {isDetectingGps ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <MapPin size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Utility Bill proof */}
                  <div className="border border-wood-200 bg-white rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <label className="block font-bold text-wood-700 mb-1">Proof of Utility (Recent EKEDC / IKEDC electric bill or water card)</label>
                    </div>

                    {onboardUtilityBillImage ? (
                      <div className="relative rounded-xl overflow-hidden h-32 border border-wood-150">
                        <img src={onboardUtilityBillImage} alt="Utility Bill Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setOnboardUtilityBillImage('')}
                          className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-90 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-wood-50/50 p-4 min-h-24">
                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => startCamera('utilityBillImage')}
                            className="flex-1 py-1.5 bg-wood-900 text-white rounded-lg font-semibold hover:bg-black transition-colors flex items-center justify-center gap-1 text-[10px]"
                          >
                            <Camera size={12} />
                            <span>Camera</span>
                          </button>
                          <label className="flex-1 py-1.5 bg-white border border-wood-200 text-wood-700 rounded-lg font-semibold hover:bg-wood-50 transition-colors flex items-center justify-center gap-1 text-[10px] cursor-pointer text-center">
                            <Upload size={12} />
                            <span>File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLocalFileChange('utilityBillImage', e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hostel media showcase */}
                  <div className="border border-wood-200 bg-white rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <label className="block font-bold text-wood-700 mb-1">Hostel Photos / Video Showcases (Listing Quality Audit)</label>
                      <p className="text-[10px] text-wood-400 mb-2">Provide exterior or room views of your building structure.</p>
                    </div>

                    {onboardHostelMedia.length > 0 ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-1.5 h-20 overflow-y-auto">
                          {onboardHostelMedia.map((url, i) => (
                            <div key={i} className="relative rounded-lg overflow-hidden border border-wood-200 h-16">
                              <img src={url} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setOnboardHostelMedia(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute top-0.5 right-0.5 bg-black/70 text-white p-0.5 rounded-full"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => startCamera('hostelMedia')}
                            className="flex-1 py-1 text-wood-800 border border-wood-200 hover:bg-wood-50 rounded-lg font-semibold text-[9px] flex items-center justify-center gap-1"
                          >
                            <Camera size={10} /> Add photo
                          </button>
                          <label className="flex-1 py-1 text-wood-800 border border-wood-200 hover:bg-wood-50 rounded-lg font-semibold text-[9px] flex items-center justify-center gap-1 cursor-pointer">
                            <Upload size={10} /> Add file
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLocalFileChange('hostelMedia', e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-wood-50/50 p-4 min-h-24">
                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => startCamera('hostelMedia')}
                            className="flex-1 py-1.5 bg-wood-900 text-white rounded-lg font-semibold hover:bg-black transition-colors flex items-center justify-center gap-1 text-[10px]"
                          >
                            <Camera size={12} />
                            <span>Camera</span>
                          </button>
                          <label className="flex-1 py-1.5 bg-white border border-wood-200 text-wood-700 rounded-lg font-semibold hover:bg-wood-50 transition-colors flex items-center justify-center gap-1 text-[10px] cursor-pointer text-center">
                            <Upload size={12} />
                            <span>File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLocalFileChange('hostelMedia', e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 5: PAYOUT LEDGER COORDINATES */}
              <div className="bg-wood-50 p-5 rounded-2xl border border-wood-150 space-y-4">
                <div className="flex items-center gap-2 border-b border-wood-200/60 pb-2">
                  <CreditCard size={18} className="text-wood-600" />
                  <h3 className="font-bold text-sm text-wood-950">5. Bank Payout Account Details (Escrow Settlement Gate)</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold mb-1.5">Bank Name</label>
                    <CustomSelect
                      value={onboardBankName}
                      onChange={(val) => setOnboardBankName(val)}
                      options={[
                        { value: 'Access Bank', label: 'Access Bank' },
                        { value: 'Guaranty Trust Bank (GTB)', label: 'Guaranty Trust Bank (GTB)' },
                        { value: 'Zenith Bank', label: 'Zenith Bank' },
                        { value: 'United Bank for Africa (UBA)', label: 'United Bank for Africa (UBA)' },
                        { value: 'First Bank of Nigeria', label: 'First Bank of Nigeria' },
                        { value: 'Wema Bank', label: 'Wema Bank' },
                        { value: 'Kuda Bank Microfinance', label: 'Kuda Bank Microfinance' }
                      ]}
                    />
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
                className="w-full py-3.5 bg-wood-900 hover:bg-black text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldAlert size={16} />
                <span>Submit 11-Point Verification Profile for Audit</span>
              </button>
            </form>
          </div>
        )}

        {subTab === 'verification' && activeLandlord.kycStatus === 'PENDING' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-wood-200 p-8 shadow-xs text-center space-y-6 animate-fadeIn">
            <div className="bg-amber-100 text-amber-700 p-3 rounded-full w-fit mx-auto mb-4 animate-pulse">
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
        )}

        {subTab === 'verification' && activeLandlord.kycStatus === 'APPROVED' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-emerald-200 p-8 shadow-xs text-center space-y-6 animate-fadeIn">
            <div className="bg-emerald-100 text-emerald-700 p-3 rounded-full w-fit mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="font-display font-bold text-xl text-wood-950">Account Vetted & Verified</h2>
            <p className="text-sm text-wood-600 leading-relaxed max-w-md mx-auto">
              Congratulations! Your identity, property proof documents, and compliance records have been approved by the Dormiversity administration team.
            </p>
            <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl text-left text-xs max-w-md mx-auto space-y-3">
              <h3 className="font-bold text-emerald-950 border-b border-emerald-100 pb-2">Vetted Details:</h3>
              <div className="grid grid-cols-2 gap-y-2 text-[11px]">
                <span className="text-wood-500 font-medium">Primary Campus:</span>
                <span className="font-bold text-wood-900">{schools.find(s => s.id === activeLandlord.kycDetails?.schoolApprovalId || onboardSchoolApprovalId)?.name || 'Direct Affiliate'}</span>
                
                <span className="text-wood-500 font-medium">NIN/ID Verified:</span>
                <span className="font-bold text-wood-900">National ID Card / NIN (Vetted)</span>
                
                <span className="text-wood-500 font-medium">Property Ownership:</span>
                <span className="font-bold text-wood-900">Certificate of Occupancy (Vetted)</span>

                <span className="text-wood-500 font-medium">Safety Approvals:</span>
                <span className="font-bold text-wood-900">Building Permit & Fire Safety (Approved)</span>

                <span className="text-wood-500 font-medium">Linked Account:</span>
                <span className="font-bold text-wood-900">{activeLandlord.kycDetails?.bankName || 'Access Bank'} - {activeLandlord.kycDetails?.bankAccount || '0123456789'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    )}

            {/* LISTINGS SUBTAB */}
            {subTab === 'listings' && (
              <div className="space-y-6">
                {activeLandlord.kycStatus !== 'APPROVED' && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-left text-xs max-w-4xl mx-auto flex gap-3 animate-fadeIn">
                    <div className="text-amber-600 bg-amber-100 p-2 rounded-xl shrink-0 h-fit">
                      <ShieldAlert size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900">Verification Required to List properties</h4>
                      <p className="text-amber-800 mt-1 leading-relaxed">
                        Nigerian safety laws require all landlords to pass identity and property vetting before publishing hostings. You can view listings and payouts, but you will not be able to list new rooms or accept new secure bookings. Please complete your vetting application in the <span className="font-bold underline cursor-pointer hover:text-amber-950" onClick={() => setSubTab('verification')}>Verification Status</span> tab.
                      </p>
                    </div>
                  </div>
                )}
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

                  {/* Profile Picture Uploader Row */}
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

                {/* DANGER ZONE: DELETE ACCOUNT */}
                <div className="mt-8 bg-red-50/50 p-6 sm:p-8 rounded-3xl border border-red-200 shadow-xs text-left space-y-4">
                  <div className="flex items-start space-x-3 text-red-800">
                    <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-display font-bold text-base text-red-950">Danger Zone</h3>
                      <p className="text-xs text-red-700 mt-0.5 leading-normal">
                        Deleting your account is permanent. This will erase all your active listings, rent escrow balances, and active tenant chat histories from our database immediately.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you absolutely sure you want to permanently delete your Landlord account? All your active property listings and transactions will be deleted permanently. This action is completely irreversible.")) {
                          if (onDeleteAccount) {
                            onDeleteAccount(activeLandlord.id);
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
                        <CustomSelect
                          value={newRoomType}
                          onChange={(val) => setNewRoomType(val as any)}
                          options={[
                            { value: 'Self-Contain', label: 'Self-Contain' },
                            { value: 'Shared (2-in-a-room)', label: 'Shared (2-in-a-room)' },
                            { value: 'Shared (4-in-a-room)', label: 'Shared (4-in-a-room)' },
                            { value: 'Single Room', label: 'Single Room' }
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Gender Restriction</label>
                        <CustomSelect
                          value={newGender}
                          onChange={(val) => setNewGender(val as any)}
                          options={[
                            { value: 'Mixed', label: 'Mixed Allowed' },
                            { value: 'Male', label: 'Males Only' },
                            { value: 'Female', label: 'Females Only' }
                          ]}
                        />
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

                    <div className="flex flex-col gap-3 pt-4 border-t border-wood-100">
                      {activeLandlord.kycStatus !== 'APPROVED' && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-[11px] font-medium flex items-center gap-1.5 leading-relaxed">
                          <AlertCircle size={14} className="shrink-0" />
                          <span>Warning: Your KYC status must be approved before publishing. Change to ADMIN via View As to approve.</span>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="px-4 py-2.5 border border-wood-200 rounded-xl text-wood-700 font-semibold hover:bg-wood-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={activeLandlord.kycStatus !== 'APPROVED'}
                          className={`px-5 py-2.5 font-bold rounded-xl shadow-xs transition-all ${
                            activeLandlord.kycStatus === 'APPROVED'
                              ? 'bg-wood-600 hover:bg-wood-700 text-white cursor-pointer'
                              : 'bg-wood-200 text-wood-400 cursor-not-allowed'
                          }`}
                        >
                          Publish listing
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>

      {cameraActive && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center p-4 z-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-wood-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-wood-100 pb-3">
              <h3 className="font-display font-bold text-base text-wood-950 flex items-center gap-1.5">
                <Camera size={18} className="text-wood-600 animate-pulse" />
                <span>Camera Video Feed</span>
              </h3>
              <button type="button" onClick={stopCamera} className="text-wood-400 hover:text-wood-950 font-bold">✕</button>
            </div>
            
            {cameraError ? (
              <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {cameraError}
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-wood-300">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 border border-wood-200 rounded-xl text-wood-700 font-semibold hover:bg-wood-50"
              >
                Cancel
              </button>
              {!cameraError && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-5 py-2 bg-wood-900 hover:bg-black text-white font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Camera size={14} />
                  <span>Take Snapshot</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
