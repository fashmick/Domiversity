import { School, User, Hostel, Booking, InspectorJob, CohabitantPost, ChatThread, Message } from './types';

export const INITIAL_SCHOOLS: School[] = [
  { id: 'school_1', name: 'University of Lagos', type: 'University', ownership: 'Federal', state: 'Lagos', abbreviation: 'UNILAG' },
  { id: 'school_2', name: 'University of Ibadan', type: 'University', ownership: 'Federal', state: 'Oyo', abbreviation: 'UI' },
  { id: 'school_3', name: 'Obafemi Awolowo University', type: 'University', ownership: 'Federal', state: 'Osun', abbreviation: 'OAU' },
  { id: 'school_4', name: 'Yaba College of Technology', type: 'Polytechnic', ownership: 'Federal', state: 'Lagos', abbreviation: 'YABATECH' },
  { id: 'school_5', name: 'Federal College of Education, Abeokuta', type: 'College of Education', ownership: 'Federal', state: 'Ogun', abbreviation: 'FCE' },
  { id: 'school_6', name: 'Covenant University', type: 'University', ownership: 'Private', state: 'Ogun', abbreviation: 'CU' },
  { id: 'school_7', name: 'Ahmadu Bello University', type: 'University', ownership: 'Federal', state: 'Kaduna', abbreviation: 'ABU' },
  { id: 'school_8', name: 'University of Nigeria, Nsukka', type: 'University', ownership: 'Federal', state: 'Enugu', abbreviation: 'UNN' },
  { id: 'school_9', name: 'University of Ilorin', type: 'University', ownership: 'Federal', state: 'Kwara', abbreviation: 'UNILORIN' },
  { id: 'school_10', name: 'Federal University of Technology, Akure', type: 'University', ownership: 'Federal', state: 'Ondo', abbreviation: 'FUTA' },
  { id: 'school_11', name: 'Federal University of Technology, Minna', type: 'University', ownership: 'Federal', state: 'Niger', abbreviation: 'FUTMINNA' },
  { id: 'school_12', name: 'Ladoke Awintola University of Technology', type: 'University', ownership: 'State', state: 'Oyo', abbreviation: 'LAUTECH' },
  { id: 'school_13', name: 'University of Benin', type: 'University', ownership: 'Federal', state: 'Edo', abbreviation: 'UNIBEN' },
  { id: 'school_14', name: 'Lagos State University', type: 'University', ownership: 'State', state: 'Lagos', abbreviation: 'LASU' },
  { id: 'school_15', name: 'Babcock University', type: 'University', ownership: 'Private', state: 'Ogun', abbreviation: 'BU' },
  { id: 'school_16', name: 'Bayero University Kano', type: 'University', ownership: 'Federal', state: 'Kano', abbreviation: 'BUK' },
  { id: 'school_17', name: 'University of Port Harcourt', type: 'University', ownership: 'Federal', state: 'Rivers', abbreviation: 'UNIPORT' },
  { id: 'school_18', name: 'University of Jos', type: 'University', ownership: 'Federal', state: 'Plateau', abbreviation: 'UNIJOS' },
  { id: 'school_19', name: 'Nnamdi Azikiwe University', type: 'University', ownership: 'Federal', state: 'Anambra', abbreviation: 'UNIZIK' },
  { id: 'school_20', name: 'Federal University of Technology, Owerri', type: 'University', ownership: 'Federal', state: 'Imo', abbreviation: 'FUTO' },
  { id: 'school_21', name: 'Michael Okpara University of Agriculture, Umudike', type: 'University', ownership: 'Federal', state: 'Abia', abbreviation: 'MOUAU' },
  { id: 'school_22', name: 'Tai Solarin University of Education', type: 'University', ownership: 'State', state: 'Ogun', abbreviation: 'TASUED' },
  { id: 'school_23', name: 'Federal University of Agriculture, Abeokuta', type: 'University', ownership: 'Federal', state: 'Ogun', abbreviation: 'FUNAAB' },
  { id: 'school_24', name: 'Enugu State University of Science and Technology', type: 'University', ownership: 'State', state: 'Enugu', abbreviation: 'ESUT' },
  { id: 'school_25', name: 'Imo State University', type: 'University', ownership: 'State', state: 'Imo', abbreviation: 'IMSU' },
  { id: 'school_26', name: 'Delta State University, Abraka', type: 'University', ownership: 'State', state: 'Delta', abbreviation: 'DELSU' },
  { id: 'school_27', name: 'Kwara State University', type: 'University', ownership: 'State', state: 'Kwara', abbreviation: 'KWASU' },
  { id: 'school_28', name: 'Olabisi Onabanjo University', type: 'University', ownership: 'State', state: 'Ogun', abbreviation: 'OOU' },
  { id: 'school_29', name: 'Ekiti State University', type: 'University', ownership: 'State', state: 'Ekiti', abbreviation: 'EKSU' },
  { id: 'school_30', name: 'Nile University of Nigeria', type: 'University', ownership: 'Private', state: 'Abuja', abbreviation: 'NILE' },
  { id: 'school_31', name: 'Pan-Atlantic University', type: 'University', ownership: 'Private', state: 'Lagos', abbreviation: 'PAU' },
  { id: 'school_32', name: 'Federal Polytechnic, Ilaro', type: 'Polytechnic', ownership: 'Federal', state: 'Ogun', abbreviation: 'ILAROPOLY' },
  { id: 'school_33', name: 'Auchi Polytechnic', type: 'Polytechnic', ownership: 'Federal', state: 'Edo', abbreviation: 'AUCHIPOLY' },
  { id: 'school_34', name: 'Kaduna Polytechnic', type: 'Polytechnic', ownership: 'Federal', state: 'Kaduna', abbreviation: 'KADPOLY' }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'student_1',
    name: 'Ayomide Fashina',
    email: 'student.ayomide@dormiversity.com',
    phone: '08123456789',
    role: 'STUDENT',
    kycStatus: 'APPROVED',
    schoolId: 'school_1',
    department: 'Computer Science',
    profilePicture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'student_2',
    name: 'Chioma Uzor',
    email: 'student.chioma@dormiversity.com',
    phone: '09011223344',
    role: 'STUDENT',
    kycStatus: 'NOT_SUBMITTED',
    schoolId: 'school_1',
    department: 'Business Administration',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'landlord_1',
    name: 'Elder Gabriel Benson',
    email: 'elder.gabriel@hostelowner.ng',
    phone: '08033445566',
    role: 'LANDLORD',
    kycStatus: 'APPROVED',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    kycDetails: {
      idType: 'National ID Card (NIN)',
      idNumber: '12345678901',
      idImage: 'NIN_Gabriel_Benson.pdf',
      proofDoc: 'Certificate_of_Occupancy_Akoka_Villa.pdf',
      bankName: 'Access Bank',
      bankAccount: '0123456789',
      bankAccountName: 'Gabriel Benson O.'
    }
  },
  {
    id: 'landlord_2',
    name: 'Alhaji Ibrahim Dantata',
    email: 'dantata.hostels@gmail.com',
    phone: '07055667788',
    role: 'LANDLORD',
    kycStatus: 'PENDING',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    kycDetails: {
      idType: "Driver's License",
      idNumber: 'DL-9876543-Z',
      idImage: 'DL_Ibrahim_Dantata.jpg',
      proofDoc: 'Property_Purchase_Receipt_Bodija.pdf',
      bankName: 'Guaranty Trust Bank (GTB)',
      bankAccount: '0044556677',
      bankAccountName: 'Ibrahim Dantata Properties'
    }
  },
  {
    id: 'inspector_1',
    name: 'Tunde Alao',
    email: 'tunde.alao@roomlyinspector.ng',
    phone: '08188776655',
    role: 'INSPECTOR',
    kycStatus: 'APPROVED',
    schoolId: 'school_1',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    kycDetails: {
      idType: 'Voter\'s Card',
      idNumber: '90F7B8C241',
      idImage: 'VotersCard_Tunde_Alao.png',
      proofDoc: 'Unilag_Student_ID_Tunde.jpg',
      bankName: 'Zenith Bank',
      bankAccount: '2112233445',
      bankAccountName: 'Tunde Alao'
    }
  },
  {
    id: 'admin_1',
    name: 'Dormiversity Admin',
    email: 'admin@dormiversity.com',
    phone: '010002000',
    role: 'ADMIN',
    kycStatus: 'APPROVED',
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120'
  }
];

