export type UserRole = 'STUDENT' | 'LANDLORD' | 'INSPECTOR' | 'ADMIN';

export type KYCStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KYCDetails {
  idType: string;
  idNumber: string;
  idImage: string;
  proofDoc: string; // ownership document or student ID
  proofDocImage?: string;
  businessRegNum?: string;
  businessRegImage?: string;
  buildingApprovalNum?: string;
  buildingApprovalImage?: string;
  fireSafetyNum?: string;
  fireSafetyImage?: string;
  waterAvailability?: string;
  electricityAvailability?: string;
  utilityBillImage?: string;
  hostelMedia?: string[];
  gpsLocation?: string;
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  schoolApprovalId?: string;
  schoolApprovalStatus?: 'Approved' | 'Pending' | 'Not Approved';
  rejectionReason?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profilePicture?: string;
  kycStatus: KYCStatus;
  kycDetails?: KYCDetails;
  schoolId?: string; // For student / inspector
  department?: string; // For student roommate matching
}

export interface School {
  id: string;
  name: string;
  type: 'University' | 'Polytechnic' | 'College of Education' | 'Technical School';
  ownership: 'Federal' | 'State' | 'Private';
  state: string;
  abbreviation?: string;
}

export interface Hostel {
  id: string;
  landlordId: string;
  landlordName: string;
  name: string;
  price: number; // yearly rent in NGN
  address: string;
  proximity: number; // distance from campus in km
  schoolId: string;
  roomType: 'Self-Contain' | 'Shared (2-in-a-room)' | 'Shared (4-in-a-room)' | 'Single Room';
  amenities: string[]; // e.g., ['Water Running', 'Generator/Solar', 'Fenced Security', 'WiFi', 'Kitchen']
  gender: 'Male' | 'Female' | 'Mixed';
  photos: string[];
  description: string;
  isAvailable: boolean;
  reviewsCount: number;
  rating: number;
  rules: string[];
}

export type BookingStatus = 'PENDING_APPROVAL' | 'IN_ESCROW' | 'RELEASED' | 'DISPUTED' | 'REFUNDED';

export interface Booking {
  id: string;
  hostelId: string;
  hostelName: string;
  hostelPhoto: string;
  landlordId: string;
  landlordName: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  price: number; // rent paid
  status: BookingStatus;
  createdAt: string;
  moveInDate: string;
  disputeReason?: string;
  disputeEvidence?: string;
  disputeResolvedAt?: string;
  disputeResolutionNotes?: string;
  inspectorJobId?: string;
  inspectionChoice?: 'SELF' | 'ROOMLY';
}

export type JobStatus = 'UNASSIGNED' | 'ASSIGNED' | 'COMPLETED';

export interface InspectionReport {
  id: string;
  jobId: string;
  inspectorName: string;
  waterStatus: 'Excellent' | 'Good' | 'Poor' | 'Broken';
  powerStatus: 'Constant' | 'Scheduled (Gen/Solar)' | 'Unstable' | 'No Power';
  securityStatus: 'Highly Secured' | 'Moderately Secured' | 'Poor';
  cleanlinessStatus: 'Spotless' | 'Clean' | 'Average' | 'Dirty';
  matchStatus: 'Exactly as listed' | 'Minor discrepancies' | 'Major discrepancy / Fake';
  notes: string;
  recommendation: 'Highly Recommended' | 'Recommended with cautions' | 'Do Not Book';
  photos: string[];
  createdAt: string;
}

export interface InspectorJob {
  id: string;
  hostelId: string;
  hostelName: string;
  hostelPhoto: string;
  hostelAddress: string;
  landlordId: string;
  landlordName: string;
  studentId: string;
  studentName: string;
  inspectorId?: string;
  inspectorName?: string;
  status: JobStatus;
  fee: number; // e.g., 5000 NGN
  report?: InspectionReport;
  createdAt: string;
}

export interface CohabitantPost {
  id: string;
  studentId: string;
  studentName: string;
  studentPhoto?: string;
  schoolId: string;
  budget: number; // max yearly rent they can pay
  gender: 'Male' | 'Female';
  genderPreference?: 'Male' | 'Female' | 'Any';
  habits: string[]; // e.g. ['Studious', 'Quiet', 'Non-smoker', 'Early-bird', 'No parties']
  description: string;
  createdAt: string;
  isClosed: boolean;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  isBlocked: boolean;
  blockedReason?: string;
}

export interface ChatThread {
  id: string;
  studentId: string;
  otherId: string;
  otherName: string;
  otherRole: UserRole;
  hostelId?: string;
  hostelName?: string;
  bookingId?: string;
  lastMessageText: string;
  lastMessageTime: string;
  isFlaggedByAdmin: boolean;
}
