import React, { useState, useEffect, useRef } from 'react';
import { Home, ShieldAlert, CheckCircle2, Shield, Plus, Power, Users, DollarSign, MessageSquare, List, ClipboardCheck, Clock, FileText, ChevronRight, X, User, Camera, Upload, MapPin, CreditCard, Phone, AlertCircle, Building, Check, ShieldCheck, Settings, Loader2 } from 'lucide-react';
import { Hostel, Booking, InspectorJob, User as PlatformUser, School } from '../types';
import { formatNaira, formatDate, getApiUrl } from '../utils';
import SchoolSelect from './SchoolSelect';
import CustomSelect from './CustomSelect';
import { NIGERIAN_BANKS } from '../constants/banks';

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
  const [showKycPopup, setShowKycPopup] = useState(false);
  const hasCheckedKyc = useRef(false);

  useEffect(() => {
    if (activeLandlord && !hasCheckedKyc.current) {
      hasCheckedKyc.current = true;
      const details = activeLandlord.kycDetails;
      const isCompleted = details && 
        !!details.schoolApprovalId &&
        !!details.idType &&
        !!details.idNumber &&
        !!details.idImage &&
        !!details.proofDoc &&
        !!details.proofDocImage &&
        !!details.buildingApprovalNum &&
        !!details.buildingApprovalImage &&
        !!details.fireSafetyNum &&
        !!details.fireSafetyImage &&
        !!details.waterAvailability &&
        !!details.electricityAvailability &&
        !!details.utilityBillImage &&
        !!details.gpsLocation &&
        details.hostelMedia && details.hostelMedia.length > 0 &&
        !!details.emergencyContactName &&
        !!details.emergencyContactRelation &&
        !!details.emergencyContactPhone &&
        !!details.bankName &&
        !!details.bankAccount &&
        !!details.bankAccountName;

      if (!isCompleted) {
        setShowKycPopup(true);
      }
    }
  }, [activeLandlord]);

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
      if (targetField === 'idImage') {
        setOnboardIdFileName(file.name);
      }
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
  const [onboardEmergencyContactRelation, setOnboardEmergencyContactRelation] = useState('Family Member');
  
  const [onboardSchoolApprovalId, setOnboardSchoolApprovalId] = useState(schools[0]?.id || '');
  const [onboardSchoolApprovalStatus, setOnboardSchoolApprovalStatus] = useState<'Approved' | 'Pending' | 'Not Approved'>('Pending');
  const [onboardStep, setOnboardStep] = useState(1);
  const [kycWizardStep, setKycWizardStep] = useState(1);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  const [onboardIdFileName, setOnboardIdFileName] = useState('');
  const [onboardIdValidationError, setOnboardIdValidationError] = useState('');
  const [isBankVerifying, setIsBankVerifying] = useState(false);
  const [bankVerifyError, setBankVerifyError] = useState('');
  const [isBankVerified, setIsBankVerified] = useState(false);

  useEffect(() => {
    setIsBankVerified(false);
    setBankVerifyError('');
  }, [onboardAccountNum, onboardBankName]);

  useEffect(() => {
    if (!onboardIdNum.trim()) {
      setOnboardIdValidationError('');
      return;
    }

    let numError = '';
    const cleanNum = onboardIdNum.trim().replace(/\s+/g, '');
    
    if (onboardIdType === 'National ID Card (NIN)') {
      if (!/^\d{11}$/.test(cleanNum)) {
        numError = 'Invalid NIN Number: Nigerian National Identity Number (NIN) must be exactly 11 numeric digits.';
      }
    } else if (onboardIdType === "Driver's License") {
      if (!/^[A-Z0-9]{12}$/i.test(cleanNum)) {
        numError = "Invalid Driver's License: Must be exactly 12 alphanumeric characters.";
      }
    } else if (onboardIdType === "Permanent Voter's Card (PVC)") {
      if (!/^[A-Z0-9]{19}$/i.test(cleanNum)) {
        numError = "Invalid PVC Number: Permanent Voter's Card code must be exactly 19 alphanumeric characters.";
      }
    } else if (onboardIdType === "International Passport") {
      if (!/^[A-Z0-9]{9}$/i.test(cleanNum)) {
        numError = "Invalid Passport: International Passport must be exactly 9 alphanumeric characters.";
      }
    }

    if (numError) {
      setOnboardIdValidationError(numError);
      return;
    }

    if (onboardIdFileName) {
      const lowerFile = onboardIdFileName.toLowerCase();
      let mismatch = '';

      if (onboardIdType === 'National ID Card (NIN)') {
        if (lowerFile.includes('passport') || lowerFile.includes('pvc') || lowerFile.includes('voter') || lowerFile.includes('license') || lowerFile.includes('driver')) {
          mismatch = `OCR Error: Selected ID Type is NIN, but uploaded document "${onboardIdFileName}" appears to be a different ID type (Passport/Voter Card/Driver License).`;
        }
      } else if (onboardIdType === "Driver's License") {
        if (lowerFile.includes('nin') || lowerFile.includes('pvc') || lowerFile.includes('voter') || lowerFile.includes('passport')) {
          mismatch = `OCR Error: Selected ID Type is Driver's License, but uploaded document "${onboardIdFileName}" appears to be a different ID type (NIN/Voter Card/Passport).`;
        }
      } else if (onboardIdType === "Permanent Voter's Card (PVC)") {
        if (lowerFile.includes('nin') || lowerFile.includes('passport') || lowerFile.includes('license') || lowerFile.includes('driver')) {
          mismatch = `OCR Error: Selected ID Type is Voter's Card (PVC), but uploaded document "${onboardIdFileName}" appears to be a different ID type (NIN/Passport/Driver License).`;
        }
      } else if (onboardIdType === "International Passport") {
        if (lowerFile.includes('nin') || lowerFile.includes('pvc') || lowerFile.includes('voter') || lowerFile.includes('license') || lowerFile.includes('driver')) {
          mismatch = `OCR Error: Selected ID Type is International Passport, but uploaded document "${onboardIdFileName}" appears to be a different ID type (NIN/Voter Card/Driver License).`;
        }
      }

      if (mismatch) {
        setOnboardIdValidationError(mismatch);
        return;
      }
    }

    setOnboardIdValidationError('');
  }, [onboardIdType, onboardIdNum, onboardIdFileName]);

  // Automatic NUBAN Bank Resolution Effect (Calls Paystack Interbank Lookup)
  useEffect(() => {
    const cleanNum = onboardAccountNum.trim().replace(/\D/g, '');

    if (!cleanNum) {
      setIsBankVerifying(false);
      setIsBankVerified(false);
      setBankVerifyError('');
      return;
    }

    if (cleanNum.length < 10) {
      setIsBankVerifying(false);
      setIsBankVerified(false);
      setBankVerifyError('NUBAN Error: Nigerian bank account numbers must be exactly 10 digits.');
      return;
    }

    if (cleanNum.length === 10) {
      setIsBankVerifying(true);
      setBankVerifyError('');

      const controller = new AbortController();
      const timer = setTimeout(() => {
        fetch(getApiUrl('/api/bank/resolve'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountNumber: cleanNum, bankName: onboardBankName }),
          signal: controller.signal
        })
          .then(async (res) => {
            const data = await res.json();
            setIsBankVerifying(false);
            if (res.ok && data.accountName) {
              setOnboardAccountName(data.accountName);
              setIsBankVerified(true);
              setBankVerifyError('');
            } else {
              setBankVerifyError(data.error || `NUBAN Resolution Error: Account number ${cleanNum} could not be resolved at ${onboardBankName}. Record not found. Please verify details.`);
              setIsBankVerified(false);
            }
          })
          .catch((err) => {
            if (err.name !== 'AbortError') {
              setIsBankVerifying(false);
              setBankVerifyError('Network connection error during bank account resolution.');
            }
          });
      }, 400);

      return () => {
        clearTimeout(timer);
        controller.abort();
      };
    }
  }, [onboardAccountNum, onboardBankName]);

  // Load initial draft from localStorage and activeLandlord.kycDetails
  useEffect(() => {
    let details: any = activeLandlord.kycDetails || {};
    try {
      const savedDraftStr = localStorage.getItem(`dorm_kyc_draft_${activeLandlord.id}`);
      if (savedDraftStr) {
        const parsed = JSON.parse(savedDraftStr);
        details = { ...details, ...parsed };
        if (parsed.onboardStep) setOnboardStep(parsed.onboardStep);
        if (parsed.kycWizardStep) setKycWizardStep(parsed.kycWizardStep);
        if (parsed.lastSaved) setLastSavedTime(parsed.lastSaved);
      }
    } catch (e) {
      console.warn("Could not load draft from localStorage", e);
    }

    if (details.idType) setOnboardIdType(details.idType);
    if (details.idNumber) setOnboardIdNum(details.idNumber);
    if (details.idImage) setOnboardIdImage(details.idImage);
    if (details.proofDoc) setOnboardProofDocType(details.proofDoc);
    if (details.proofDocImage) setOnboardProofDocImage(details.proofDocImage);
    if (details.businessRegNum) setOnboardBusinessRegNum(details.businessRegNum);
    if (details.businessRegImage) setOnboardBusinessRegImage(details.businessRegImage);
    if (details.buildingApprovalNum) setOnboardBuildingApprovalNum(details.buildingApprovalNum);
    if (details.buildingApprovalImage) setOnboardBuildingApprovalImage(details.buildingApprovalImage);
    if (details.fireSafetyNum) setOnboardFireSafetyNum(details.fireSafetyNum);
    if (details.fireSafetyImage) setOnboardFireSafetyImage(details.fireSafetyImage);
    if (details.waterAvailability) setOnboardWaterAvailability(details.waterAvailability);
    if (details.electricityAvailability) setOnboardElectricityAvailability(details.electricityAvailability);
    if (details.utilityBillImage) setOnboardUtilityBillImage(details.utilityBillImage);
    if (details.hostelMedia) setOnboardHostelMedia(details.hostelMedia);
    if (details.gpsLocation) setOnboardGpsLocation(details.gpsLocation);
    if (details.bankName) setOnboardBankName(details.bankName);
    if (details.bankAccount) setOnboardAccountNum(details.bankAccount);
    if (details.bankAccountName) {
      setOnboardAccountName(details.bankAccountName);
      setIsBankVerified(true);
    }
    if (details.emergencyContactName) setOnboardEmergencyContactName(details.emergencyContactName);
    if (details.emergencyContactPhone) setOnboardEmergencyContactPhone(details.emergencyContactPhone);
    if (details.emergencyContactRelation) setOnboardEmergencyContactRelation(details.emergencyContactRelation);
    if (details.schoolApprovalId) setOnboardSchoolApprovalId(details.schoolApprovalId);
    if (details.schoolApprovalStatus) setOnboardSchoolApprovalStatus(details.schoolApprovalStatus);
  }, [activeLandlord.id, activeLandlord.kycDetails, schools]);

  // Auto-save draft effect
  useEffect(() => {
    if (!activeLandlord.id) return;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const draft = {
      idType: onboardIdType,
      idNumber: onboardIdNum,
      idImage: onboardIdImage,
      proofDoc: onboardProofDocType,
      proofDocImage: onboardProofDocImage,
      businessRegNum: onboardBusinessRegNum,
      businessRegImage: onboardBusinessRegImage,
      buildingApprovalNum: onboardBuildingApprovalNum,
      buildingApprovalImage: onboardBuildingApprovalImage,
      fireSafetyNum: onboardFireSafetyNum,
      fireSafetyImage: onboardFireSafetyImage,
      waterAvailability: onboardWaterAvailability,
      electricityAvailability: onboardElectricityAvailability,
      utilityBillImage: onboardUtilityBillImage,
      hostelMedia: onboardHostelMedia,
      gpsLocation: onboardGpsLocation,
      bankName: onboardBankName,
      bankAccount: onboardAccountNum,
      bankAccountName: onboardAccountName,
      emergencyContactName: onboardEmergencyContactName,
      emergencyContactPhone: onboardEmergencyContactPhone,
      emergencyContactRelation: onboardEmergencyContactRelation,
      schoolApprovalId: onboardSchoolApprovalId,
      schoolApprovalStatus: onboardSchoolApprovalStatus,
      onboardStep,
      kycWizardStep,
      lastSaved: nowStr
    };
    try {
      localStorage.setItem(`dorm_kyc_draft_${activeLandlord.id}`, JSON.stringify(draft));
      setLastSavedTime(nowStr);
    } catch (e) {
      console.warn("Could not save KYC draft to localStorage", e);
    }
  }, [
    activeLandlord.id,
    onboardIdType, onboardIdNum, onboardIdImage,
    onboardProofDocType, onboardProofDocImage,
    onboardBusinessRegNum, onboardBusinessRegImage,
    onboardBuildingApprovalNum, onboardBuildingApprovalImage,
    onboardFireSafetyNum, onboardFireSafetyImage,
    onboardWaterAvailability, onboardElectricityAvailability,
    onboardUtilityBillImage, onboardHostelMedia,
    onboardGpsLocation, onboardBankName,
    onboardAccountNum, onboardAccountName,
    onboardEmergencyContactName, onboardEmergencyContactPhone,
    onboardEmergencyContactRelation, onboardSchoolApprovalId,
    onboardSchoolApprovalStatus, onboardStep, kycWizardStep
  ]);

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

  const renderChecklistStatusMap = () => {
    const items = [
      {
        id: 1,
        name: "Primary Campus Affiliation",
        description: "Verify regional university proximity approval",
        isComplete: !!onboardSchoolApprovalId
      },
      {
        id: 2,
        name: "Government ID Type",
        description: "National ID (NIN), PVC, passport or driver's license selected",
        isComplete: !!onboardIdType
      },
      {
        id: 3,
        name: "Identity Registration Number",
        description: "Legitimate registration match in government databases",
        isComplete: !!onboardIdNum.trim()
      },
      {
        id: 4,
        name: "Uploaded Government ID Photo",
        description: "Physical ID photo upload verified with registration number",
        isComplete: !!onboardIdImage && !!onboardIdNum.trim()
      },
      {
        id: 5,
        name: "Emergency Contact Name & Relation",
        description: "Required emergency family, relative, or caretaker contact",
        isComplete: !!onboardEmergencyContactName.trim() && !!onboardEmergencyContactRelation
      },
      {
        id: 6,
        name: "Emergency Contact Phone Number",
        description: "Active family or caretaker phone number",
        isComplete: !!onboardEmergencyContactPhone.trim()
      },
      {
        id: 7,
        name: "Property Authority Document Type",
        description: "Deed, Certificate of Occupancy, or Mandate Selected",
        isComplete: !!onboardProofDocType
      },
      {
        id: 8,
        name: "Property Ownership Certificate Upload",
        description: "Deed or Certificate image verified with selected document type",
        isComplete: !!onboardProofDocImage && !!onboardProofDocType
      },
      {
        id: 9,
        name: "Business CAC Registration RC Number",
        description: "Corporate business CAC database RC/BN registration code",
        isComplete: !!onboardBusinessRegNum.trim()
      },
      {
        id: 10,
        name: "Business CAC Certificate Upload",
        description: "Physical CAC certificate upload verified with CAC registration number",
        isComplete: !!onboardBusinessRegImage && !!onboardBusinessRegNum.trim()
      },
      {
        id: 11,
        name: "Building Approval Certificate Number",
        description: "Approval code match with state planning board",
        isComplete: !!onboardBuildingApprovalNum.trim()
      },
      {
        id: 12,
        name: "Building Approval Document Upload",
        description: "Approved structural plans verified with permit approval number",
        isComplete: !!onboardBuildingApprovalImage && !!onboardBuildingApprovalNum.trim()
      },
      {
        id: 13,
        name: "Federal Fire Safety Certificate Number",
        description: "Fire safety compliance code match",
        isComplete: !!onboardFireSafetyNum.trim()
      },
      {
        id: 14,
        name: "Fire Safety Document Upload",
        description: "Safety certificate scan verified with safety certificate number",
        isComplete: !!onboardFireSafetyImage && !!onboardFireSafetyNum.trim()
      },
      {
        id: 15,
        name: "Utility Water Availability Specs",
        description: "Constant borehole or water running availability details",
        isComplete: !!onboardWaterAvailability
      },
      {
        id: 16,
        name: "Utility Electricity Grid Selections",
        description: "Utility grid backup or solar power connectivity options",
        isComplete: !!onboardElectricityAvailability
      },
      {
        id: 17,
        name: "Utility Billing Document Upload",
        description: "Utility bill upload supporting physical address proof",
        isComplete: !!onboardUtilityBillImage
      },
      {
        id: 18,
        name: "GPS Mapping Coordinates",
        description: "Detected or manual coordinates mapped",
        isComplete: !!onboardGpsLocation.trim()
      },
      {
        id: 19,
        name: "Hostel Showcase Media Upload",
        description: "Structural safety pictures verified with GPS coordinates",
        isComplete: onboardHostelMedia.length > 0 && !!onboardGpsLocation.trim()
      },
      {
        id: 20,
        name: "Secure Bank Payout Accounts",
        description: "Active bank name, 10-digit account number, and matching verified name",
        isComplete: !!onboardBankName && !!onboardAccountNum.trim() && !!onboardAccountName.trim()
      }
    ];

    const completedCount = items.filter(item => item.isComplete).length;
    const progressPercent = Math.round((completedCount / items.length) * 100);

    return (
      <div className="bg-white p-6 rounded-3xl border border-wood-200 shadow-xs space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-base text-wood-950 flex items-center space-x-1.5">
              <Shield size={16} className="text-wood-900" />
              <span>{items.length}-Point Trust & Safety Map</span>
            </h3>
            <span className="text-xs font-mono font-bold text-wood-900 bg-wood-50 px-2 py-0.5 rounded-md border border-wood-100">
              {completedCount}/{items.length} Completed
            </span>
          </div>
          <p className="text-xs text-wood-500 mb-4">Every credential must be fully vetted for campus escrow onboarding.</p>
          
          <div className="w-full bg-wood-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-wood-900 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-start space-x-3 text-left">
              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                item.isComplete 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-600' 
                  : 'bg-wood-50/50 border-wood-200 text-wood-300'
              }`}>
                {item.isComplete ? (
                  <Check size={12} className="stroke-[3]" />
                ) : (
                  <span className="text-[10px] font-mono font-bold">{item.id}</span>
                )}
              </div>
              <div>
                <h4 className={`text-xs font-semibold ${item.isComplete ? 'text-wood-950' : 'text-wood-600'}`}>
                  {item.name}
                </h4>
                <p className="text-[10px] text-wood-400 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {activeLandlord.kycStatus === 'APPROVED' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center animate-fadeIn">
            <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>Vetting Complete & Approved</span>
            </p>
            <p className="text-[10px] text-emerald-600 mt-1">Your listings are verified and live on the student search portal.</p>
          </div>
        )}
      </div>
    );
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

    const descWords = newDescription.trim().split(/\s+/).filter(Boolean).length;
    if (descWords < 10) {
      alert(`Description too short: Detailed description must be at least 10 words long (currently ${descWords} words). Please describe room features, water/electricity condition, and security.`);
      return;
    }

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

  const handleNextStep = () => {
    let canProceed = true;
    if (onboardStep === 1) {
      if (!onboardIdNum.trim() || !onboardEmergencyContactName.trim() || !onboardEmergencyContactPhone.trim()) {
        alert("Please complete the required fields: ID number, Emergency contact name, and phone.");
        canProceed = false;
      } else if (onboardIdValidationError) {
        alert(`Government ID Verification Error: ${onboardIdValidationError}`);
        canProceed = false;
      }
    } else if (onboardStep === 2) {
      if (!onboardBuildingApprovalNum.trim() || !onboardFireSafetyNum.trim()) {
        alert("Please provide the Building Approval number and Fire Safety Certificate number.");
        canProceed = false;
      }
    } else if (onboardStep === 3) {
      if (!onboardGpsLocation.trim()) {
        alert("Please detect or enter your GPS location coordinates.");
        canProceed = false;
      }
    }
    if (canProceed && onboardStep < 4) {
      setOnboardStep(prev => prev + 1);
    }
  };

  const validateCurrentKycStep = (step: number): boolean => {
    if (step === 1) {
      if (!onboardSchoolApprovalId) {
        alert("Section 1 Incomplete: Please select your Primary Campus to list under.");
        return false;
      }
      if (!onboardIdType) {
        alert("Section 1 Incomplete: Please select your Government ID Type.");
        return false;
      }
      if (!onboardIdNum.trim()) {
        alert("Section 1 Incomplete: Please enter your ID Card Registration Number.");
        return false;
      }
      if (!onboardIdImage) {
        alert("Section 1 Incomplete: Please upload or capture a photo of your Government Issued ID.");
        return false;
      }
    } else if (step === 2) {
      if (!onboardProofDocType) {
        alert("Section 2 Incomplete: Please select your Property Management Authority Document Type.");
        return false;
      }
      if (!onboardProofDocImage) {
        alert("Section 2 Incomplete: Please upload or capture your Property Ownership / Mandate Document.");
        return false;
      }
      // Check if user filled any optional field in Section 2
      if (onboardBusinessRegNum.trim() && !onboardBusinessRegImage) {
        alert("Section 2 Optional Item Incomplete: You entered a CAC Business Reg Number, so you must also upload your CAC Certificate image.");
        return false;
      }
      if (!onboardBusinessRegNum.trim() && onboardBusinessRegImage) {
        alert("Section 2 Optional Item Incomplete: You uploaded a CAC Certificate image, so you must also enter your CAC Business Reg Number.");
        return false;
      }
      if (onboardBuildingApprovalNum.trim() && !onboardBuildingApprovalImage) {
        alert("Section 2 Optional Item Incomplete: You entered a Building Approval Number, so you must also upload the Building Approval Certificate image.");
        return false;
      }
      if (!onboardBuildingApprovalNum.trim() && onboardBuildingApprovalImage) {
        alert("Section 2 Optional Item Incomplete: You uploaded a Building Approval image, so you must also enter the Building Approval Number.");
        return false;
      }
      if (onboardFireSafetyNum.trim() && !onboardFireSafetyImage) {
        alert("Section 2 Optional Item Incomplete: You entered a Fire Safety Code, so you must also upload the Fire Safety Certificate image.");
        return false;
      }
      if (!onboardFireSafetyNum.trim() && onboardFireSafetyImage) {
        alert("Section 2 Optional Item Incomplete: You uploaded a Fire Safety Certificate image, so you must also enter the Fire Safety Code.");
        return false;
      }
    } else if (step === 3) {
      if (!onboardWaterAvailability) {
        alert("Section 3 Incomplete: Please select Water Running Availability.");
        return false;
      }
      if (!onboardElectricityAvailability) {
        alert("Section 3 Incomplete: Please select Electricity Grid / Backup status.");
        return false;
      }
      if (!onboardGpsLocation.trim()) {
        alert("Section 3 Incomplete: Please enter or detect your GPS Coordinates.");
        return false;
      }
      if (!onboardUtilityBillImage) {
        alert("Section 3 Incomplete: Please upload or capture your Proof of Utility (bill or card image).");
        return false;
      }
      if (onboardHostelMedia.length > 0 && onboardHostelMedia.length < 2) {
        alert("Section 3 Optional Item Incomplete: You started adding Hostel Showcase Photos. Please upload at least 2 photos to complete the showcase.");
        return false;
      }
    } else if (step === 4) {
      if (!onboardEmergencyContactName.trim()) {
        alert("Section 4 Incomplete: Please enter Emergency Contact Full Name.");
        return false;
      }
      if (!onboardEmergencyContactRelation) {
        alert("Section 4 Incomplete: Please select Emergency Contact Relationship.");
        return false;
      }
      if (!onboardEmergencyContactPhone.trim()) {
        alert("Section 4 Incomplete: Please enter Emergency Contact Phone Number.");
        return false;
      }
    } else if (step === 5) {
      if (!onboardBankName) {
        alert("Section 5 Incomplete: Please select your Bank Name.");
        return false;
      }
      if (!onboardAccountNum || onboardAccountNum.length !== 10) {
        alert("Section 5 Incomplete: Please enter a valid 10-digit NUBAN Account Number.");
        return false;
      }
      if (!isBankVerified || !onboardAccountName) {
        alert("Section 5 Incomplete: Bank account details must be verified and resolved before submitting.");
        return false;
      }
    }
    return true;
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onboardIdValidationError) {
      alert(`Government ID Verification Error: ${onboardIdValidationError}`);
      return;
    }
    
    // Validate all 5 wizard steps sequentially
    for (let s = 1; s <= 5; s++) {
      if (!validateCurrentKycStep(s)) {
        setKycWizardStep(s);
        return;
      }
    }

    onUploadKYC({
      idType: onboardIdType,
      idNumber: onboardIdNum,
      idImage: onboardIdImage || 'ID_Document_' + activeLandlord.name.replace(/\s+/g, '_') + '.jpg',
      proofDoc: onboardProofDocType,
      proofDocImage: onboardProofDocImage || 'Proof_Document_' + activeLandlord.name.replace(/\s+/g, '_') + '.jpg',
      businessRegNum: onboardBusinessRegNum || '',
      businessRegImage: onboardBusinessRegImage || '',
      buildingApprovalNum: onboardBuildingApprovalNum || '',
      buildingApprovalImage: onboardBuildingApprovalImage || '',
      fireSafetyNum: onboardFireSafetyNum || '',
      fireSafetyImage: onboardFireSafetyImage || '',
      waterAvailability: onboardWaterAvailability,
      electricityAvailability: onboardElectricityAvailability,
      utilityBillImage: onboardUtilityBillImage || 'Utility_Bill_' + activeLandlord.name.replace(/\s+/g, '_') + '.jpg',
      hostelMedia: onboardHostelMedia,
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
          {/* Welcome Header */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-wood-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-bold text-wood-500 uppercase tracking-widest flex items-center space-x-1.5">
                <Home size={14} />
                <span>Landlord Portal</span>
              </span>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-wood-950 mt-1">Hello, {activeLandlord.name}!</h1>
              <p className="text-xs sm:text-sm text-wood-600 mt-1">Manage your student hostel listings, escrow payouts, and KYC verification status.</p>
            </div>
          </div>

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

          {/* Action Header */}
          <div className="flex justify-between items-center border-b border-wood-200 pb-3 gap-4 flex-wrap">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-wood-950 font-display">
                {subTab === 'listings' && 'My Hostel Listings'}
                {subTab === 'escrows' && 'Active Rent Escrows'}
                {subTab === 'payouts' && 'Payout History'}
                {subTab === 'verification' && 'Landlord Verification Status'}
                {subTab === 'profile' && 'Profile & Account Settings'}
              </h2>
            </div>

            <button
              onClick={() => {
                if (activeLandlord.kycStatus !== 'APPROVED') {
                  alert("KYC Verification Required: You must pass our 20-point safety and trust audit in the 'Verification Status' tab before you can create listings.");
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
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
              {/* Status Header */}
              <div className="bg-white rounded-3xl border border-wood-200 p-6 sm:p-8 shadow-xs text-center space-y-4">
                <div className="bg-wood-50 text-wood-700 p-3.5 rounded-full w-fit mx-auto border border-wood-150">
                  <ShieldCheck size={32} className="text-wood-800" />
                </div>
                <h2 className="font-display font-bold text-2xl text-wood-950">Landlord Safety & Trust Verification</h2>
                <p className="text-xs text-wood-500 mt-2 max-w-lg mx-auto leading-relaxed">
                  Nigerian rent escrow safety laws and Dormiversity tenant protection mandates require verification of identity, ownership credentials, safety compliance, and bank coordinates.
                </p>

                <div className="mt-4 flex flex-col items-center justify-center gap-2">
                  <div className="text-xs font-semibold text-wood-600">Current Verification Status:</div>
                  {activeLandlord.kycStatus === 'APPROVED' ? (
                    <div className="inline-flex items-center text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full text-xs">
                      <CheckCircle2 size={14} className="mr-1.5 text-emerald-600 animate-bounce" />
                      ID Approved & Vetted Landlord
                    </div>
                  ) : activeLandlord.kycStatus === 'PENDING' ? (
                    <div className="inline-flex items-center text-amber-800 font-bold bg-amber-50 border border-amber-200 px-4 py-2 rounded-full text-xs animate-pulse">
                      <Clock size={14} className="mr-1.5 text-amber-600" />
                      KYC Verification Pending Audit
                    </div>
                  ) : activeLandlord.kycStatus === 'REJECTED' ? (
                    <div className="inline-flex items-center text-red-800 font-bold bg-red-50 border border-red-200 px-4 py-2 rounded-full text-xs">
                      <AlertCircle size={14} className="mr-1.5 text-red-600" />
                      Verification Declined by Auditor
                    </div>
                  ) : (
                    <div className="inline-flex items-center text-wood-700 font-bold bg-wood-100 border border-wood-200 px-4 py-2 rounded-full text-xs">
                      <Clock size={14} className="mr-1.5 text-wood-600" />
                      Verification Not Yet Submitted
                    </div>
                  )}

                  {activeLandlord.kycStatus === 'REJECTED' && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left max-w-lg mx-auto mt-2 text-xs">
                      <p className="font-bold text-red-800 flex items-center gap-1.5">
                        <AlertCircle size={14} />
                        <span>Decline Reason:</span>
                      </p>
                      <p className="text-red-700 mt-1 pl-5">{activeLandlord.kycDetails?.rejectionReason || 'Uploaded ID document is blurry or property ownership could not be verified.'}</p>
                    </div>
                  )}
                </div>

                {/* Direct CTA to Profile & Settings page for editing forms */}
                <div className="mt-6 p-5 bg-wood-50 rounded-2xl border border-wood-150 max-w-xl mx-auto space-y-3">
                  <p className="text-xs text-wood-600 leading-normal">
                    {activeLandlord.kycStatus === 'APPROVED' 
                      ? "Your documents are securely vetted. If you need to update any certificates, bills, or bank accounts, you can manage them in your profile page."
                      : "To submit or update your government IDs, property deeds, safety permits, utility bills, and bank payout coordinates, please use the sections under Profile and Settings Page."}
                  </p>
                  <button
                    onClick={() => setSubTab('profile')}
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-wood-900 hover:bg-black text-white rounded-xl font-bold text-xs transition-colors cursor-pointer gap-1.5 shadow-sm"
                  >
                    <Settings size={14} />
                    <span>Go to Profile & Settings Page Forms</span>
                  </button>
                </div>
              </div>

              {/* 20-Point Checklist Status Map */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-wood-950 pl-2">My 20-Point Safety Checklist Progress</h3>
                {renderChecklistStatusMap()}
              </div>
            </div>
          )}

          {/* DEACTIVATED HISTORIC ONBOARDING FORMS */}
          {false && subTab === 'verification' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {(activeLandlord.kycStatus === 'NOT_SUBMITTED' || activeLandlord.kycStatus === 'REJECTED') && (
                <div className="space-y-6">
                  {/* Title Banner */}
                  <div className="bg-white rounded-3xl border border-wood-200 p-6 sm:p-8 shadow-xs text-center max-w-4xl mx-auto">
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

                  {/* Two-Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN: MULTI-STEP FORM */}
                    <div className="lg:col-span-7 space-y-6">
                      {/* Draft Auto-Saved Protection Indicator */}
                      <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3.5 flex items-center justify-between text-xs text-emerald-900 shadow-2xs">
                        <div className="flex items-center space-x-2">
                          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="font-bold">KYC Auto-Save Active</span>
                          <span className="text-emerald-700 hidden sm:inline">— All progress saved continuously. You can stop or navigate anytime.</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-white/90 px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                          {lastSavedTime ? `Saved ${lastSavedTime}` : 'Draft Saved'}
                        </span>
                      </div>

                      {/* Step Indicator */}
                      <div className="bg-white p-5 rounded-2xl border border-wood-200 shadow-2xs">
                        <div className="relative flex justify-between items-center max-w-xl mx-auto">
                          {/* Connector line */}
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-wood-200 -translate-y-1/2 z-0" />
                          <div 
                            className="absolute top-1/2 left-0 h-0.5 bg-wood-600 -translate-y-1/2 z-0 transition-all duration-300"
                            style={{ width: `${((onboardStep - 1) / 3) * 100}%` }}
                          />

                          {[
                            { id: 1, label: 'Identity & Emergency Contact' },
                            { id: 2, label: 'Property & Safety' },
                            { id: 3, label: 'Location & Media' },
                            { id: 4, label: 'Bank Coordinates' }
                          ].map((s) => {
                            const isActive = onboardStep === s.id;
                            const isCompleted = onboardStep > s.id;
                            return (
                              <div key={s.id} className="relative z-10 flex flex-col items-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOnboardStep(s.id);
                                  }}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                                    isCompleted
                                      ? 'bg-wood-600 text-white shadow-2xs'
                                      : isActive
                                      ? 'bg-wood-900 text-white ring-4 ring-wood-100'
                                      : 'bg-white border-2 border-wood-200 text-wood-500 hover:border-wood-400'
                                  }`}
                                  title={`Switch to Step ${s.id}: ${s.label}`}
                                >
                                  {isCompleted ? <Check size={14} /> : s.id}
                                </button>
                                <span className={`text-[10px] mt-1.5 font-bold whitespace-nowrap hidden sm:inline ${
                                  isActive ? 'text-wood-950 font-extrabold' : 'text-wood-400'
                                }`}>
                                  {s.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step Form Box */}
                      <form onSubmit={handleOnboardSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-wood-200/80 shadow-xs space-y-6 text-xs text-wood-700">
                        {onboardStep === 1 && (
                          <div className="space-y-6 animate-fadeIn">
                            <div className="border-b border-wood-100 pb-3">
                              <h3 className="font-display font-bold text-lg text-wood-950 flex items-center gap-2">
                                <User size={20} className="text-wood-600" />
                                <span>Step 1: Landlord Identity & Emergency Contact</span>
                              </h3>
                              <p className="text-[11px] text-wood-500 mt-1">Provide government-registered identity metrics and emergency contacts.</p>
                            </div>

                            {/* Campus Affiliation */}
                            <div className="bg-wood-50 p-5 rounded-2xl border border-wood-150 space-y-4 text-left">
                              <div className="flex items-center gap-2 border-b border-wood-200/60 pb-2">
                                <Building size={16} className="text-wood-600" />
                                <h4 className="font-bold text-xs text-wood-950">Campus Affiliation (Item 11)</h4>
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
                                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center justify-between">
                                    <span className="font-semibold text-amber-800 text-[11px]">PENDING AUDIT VETT</span>
                                    <span className="bg-amber-600 text-white px-2 py-0.5 rounded-md text-[9px] font-bold">Pending</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Identity Documents */}
                            <div className="space-y-4 text-left">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block font-bold mb-1.5">Government ID Type (Item 1)</label>
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
                                    className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden font-mono focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="border border-wood-200 bg-wood-50/30 rounded-2xl p-4 flex flex-col justify-between">
                                <span className="font-bold text-wood-700 block mb-2">Government Issued ID Photo Upload</span>
                                {onboardIdImage ? (
                                  <div className="relative rounded-xl overflow-hidden h-32 border border-wood-150 group">
                                    <img src={onboardIdImage} alt="ID Preview" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOnboardIdImage('');
                                        setOnboardIdFileName('');
                                      }}
                                      className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-90 transition-colors"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-white p-4 min-h-32">
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
                              {onboardIdValidationError && (
                                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-fadeIn mt-2">
                                  <AlertCircle size={14} className="shrink-0" />
                                  <span>{onboardIdValidationError}</span>
                                </div>
                              )}
                            </div>

                            {/* Emergency Contacts */}
                            <div className="bg-wood-50 p-5 rounded-2xl border border-wood-150 space-y-4 text-left">
                              <div className="flex items-center gap-2 border-b border-wood-200/60 pb-2">
                                <Users size={16} className="text-wood-600" />
                                <h4 className="font-bold text-xs text-wood-950">Emergency Contact Info - Family / Caretaker (Item 10)</h4>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[11px] font-bold text-wood-700 mb-1.5">Contact Full Name</label>
                                  <input
                                    type="text"
                                    value={onboardEmergencyContactName}
                                    onChange={(e) => setOnboardEmergencyContactName(e.target.value)}
                                    placeholder="Family / Caretaker Full Name"
                                    className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-wood-700 mb-1.5">Relationship</label>
                                  <CustomSelect
                                    value={onboardEmergencyContactRelation}
                                    onChange={(val) => setOnboardEmergencyContactRelation(val)}
                                    options={[
                                      { value: 'Family Member', label: 'Family Member' },
                                      { value: 'Parent / Guardian', label: 'Parent / Guardian' },
                                      { value: 'Caretaker', label: 'Caretaker' },
                                      { value: 'Sibling', label: 'Sibling' },
                                      { value: 'Relative / Friend', label: 'Relative / Friend' },
                                      { value: 'Attorney / Manager', label: 'Attorney / Manager' }
                                    ]}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-wood-700 mb-1.5">Contact Phone Number</label>
                                <input
                                  type="tel"
                                  value={onboardEmergencyContactPhone}
                                  onChange={(e) => setOnboardEmergencyContactPhone(e.target.value)}
                                  placeholder="E.g., 08034567890"
                                  className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {onboardStep === 2 && (
                          <div className="space-y-6 animate-fadeIn">
                            <div className="border-b border-wood-100 pb-3">
                              <h3 className="font-display font-bold text-lg text-wood-950 flex items-center gap-2">
                                <Shield size={20} className="text-wood-600" />
                                <span>Step 2: Property Ownership & Safety Compliances</span>
                              </h3>
                              <p className="text-[11px] text-wood-500 mt-1">Upload verified legal authorities and structural safety certifications.</p>
                            </div>

                            {/* Property Proof */}
                            <div className="border border-wood-200 rounded-2xl p-4 space-y-3 bg-wood-50/40 text-left">
                              <div>
                                <label className="block font-bold text-wood-700 mb-1.5">Property Management Authority Doc Type (Item 2)</label>
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
                                <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-white p-4 min-h-28">
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
                                      <span>Upload File</span>
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

                            {/* CAC Business */}
                            <div className="border border-wood-200 rounded-2xl p-4 space-y-3 bg-wood-50/40 text-left">
                              <div>
                                <label className="block font-bold text-wood-700 mb-1">Business Registration Number (Item 3 - Optional)</label>
                                <p className="text-[10px] text-wood-400 mb-1.5">For corporate credibility (CAC RC number / BN number)</p>
                                <input
                                  type="text"
                                  value={onboardBusinessRegNum}
                                  onChange={(e) => setOnboardBusinessRegNum(e.target.value)}
                                  placeholder="E.g., RC 1829481 or BN 2849102"
                                  className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-xs font-mono outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
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
                                <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-white p-3 min-h-24">
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

                            {/* Approvals */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                              {/* Building Approval */}
                              <div className="border border-wood-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 bg-wood-50/40">
                                <div>
                                  <label className="block font-bold text-wood-700 mb-1.5">Building Approval Certificate (Item 4)</label>
                                  <input
                                    type="text"
                                    value={onboardBuildingApprovalNum}
                                    onChange={(e) => setOnboardBuildingApprovalNum(e.target.value)}
                                    placeholder="E.g., LASBCA ID"
                                    className="w-full bg-white border border-wood-200 rounded-xl px-3 py-1.5 text-xs outline-hidden"
                                    required
                                  />
                                </div>

                                {onboardBuildingApprovalImage ? (
                                  <div className="relative rounded-xl overflow-hidden h-28 border border-wood-150">
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
                                  <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-white p-3 min-h-24">
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
                              <div className="border border-wood-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 bg-wood-50/40">
                                <div>
                                  <label className="block font-bold text-wood-700 mb-1.5">Fire Safety Certificate (Item 5)</label>
                                  <input
                                    type="text"
                                    value={onboardFireSafetyNum}
                                    onChange={(e) => setOnboardFireSafetyNum(e.target.value)}
                                    placeholder="E.g., Fire Service Code"
                                    className="w-full bg-white border border-wood-200 rounded-xl px-3 py-1.5 text-xs outline-hidden"
                                    required
                                  />
                                </div>

                                {onboardFireSafetyImage ? (
                                  <div className="relative rounded-xl overflow-hidden h-28 border border-wood-150">
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
                                  <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-white p-3 min-h-24">
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
                        )}

                        {onboardStep === 3 && (
                          <div className="space-y-6 animate-fadeIn">
                            <div className="border-b border-wood-100 pb-3">
                              <h3 className="font-display font-bold text-lg text-wood-950 flex items-center gap-2">
                                <MapPin size={20} className="text-wood-600" />
                                <span>Step 3: Utilities, Accurate Mapping & Media Showcases</span>
                              </h3>
                              <p className="text-[11px] text-wood-500 mt-1">Configure physical infrastructure variables, GPS and upload marketing photos.</p>
                            </div>

                            {/* Utilities Setup */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                              <div>
                                <label className="block font-bold text-wood-700 mb-1.5">Water Running Availability (Item 6)</label>
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
                                <label className="block font-bold text-wood-700 mb-1.5">Electricity Grid / Backup</label>
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
                                <label className="block font-bold text-wood-700 mb-1.5">GPS Coordinates (Item 8)</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={onboardGpsLocation}
                                    onChange={(e) => setOnboardGpsLocation(e.target.value)}
                                    placeholder="E.g., 6.5182, 3.3894"
                                    className="flex-1 bg-wood-50 border border-wood-200 rounded-xl px-2.5 py-2 text-xs font-mono outline-hidden"
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={handleDetectGps}
                                    disabled={isDetectingGps}
                                    className="px-3 bg-wood-900 text-white rounded-xl hover:bg-black transition-colors flex items-center justify-center disabled:bg-wood-300 cursor-pointer"
                                    title="Locate via Geolocation"
                                  >
                                    {isDetectingGps ? (
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <MapPin size={12} />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Utility Bill Photo & Media Showcase */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                              {/* Utility Bill */}
                              <div className="border border-wood-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 bg-wood-50/40">
                                <div>
                                  <label className="block font-bold text-wood-700 mb-1">Proof of Utility (Bill / Utility info)</label>
                                  <p className="text-[10px] text-wood-400 mb-2">Electric bill or water card image</p>
                                </div>

                                {onboardUtilityBillImage ? (
                                  <div className="relative rounded-xl overflow-hidden h-28 border border-wood-150">
                                    <img src={onboardUtilityBillImage} alt="Utility Preview" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => setOnboardUtilityBillImage('')}
                                      className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-90 transition-colors"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-white p-3 min-h-24">
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

                              {/* Showcase Photos */}
                              <div className="border border-wood-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 bg-wood-50/40">
                                <div>
                                  <label className="block font-bold text-wood-700 mb-1">Hostel Photos / Video Showcase (Item 7)</label>
                                  <p className="text-[10px] text-wood-400 mb-2">Exterior or room structural safety previews</p>
                                </div>

                                {onboardHostelMedia.length > 0 ? (
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-4 gap-1.5 h-16 overflow-y-auto bg-white border border-wood-100 rounded-xl p-1.5">
                                      {onboardHostelMedia.map((url, i) => (
                                        <div key={i} className="relative rounded-lg overflow-hidden border border-wood-200 h-12">
                                          <img src={url} className="w-full h-full object-cover" />
                                          <button
                                            type="button"
                                            onClick={() => setOnboardHostelMedia(prev => prev.filter((_, idx) => idx !== i))}
                                            className="absolute top-0.5 right-0.5 bg-black/70 text-white p-0.5 rounded-full"
                                          >
                                            <X size={8} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => startCamera('hostelMedia')}
                                        className="flex-1 py-1 text-wood-800 border border-wood-200 hover:bg-wood-50 rounded-lg font-semibold text-[9px] flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        <Camera size={10} /> Add Camera
                                      </button>
                                      <label className="flex-1 py-1 text-wood-800 border border-wood-200 hover:bg-wood-50 rounded-lg font-semibold text-[9px] flex items-center justify-center gap-1 cursor-pointer text-center">
                                        <Upload size={10} /> Add File
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
                                  <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-white p-3 min-h-24">
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
                        )}

                        {onboardStep === 4 && (
                          <div className="space-y-6 animate-fadeIn">
                            <div className="border-b border-wood-100 pb-3">
                              <h3 className="font-display font-bold text-lg text-wood-950 flex items-center gap-2">
                                <CreditCard size={20} className="text-wood-600" />
                                <span>Step 4: Secure Bank Payout Account Details</span>
                              </h3>
                              <p className="text-[11px] text-wood-500 mt-1">Specify settlement bank accounts for automatically locked escrow clearance payouts.</p>
                            </div>

                            {/* Bank details info */}
                            <div className="bg-wood-50 p-5 rounded-2xl border border-wood-150 space-y-4 text-left">
                              <div className="flex items-center gap-2 border-b border-wood-200/60 pb-2">
                                <CreditCard size={16} className="text-wood-600" />
                                <h4 className="font-bold text-xs text-wood-950">Escrow Payout Settlement Coordinates (Item 9)</h4>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                  <label className="block font-bold mb-1.5">Bank Name</label>
                                  <CustomSelect
                                    value={onboardBankName}
                                    onChange={(val) => setOnboardBankName(val)}
                                    options={NIGERIAN_BANKS}
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold mb-1.5">10-Digit Account Number</label>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      maxLength={10}
                                      value={onboardAccountNum}
                                      onChange={(e) => setOnboardAccountNum(e.target.value.replace(/\D/g, ''))}
                                      placeholder="E.g., 0123456789"
                                      className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden font-mono focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                                      required
                                    />
                                    {isBankVerifying && (
                                      <div className="absolute right-3 top-2.5 flex items-center gap-1 text-xs text-wood-600 font-semibold bg-white/90 px-1">
                                        <Loader2 className="animate-spin text-wood-700" size={14} />
                                        <span>Resolving...</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="block font-bold mb-1.5">Verified Bank Account Name</label>
                                  <input
                                    type="text"
                                    value={onboardAccountName}
                                    readOnly
                                    placeholder={
                                      isBankVerifying 
                                        ? "Resolving NUBAN account name..." 
                                        : isBankVerified 
                                        ? "Verified Account Name" 
                                        : "Enter 10-digit account number above"
                                    }
                                    className={`w-full border rounded-xl px-3 py-2 text-sm outline-hidden font-semibold transition-all ${
                                      isBankVerified 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                        : 'bg-wood-100 border-wood-200 text-wood-500 cursor-not-allowed'
                                    }`}
                                    required
                                  />
                                </div>
                              </div>
                              {bankVerifyError && (
                                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-fadeIn mt-2">
                                  <AlertCircle size={14} className="shrink-0" />
                                  <span>{bankVerifyError}</span>
                                </div>
                              )}
                              {isBankVerified && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-fadeIn mt-2">
                                  <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                                  <span>NUBAN Account Resolved: Registered record matches {onboardAccountName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex justify-between items-center pt-4 border-t border-wood-100">
                          {onboardStep > 1 ? (
                            <button
                              type="button"
                              onClick={() => setOnboardStep(prev => prev - 1)}
                              className="px-5 py-2.5 bg-wood-100 hover:bg-wood-200 text-wood-850 font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center space-x-1.5"
                            >
                              <span>Previous Step</span>
                            </button>
                          ) : (
                            <div />
                          )}

                          {onboardStep < 4 ? (
                            <button
                              type="button"
                              onClick={handleNextStep}
                              className="px-6 py-2.5 bg-wood-900 hover:bg-black text-white font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center space-x-1.5"
                            >
                              <span>Next Step</span>
                              <span>→</span>
                            </button>
                          ) : (
                            <button
                              type="submit"
                              className="px-6 py-2.5 bg-wood-900 hover:bg-black text-white font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center space-x-1.5 shadow-md"
                            >
                              <ShieldAlert size={14} />
                              <span>Submit 20-Point Verification Profile</span>
                            </button>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* RIGHT COLUMN: 20-POINT CHECKLIST STATUS MAP */}
                    <div className="lg:col-span-5 space-y-6">
                      {renderChecklistStatusMap()}
                    </div>
                  </div>
                </div>
              )}

              {activeLandlord.kycStatus === 'PENDING' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-3xl border border-wood-200 p-8 shadow-xs text-center space-y-6 animate-fadeIn">
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
                  </div>
                  <div className="lg:col-span-5">
                    {renderChecklistStatusMap()}
                  </div>
                </div>
              )}

              {activeLandlord.kycStatus === 'APPROVED' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-xs text-center space-y-6 animate-fadeIn">
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
                  </div>
                  <div className="lg:col-span-5">
                    {renderChecklistStatusMap()}
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
              <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                {/* GENERAL PROFILE */}
                <div className="space-y-6">
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-wood-200/80 shadow-xs">
                    <h2 className="font-display font-bold text-xl text-wood-950 mb-1">Landlord Profile Settings</h2>
                    <p className="text-xs text-wood-500 mb-6">Manage your contact details and account picture.</p>

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
                      <div className="bg-wood-50/50 p-4 rounded-2xl border border-wood-100 flex flex-col items-center gap-4 text-left">
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
                  </div>

                  {/* 20-POINT KYC VERIFICATION SECTIONS */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-wood-200/80 shadow-xs space-y-6 text-left">
                    <div>
                      <h2 className="font-display font-bold text-xl text-wood-950 mb-1">KYC Verification & Safety Documents</h2>
                      <p className="text-xs text-wood-500">Provide required legal authorities, compliance certificates, and escrow coordinates.</p>
                    </div>

                    <form onSubmit={handleOnboardSubmit} className="space-y-6 text-xs text-wood-700">
                      {/* Step Progress Bar Header */}
                      <div className="bg-wood-50/80 p-4 rounded-2xl border border-wood-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-wood-950">
                            Step {kycWizardStep} of 5: {
                              kycWizardStep === 1 ? 'Identity & Campus Affiliation' :
                              kycWizardStep === 2 ? 'Property Ownership & Safety Compliances' :
                              kycWizardStep === 3 ? 'Utilities, Accurate Mapping & Media' :
                              kycWizardStep === 4 ? 'Emergency Contact Info' :
                              'Secure Bank Payout Account Details'
                            }
                          </span>
                          <span className="text-[11px] font-bold text-wood-600">{kycWizardStep * 20}% Completed</span>
                        </div>
                        <div className="w-full bg-wood-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-wood-900 h-full transition-all duration-300 rounded-full" 
                            style={{ width: `${kycWizardStep * 20}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-semibold pt-1 gap-1 overflow-x-auto">
                          {[
                            { id: 1, name: '1. Identity' },
                            { id: 2, name: '2. Ownership' },
                            { id: 3, name: '3. Utilities' },
                            { id: 4, name: '4. Emergency' },
                            { id: 5, name: '5. Bank' }
                          ].map(s => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setKycWizardStep(s.id)}
                              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                                kycWizardStep === s.id 
                                  ? 'bg-wood-900 text-white font-bold shadow-2xs' 
                                  : kycWizardStep > s.id 
                                  ? 'bg-emerald-100 text-emerald-800 font-bold' 
                                  : 'bg-white text-wood-600 border border-wood-200'
                              }`}
                            >
                              {s.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Section 1: Government ID & Campus Affiliation */}
                      {kycWizardStep === 1 && (
                      <div className="border border-wood-200 rounded-2xl p-5 space-y-4 bg-wood-50/20 animate-fadeIn">
                        <div className="flex items-center gap-2 border-b border-wood-100 pb-2.5">
                          <span className="bg-wood-900 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">1</span>
                          <h3 className="font-bold text-xs text-wood-950">Identity & Campus Affiliation</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-bold mb-1.5">Primary Campus to List Under</label>
                            <SchoolSelect
                              schools={schools}
                              value={onboardSchoolApprovalId}
                              onChange={(id) => setOnboardSchoolApprovalId(id)}
                              placeholder="Select Affiliate School..."
                            />
                          </div>
                          <div>
                            <label className="block font-bold mb-1.5">Campus Vetting Status</label>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center justify-between">
                              <span className="font-semibold text-amber-800 text-[11px]">PENDING REGIONAL VETT</span>
                              <span className="bg-amber-600 text-white px-2 py-0.5 rounded-md text-[9px] font-bold">Pending</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
                              className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden font-mono focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="border border-wood-200 bg-white rounded-xl p-4 flex flex-col justify-between">
                          <span className="font-bold text-wood-700 block mb-2">Government Issued ID Photo Upload</span>
                          {onboardIdImage ? (
                            <div className="relative rounded-xl overflow-hidden h-32 border border-wood-150 group">
                              <img src={onboardIdImage} alt="ID Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  setOnboardIdImage('');
                                  setOnboardIdFileName('');
                                }}
                                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-90 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-white p-4 min-h-32">
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
                        {onboardIdValidationError && (
                          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>{onboardIdValidationError}</span>
                          </div>
                        )}
                      </div>
                      )}

                      {/* Section 2: Property Ownership & Safety Compliances */}
                      {kycWizardStep === 2 && (
                      <div className="border border-wood-200 rounded-2xl p-5 space-y-4 bg-wood-50/20 animate-fadeIn">
                        <div className="flex items-center gap-2 border-b border-wood-100 pb-2.5">
                          <span className="bg-wood-900 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">2</span>
                          <h3 className="font-bold text-xs text-wood-950">Property Ownership & Safety Compliances</h3>
                        </div>

                        <div className="border border-wood-200 bg-white rounded-xl p-4 space-y-3">
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
                            <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-white p-4 min-h-28">
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
                                  <span>Upload File</span>
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

                        <div className="border border-wood-200 bg-white rounded-xl p-4 space-y-3">
                          <div>
                            <label className="block font-bold text-wood-700 mb-1">Business Registration Number (Optional)</label>
                            <p className="text-[10px] text-wood-400 mb-1.5">For corporate credibility (CAC RC number / BN number)</p>
                            <input
                              type="text"
                              value={onboardBusinessRegNum}
                              onChange={(e) => setOnboardBusinessRegNum(e.target.value)}
                              placeholder="E.g., RC 1829481 or BN 2849102"
                              className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-xs font-mono outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
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
                            <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-white p-3 min-h-24">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Building Approval */}
                          <div className="border border-wood-200 bg-white rounded-xl p-4 flex flex-col justify-between space-y-3 bg-wood-50/10">
                            <div>
                              <label className="block font-bold text-wood-700 mb-1.5">Building Approval Certificate (Optional)</label>
                              <input
                                type="text"
                                value={onboardBuildingApprovalNum}
                                onChange={(e) => setOnboardBuildingApprovalNum(e.target.value)}
                                placeholder="E.g., LASBCA ID"
                                className="w-full bg-white border border-wood-200 rounded-xl px-3 py-1.5 text-xs outline-hidden"
                              />
                            </div>

                            {onboardBuildingApprovalImage ? (
                              <div className="relative rounded-xl overflow-hidden h-28 border border-wood-150">
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
                              <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-white p-3 min-h-24">
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
                          <div className="border border-wood-200 bg-white rounded-xl p-4 flex flex-col justify-between space-y-3 bg-wood-50/10">
                            <div>
                              <label className="block font-bold text-wood-700 mb-1.5">Fire Safety Certificate (Optional)</label>
                              <input
                                type="text"
                                value={onboardFireSafetyNum}
                                onChange={(e) => setOnboardFireSafetyNum(e.target.value)}
                                placeholder="E.g., Fire Service Code"
                                className="w-full bg-white border border-wood-200 rounded-xl px-3 py-1.5 text-xs outline-hidden"
                              />
                            </div>

                            {onboardFireSafetyImage ? (
                              <div className="relative rounded-xl overflow-hidden h-28 border border-wood-150">
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
                              <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-white p-3 min-h-24">
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
                      )}

                      {/* Section 3: Utilities, Accurate Mapping & Media Showcases */}
                      {kycWizardStep === 3 && (
                      <div className="border border-wood-200 rounded-2xl p-5 space-y-4 bg-wood-50/20 animate-fadeIn">
                        <div className="flex items-center gap-2 border-b border-wood-100 pb-2.5">
                          <span className="bg-wood-900 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">3</span>
                          <h3 className="font-bold text-xs text-wood-950">Utilities, Accurate Mapping & Media</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block font-bold text-wood-700 mb-1.5">Water Running Availability</label>
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
                            <label className="block font-bold text-wood-700 mb-1.5">Electricity Grid / Backup</label>
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
                            <label className="block font-bold text-wood-700 mb-1.5">GPS Coordinates</label>
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
                                className="px-3 bg-wood-900 text-white rounded-xl hover:bg-black transition-colors flex items-center justify-center disabled:bg-wood-300 cursor-pointer"
                                title="Locate via Geolocation"
                              >
                                {isDetectingGps ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin animate-spin"></div>
                                ) : (
                                  <MapPin size={12} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Utility Bill */}
                          <div className="border border-wood-200 bg-white rounded-xl p-4 flex flex-col justify-between space-y-3">
                            <div>
                              <label className="block font-bold text-wood-700 mb-1">Proof of Utility (Bill / Utility info)</label>
                              <p className="text-[10px] text-wood-400 mb-2">Electric bill or water card image</p>
                            </div>

                            {onboardUtilityBillImage ? (
                              <div className="relative rounded-xl overflow-hidden h-28 border border-wood-150">
                                <img src={onboardUtilityBillImage} alt="Utility Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setOnboardUtilityBillImage('')}
                                  className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-90 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-white p-3 min-h-24">
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

                          {/* Showcase Photos */}
                          <div className="border border-wood-200 bg-white rounded-xl p-4 flex flex-col justify-between space-y-3">
                            <div>
                              <label className="block font-bold text-wood-700 mb-1">Hostel Photos / Video Showcase (Optional)</label>
                              <p className="text-[10px] text-wood-400 mb-2">Exterior or room structural safety previews</p>
                            </div>

                            {onboardHostelMedia.length > 0 ? (
                              <div className="space-y-2">
                                <div className="grid grid-cols-4 gap-1.5 h-16 overflow-y-auto bg-white border border-wood-100 rounded-xl p-1.5">
                                  {onboardHostelMedia.map((url, i) => (
                                    <div key={i} className="relative rounded-lg overflow-hidden border border-wood-200 h-12">
                                      <img src={url} className="w-full h-full object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => setOnboardHostelMedia(prev => prev.filter((_, idx) => idx !== i))}
                                        className="absolute top-0.5 right-0.5 bg-black/70 text-white p-0.5 rounded-full"
                                      >
                                        <X size={8} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => startCamera('hostelMedia')}
                                    className="flex-1 py-1 text-wood-800 border border-wood-200 hover:bg-wood-50 rounded-lg font-semibold text-[9px] flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Camera size={10} /> Add Camera
                                  </button>
                                  <label className="flex-1 py-1 text-wood-800 border border-wood-200 hover:bg-wood-50 rounded-lg font-semibold text-[9px] flex items-center justify-center gap-1 cursor-pointer text-center">
                                    <Upload size={10} /> Add File
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
                              <div className="flex flex-col items-center justify-center border border-dashed border-wood-300 rounded-xl bg-white p-3 min-h-24">
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
                      )}

                      {/* Section 4: Emergency Contact Info (Family, Relative, or Caretaker) */}
                      {kycWizardStep === 4 && (
                      <div className="border border-wood-200 rounded-2xl p-5 space-y-4 bg-wood-50/20 animate-fadeIn">
                        <div className="flex items-center gap-2 border-b border-wood-100 pb-2.5">
                          <span className="bg-wood-900 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">4</span>
                          <h3 className="font-bold text-xs text-wood-950">Emergency Contact Info (Family, Relative, or Caretaker)</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-wood-700 mb-1.5">Contact Person Full Name</label>
                            <input
                              type="text"
                              value={onboardEmergencyContactName}
                              onChange={(e) => setOnboardEmergencyContactName(e.target.value)}
                              placeholder="Family / Caretaker Full Name"
                              className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-wood-700 mb-1.5">Relationship</label>
                            <CustomSelect
                              value={onboardEmergencyContactRelation}
                              onChange={(val) => setOnboardEmergencyContactRelation(val)}
                              options={[
                                { value: 'Family Member', label: 'Family Member' },
                                { value: 'Parent / Guardian', label: 'Parent / Guardian' },
                                { value: 'Caretaker', label: 'Caretaker' },
                                { value: 'Sibling', label: 'Sibling' },
                                { value: 'Relative / Friend', label: 'Relative / Friend' },
                                { value: 'Attorney / Manager', label: 'Attorney / Manager' }
                              ]}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-wood-700 mb-1.5">Contact Phone Number</label>
                          <input
                            type="tel"
                            value={onboardEmergencyContactPhone}
                            onChange={(e) => setOnboardEmergencyContactPhone(e.target.value)}
                            placeholder="E.g., 08034567890"
                            className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                            required
                          />
                        </div>
                      </div>
                      )}

                      {/* Section 5: Secure Bank Payout Account Details */}
                      {kycWizardStep === 5 && (
                      <div className="border border-wood-200 rounded-2xl p-5 space-y-4 bg-wood-50/20 animate-fadeIn">
                        <div className="flex items-center gap-2 border-b border-wood-100 pb-2.5">
                          <span className="bg-wood-900 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">5</span>
                          <h3 className="font-bold text-xs text-wood-950">Secure Bank Payout Account Details</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block font-bold mb-1.5">Bank Name</label>
                            <CustomSelect
                              value={onboardBankName}
                              onChange={(val) => setOnboardBankName(val)}
                              options={NIGERIAN_BANKS}
                            />
                          </div>
                          <div>
                            <label className="block font-bold mb-1.5">10-Digit Account Number</label>
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={10}
                                value={onboardAccountNum}
                                onChange={(e) => setOnboardAccountNum(e.target.value.replace(/\D/g, ''))}
                                placeholder="E.g., 0123456789"
                                className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden font-mono focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                                required
                              />
                              {isBankVerifying && (
                                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-xs text-wood-600 font-semibold bg-white/90 px-1">
                                  <Loader2 className="animate-spin text-wood-700" size={14} />
                                  <span>Resolving...</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block font-bold mb-1.5">Verified Bank Account Name</label>
                            <input
                              type="text"
                              value={onboardAccountName}
                              readOnly
                              placeholder={
                                isBankVerifying 
                                  ? "Resolving NUBAN account name..." 
                                  : isBankVerified 
                                  ? "Verified Account Name" 
                                  : "Enter 10-digit account number above"
                              }
                              className={`w-full border rounded-xl px-3 py-2 text-sm outline-hidden font-semibold transition-all ${
                                isBankVerified 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                  : 'bg-wood-100 border-wood-200 text-wood-500 cursor-not-allowed'
                              }`}
                              required
                            />
                          </div>
                        </div>
                        {bankVerifyError && (
                          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-fadeIn mt-2">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>{bankVerifyError}</span>
                          </div>
                        )}
                        {isBankVerified && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-fadeIn mt-2">
                            <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                            <span>NUBAN Account Resolved: Registered record matches {onboardAccountName}</span>
                          </div>
                        )}
                      </div>
                      )}

                      {/* Step Navigation Controls */}
                      <div className="flex justify-between items-center pt-4 border-t border-wood-200 gap-3">
                        {kycWizardStep > 1 ? (
                          <button
                            type="button"
                            onClick={() => setKycWizardStep(prev => prev - 1)}
                            className="px-5 py-2.5 bg-wood-100 hover:bg-wood-200 text-wood-900 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center space-x-1"
                          >
                            <span>← Previous Section</span>
                          </button>
                        ) : (
                          <div />
                        )}

                        {kycWizardStep < 5 ? (
                          <button
                            type="button"
                            onClick={() => setKycWizardStep(prev => prev + 1)}
                            className="px-6 py-2.5 bg-wood-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center space-x-1 shadow-xs"
                          >
                            <span>Next Section →</span>
                          </button>
                        ) : (
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center space-x-2 shadow-md uppercase tracking-wider"
                          >
                            <ShieldAlert size={16} />
                            <span>Submit & Update KYC Profile</span>
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* DANGER ZONE: DELETE ACCOUNT */}
                  <div className="bg-red-50/50 p-6 sm:p-8 rounded-3xl border border-red-200 shadow-xs text-left space-y-4">
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold">Detailed Description *</label>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          newDescription.trim().split(/\s+/).filter(Boolean).length >= 10
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {newDescription.trim().split(/\s+/).filter(Boolean).length} / 10 words min
                        </span>
                      </div>
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Detail key structural components, water source, electricity meter, and environment (minimum 10 words)..."
                        className="w-full bg-wood-50 border border-wood-200 rounded-xl p-3 text-xs outline-hidden focus:ring-1 focus:ring-wood-500"
                        rows={3}
                        required
                      />
                    </div>

                    {/* Amenities Checklist */}
                    <div>
                      <label className="block font-bold mb-2">Hostel Amenities (Check all that apply)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                        {['Water Running', 'Generator/Solar', 'Fenced Security', 'WiFi', 'Kitchen', 'Air Conditioning', 'Wardrobe/Closet', 'Study Desk/Chair', 'Ensuite Bathroom', 'Prepaid Meter', 'CCTV Camera', 'Waste Management', 'Parking Space', 'Gym Facility', 'Lounge Area'].map(amenity => {
                          const isChecked = newAmenities.includes(amenity);
                          return (
                            <button
                              type="button"
                              key={amenity}
                              onClick={() => handleToggleAmenity(amenity)}
                              className={`py-2 px-1 rounded-xl border text-center font-semibold cursor-pointer text-xs ${
                                isChecked ? 'bg-wood-600 border-wood-600 text-white shadow-xs' : 'bg-white border-wood-200 text-wood-700 hover:bg-wood-50'
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

      {showKycPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-wood-200 shadow-2xl space-y-5 animate-scaleUp text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <ShieldAlert size={24} className="animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-wood-950">Finish Trust & Safety KYC Verification</h3>
              <p className="text-xs text-wood-500 leading-relaxed text-left sm:text-center">
                To list and manage student hostels, you must complete your 20-point Trust & Safety Verification profile. Some required safety documents or banking details are still missing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowKycPopup(false)}
                className="flex-1 py-2.5 border border-wood-200 hover:bg-wood-50 text-wood-700 font-bold rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubTab('verification');
                  setShowKycPopup(false);
                }}
                className="flex-1 py-2.5 bg-wood-900 hover:bg-black text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer shadow-xs hover:shadow-sm"
              >
                Finish Verification
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