export const INITIAL_HOSTELS: Hostel[] = [
  {
    id: 'hostel_1',
    landlordId: 'landlord_1',
    landlordName: 'Elder Gabriel Benson',
    name: 'Oakwood Premium Suites',
    price: 380000,
    address: '14, Saint Finbarrs Road, Akoka, Yaba',
    proximity: 0.4,
    schoolId: 'school_1',
    roomType: 'Self-Contain',
    amenities: ['Water Running', 'Generator/Solar', 'Fenced Security', 'Kitchen'],
    gender: 'Mixed',
    photos: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400'
    ],
    description: 'Beautiful modern self-contain apartment within walking distance from the UNILAG main gate. Perfect for serious students. Fully gated compound with uniform security, daily running treated borehole water, and a shared backup solar panel system for constant lighting.',
    isAvailable: true,
    reviewsCount: 3,
    rating: 4.8,
    rules: ['No loud music after 10 PM', 'No subletting', 'Keep public hallway clean']
  },
  {
    id: 'hostel_2',
    landlordId: 'landlord_1',
    landlordName: 'Elder Gabriel Benson',
    name: 'Lagoon View Shared Villa',
    price: 180000,
    address: '25, Abule-Oja Street, Akoka, Yaba',
    proximity: 0.9,
    schoolId: 'school_1',
    roomType: 'Shared (2-in-a-room)',
    amenities: ['Water Running', 'Fenced Security', 'Kitchen'],
    gender: 'Female',
    photos: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=400'
    ],
    description: 'Shared student accommodation tailored strictly for female scholars. Quiet study environment, secured compound, close to local food joints. Rent covers 1 bedspace in a spacious double room. Has an en-suite bathroom and functional kitchenette.',
    isAvailable: true,
    reviewsCount: 1,
    rating: 4.0,
    rules: ['Female guests only', 'No overnight male visitors', 'No pet animals allowed']
  },
  {
    id: 'hostel_3',
    landlordId: 'landlord_2',
    landlordName: 'Alhaji Ibrahim Dantata',
    name: 'Bodija Scholar Sanctuary',
    price: 320000,
    address: '5, Oshuntokun Avenue, Bodija, Ibadan',
    proximity: 1.2,
    schoolId: 'school_2',
    roomType: 'Self-Contain',
    amenities: ['Water Running', 'Generator/Solar', 'Fenced Security', 'WiFi'],
    gender: 'Male',
    photos: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=400'
    ],
    description: 'Premium boys-only hostel situated in secure Bodija area, very accessible to UI. Constant high-speed WiFi, modern tiled floors, fully painted, dedicated prepaid meter for power management.',
    isAvailable: true,
    reviewsCount: 0,
    rating: 5.0,
    rules: ['No smoking inside rooms', 'Notify landlord before organizing gatherings']
  },
  {
    id: 'hostel_4',
    landlordId: 'landlord_2',
    landlordName: 'Alhaji Ibrahim Dantata',
    name: 'Mayfair Classic Dorms',
    price: 160000,
    address: 'Road 7, Mayfair District, Ile-Ife',
    proximity: 2.3,
    schoolId: 'school_3',
    roomType: 'Shared (4-in-a-room)',
    amenities: ['Water Running', 'Fenced Security'],
    gender: 'Mixed',
    photos: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=400'
    ],
    description: 'Extremely affordable shared accommodation for OAU students in Mayfair. Shared toilet/bathroom and kitchen facilities. Large fenced and locked gate. Clean and well-maintained by a live-in caretaker.',
    isAvailable: true,
    reviewsCount: 2,
    rating: 3.5,
    rules: ['Gate locks strictly at 11:00 PM', 'Mandatory monthly sanitation participation']
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'booking_1',
    hostelId: 'hostel_1',
    hostelName: 'Oakwood Premium Suites',
    hostelPhoto: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400',
    landlordId: 'landlord_1',
    landlordName: 'Elder Gabriel Benson',
    studentId: 'student_1',
    studentName: 'Ayomide Fashina',
    studentPhone: '08123456789',
    price: 380000,
    status: 'IN_ESCROW',
    createdAt: '2026-07-10T14:30:00Z',
    moveInDate: '2026-07-20',
    inspectorJobId: 'job_1'
  }
];

export const INITIAL_INSPECTIONS: InspectorJob[] = [
  {
    id: 'job_1',
    hostelId: 'hostel_1',
    hostelName: 'Oakwood Premium Suites',
    hostelPhoto: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400',
    hostelAddress: '14, Saint Finbarrs Road, Akoka, Yaba',
    landlordId: 'landlord_1',
    landlordName: 'Elder Gabriel Benson',
    studentId: 'student_1',
    studentName: 'Ayomide Fashina',
    inspectorId: 'inspector_1',
    inspectorName: 'Tunde Alao',
    status: 'COMPLETED',
    fee: 5000,
    createdAt: '2026-07-11T10:15:00Z',
    report: {
      id: 'report_1',
      jobId: 'job_1',
      inspectorName: 'Tunde Alao',
      waterStatus: 'Good',
      powerStatus: 'Scheduled (Gen/Solar)',
      securityStatus: 'Highly Secured',
      cleanlinessStatus: 'Clean',
      matchStatus: 'Exactly as listed',
      notes: 'Visually inspected the self-contain room. Power and light are operational. The borehole runs clean water with high pressure. The fence is tall with barbed wires. The landlord Benson is a well-known local elder. Very safe option.',
      recommendation: 'Highly Recommended',
      photos: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=400'
      ],
      createdAt: '2026-07-12T16:00:00Z'
    }
  }
];

export const INITIAL_COHABITANTS: CohabitantPost[] = [
  {
    id: 'post_1',
    studentId: 'student_2',
    studentName: 'Chioma Uzor',
    studentPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    schoolId: 'school_1',
    budget: 200000,
    gender: 'Female',
    habits: ['Quiet', 'Studious', 'Non-smoker'],
    description: 'Hi everyone! I am a 200 Level Business Administration student looking for a neat roommate to split a shared room near Akoka (Lagoon View Shared Villa or similar). I study mostly at night, am quiet, and prefer a clean room. Reach out let\'s chat!',
    createdAt: '2026-07-14T09:00:00Z',
    isClosed: false
  }
];

export const INITIAL_CHATS: ChatThread[] = [
  {
    id: 'thread_1',
    studentId: 'student_1',
    otherId: 'landlord_1',
    otherName: 'Elder Gabriel Benson',
    otherRole: 'LANDLORD',
    hostelId: 'hostel_1',
    hostelName: 'Oakwood Premium Suites',
    bookingId: 'booking_1',
    lastMessageText: 'The inspection has been completed. Looking forward to moving in soon!',
    lastMessageTime: '2026-07-12T16:15:00Z',
    isFlaggedByAdmin: false
  },
  {
    id: 'thread_2',
    studentId: 'student_1',
    otherId: 'inspector_1',
    otherRole: 'INSPECTOR',
    otherName: 'Tunde Alao',
    hostelId: 'hostel_1',
    hostelName: 'Oakwood Premium Suites',
    lastMessageText: 'Report uploaded. Let me know if you need anything else.',
    lastMessageTime: '2026-07-12T16:05:00Z',
    isFlaggedByAdmin: false
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    threadId: 'thread_1',
    senderId: 'student_1',
    senderName: 'Ayomide Fashina',
    text: 'Hello Elder Benson, I am very interested in your Oakwood Premium Suites room. I just paid the rent into escrow and requested a Dormiversity Inspector.',
    createdAt: '2026-07-10T15:00:00Z',
    isBlocked: false
  },
  {
    id: 'm2',
    threadId: 'thread_1',
    senderId: 'landlord_1',
    senderName: 'Elder Gabriel Benson',
    text: 'Welcome, my child. Yes, I received the booking notice from the platform. The room is clean and unlocked. The inspector can come anytime.',
    createdAt: '2026-07-10T15:12:00Z',
    isBlocked: false
  },
  {
    id: 'm3',
    threadId: 'thread_1',
    senderId: 'student_1',
    senderName: 'Ayomide Fashina',
    text: 'The inspection has been completed. Looking forward to moving in soon!',
    createdAt: '2026-07-12T16:15:00Z',
    isBlocked: false
  },
  // Thread 2 (Student to Inspector)
  {
    id: 'm4',
    threadId: 'thread_2',
    senderId: 'student_1',
    senderName: 'Ayomide Fashina',
    text: 'Hi Tunde, thanks for accepting my inspection request. Please check the borehole water and bathroom tiles particularly.',
    createdAt: '2026-07-11T11:00:00Z',
    isBlocked: false
  },
  {
    id: 'm5',
    threadId: 'thread_2',
    senderId: 'inspector_1',
    senderName: 'Tunde Alao',
    text: 'Noted. I will visit the hostel tomorrow afternoon and check those details carefully.',
    createdAt: '2026-07-11T11:30:00Z',
    isBlocked: false
  },
  {
    id: 'm6',
    threadId: 'thread_2',
    senderId: 'inspector_1',
    senderName: 'Tunde Alao',
    text: 'Report uploaded. Let me know if you need anything else.',
    createdAt: '2026-07-12T16:05:00Z',
    isBlocked: false
  }
];
