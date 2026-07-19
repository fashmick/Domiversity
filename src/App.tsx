import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { loadState, saveState as saveLocalStorageState, PlatformState, checkMessageContactSharing } from './state';
import { User, School, Hostel, Booking, InspectorJob, CohabitantPost, ChatThread, Message } from './types';
import { getApiUrl } from './utils';
import LandingPage from './components/LandingPage';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import TermsPage from './components/TermsPage';
import Navigation from './components/Navigation';
import StudentDashboard from './components/StudentDashboard';
import LandlordDashboard from './components/LandlordDashboard';
import InspectorDashboard from './components/InspectorDashboard';
import AdminDashboard from './components/AdminDashboard';
import ChatInbox from './components/ChatInbox';
import AdminLogin from './components/AdminLogin';

export default function App() {
  const [state, setState] = useState<PlatformState | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedChatThreadId, setSelectedChatThreadId] = useState<string | null>(null);

  // Pathname routing states
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [adminToken, setAdminToken] = useState<string | null>(sessionStorage.getItem('dormiversity_admin_token'));
  const [isAdminVerified, setIsAdminVerified] = useState(false);

  // Listen to popstate changes and history.pushState overrides
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  // Sync state from backend on mount
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch(getApiUrl('/api/state'));
        if (res.ok) {
          const data = await res.json();
          setState(data);
          
          // If already logged in as a normal user in localStorage, restore login state
          if (data.activeUserId) {
            const user = data.users.find((u: any) => u.id === data.activeUserId);
            if (user && user.role !== 'ADMIN') {
              setIsLoggedIn(true);
            }
          }
          return;
        }
      } catch (err) {
        console.warn('Backend state fetch failed, falling back to localStorage:', err);
      }
      const loaded = loadState();
      setState(loaded);
    };
    fetchState();
  }, []);

  // Admin token verification check
  useEffect(() => {
    const verifyAdminToken = async () => {
      if (currentPath === '/admin/dashboard') {
        if (!adminToken) {
          setIsAdminVerified(false);
          return;
        }
        try {
          const res = await fetch(getApiUrl('/api/admin/verify'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: adminToken })
          });
          const data = await res.json();
          if (data.valid) {
            setIsAdminVerified(true);
            setIsLoggedIn(true);
            
            // Set active user as Admin on success
            if (state) {
              const adminUser = state.users.find(u => u.role === 'ADMIN');
              if (adminUser && state.activeUserId !== adminUser.id) {
                const updated = { ...state, activeUserId: adminUser.id };
                setState(updated);
                saveState(updated);
              }
            }
          } else {
            setIsAdminVerified(false);
          }
        } catch (e) {
          setIsAdminVerified(false);
        }
      }
    };
    verifyAdminToken();
  }, [currentPath, adminToken, state?.users]);

  // Google OAuth Popup Message Listener
  useEffect(() => {
    const handleGoogleOAuthMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { userId } = event.data.payload;
        try {
          const res = await fetch(getApiUrl('/api/state'));
          if (res.ok) {
            const data = await res.json();
            const matchedUser = data.users.find((u: any) => u.id === userId);
            if (matchedUser) {
              const updated = {
                ...data,
                activeUserId: userId
              };
              setState(updated);
              
              // Sync state to server & local storage
              saveLocalStorageState(updated);
              await fetch(getApiUrl('/api/state'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
              });
              
              setIsLoggedIn(true);
              window.history.pushState({}, '', '/');
            }
          }
        } catch (err) {
          console.error('Error synchronizing Google Auth login:', err);
        }
      }
    };
    window.addEventListener('message', handleGoogleOAuthMessage);
    return () => window.removeEventListener('message', handleGoogleOAuthMessage);
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen bg-wood-50 flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-wood-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-wood-700 font-semibold animate-pulse text-xs">Loading Dormiversity Database...</p>
      </div>
    );
  }

  const activeUser = state.users.find(u => u.id === state.activeUserId) || state.users[0];

  // Shadow saveState to automatically trigger database sync
  const saveState = (newState: PlatformState) => {
    saveStateAndSync(newState);
  };

  // Helper to save state locally and sync to server
  const saveStateAndSync = async (newState: PlatformState) => {
    setState(newState);
    saveLocalStorageState(newState); // local fallback
    try {
      await fetch(getApiUrl('/api/state'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify(newState)
      });
    } catch (e) {
      console.error('Failed to sync state to server:', e);
    }
  };

  // 1. Logout/Login actions
  const handleLogout = () => {
    if (activeUser.role === 'ADMIN') {
      sessionStorage.removeItem('dormiversity_admin_token');
      setAdminToken(null);
      setIsAdminVerified(false);
      window.history.pushState({}, '', '/');
    }
    
    // Clear active user session on sign out
    if (state) {
      const updated = {
        ...state,
        activeUserId: ''
      };
      saveStateAndSync(updated);
    }
    
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  const handleSignUp = (newUser: User) => {
    if (!state) return;
    const exists = state.users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (exists) {
      throw new Error('An account with this email address already exists. Please Sign In.');
    }
    const updated = {
      ...state,
      users: [...state.users, newUser]
    };
    saveStateAndSync(updated);
  };

  const handleSelectRoleFromLanding = (role: string, userId: string) => {
    const updated = {
      ...state,
      activeUserId: userId
    };
    saveStateAndSync(updated);
    setIsLoggedIn(true);
  };

  const handleSearchSchoolFromLanding = (schoolId: string) => {
    const firstStudent = state.users.find(u => u.role === 'STUDENT')!;
    const updated = {
      ...state,
      activeUserId: firstStudent.id
    };
    saveStateAndSync(updated);
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  // 2. Demo Switcher Role Action
  const handleSwitchUser = (userId: string) => {
    const updated = {
      ...state,
      activeUserId: userId
    };
    saveStateAndSync(updated);
    setActiveTab('dashboard');
  };

  // 3. Bookmark toggle
  const handleToggleBookmark = (hostelId: string) => {
    const alreadySaved = state.bookmarks.includes(hostelId);
    const updatedBookmarks = alreadySaved
      ? state.bookmarks.filter(id => id !== hostelId)
      : [...state.bookmarks, hostelId];
    
    const updated = {
      ...state,
      bookmarks: updatedBookmarks
    };
    saveStateAndSync(updated);
  };

  // 4. Rent Escrow Booking
  const handleBookHostel = (hostelId: string, inspectionChoice?: 'SELF' | 'ROOMLY') => {
    const hostel = state.hostels.find(h => h.id === hostelId)!;
    const newBookingId = 'booking_' + Date.now();
    const opt = inspectionChoice || 'SELF';
    
    const newBooking: Booking = {
      id: newBookingId,
      hostelId: hostelId,
      hostelName: hostel.name,
      hostelPhoto: hostel.photos[0],
      landlordId: hostel.landlordId,
      landlordName: hostel.landlordName,
      studentId: activeUser.id,
      studentName: activeUser.name,
      studentPhone: activeUser.phone,
      price: hostel.price,
      status: 'IN_ESCROW',
      createdAt: new Date().toISOString(),
      moveInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      inspectionChoice: opt
    };

    // Update hostel as booked/unavailable
    const updatedHostels = state.hostels.map(h => 
      h.id === hostelId ? { ...h, isAvailable: false } : h
    );

    // Open an automatic chat line between student and landlord regarding this booking
    const threadId = 'thread_' + Date.now();
    const welcomeMsgId = 'm_' + Date.now();
    const newThread: ChatThread = {
      id: threadId,
      studentId: activeUser.id,
      otherId: hostel.landlordId,
      otherName: hostel.landlordName,
      otherRole: 'LANDLORD',
      hostelId: hostelId,
      hostelName: hostel.name,
      bookingId: newBookingId,
      lastMessageText: `Payment of ${hostel.price.toLocaleString()} NGN completed into escrow. Welcome!`,
      lastMessageTime: new Date().toISOString(),
      isFlaggedByAdmin: false
    };

    const welcomeMessage: Message = {
      id: welcomeMsgId,
      threadId: threadId,
      senderId: 'admin_1',
      senderName: 'System Bot',
      text: `🔔 Payment Received: ${activeUser.name} paid ${hostel.price.toLocaleString()} NGN into secure Escrow. Landlord ${hostel.landlordName} can prepare the room. Funds will be released when tenant confirms satisfaction. Vetting choice: ${opt === 'ROOMLY' ? 'Request Roomly Inspector (₦5,000)' : 'Self-Inspection'}.`,
      createdAt: new Date().toISOString(),
      isBlocked: false
    };

    let updatedJobs = [...state.jobs];
    if (opt === 'ROOMLY') {
      const jobId = 'job_' + Date.now();
      const newJob: InspectorJob = {
        id: jobId,
        hostelId: hostelId,
        hostelName: hostel.name,
        hostelPhoto: hostel.photos[0],
        hostelAddress: hostel.address,
        landlordId: hostel.landlordId,
        landlordName: hostel.landlordName,
        studentId: activeUser.id,
        studentName: activeUser.name,
        status: 'UNASSIGNED',
        fee: 5000,
        createdAt: new Date().toISOString()
      };
      newBooking.inspectorJobId = jobId;
      updatedJobs = [newJob, ...updatedJobs];
    }

    const updated = {
      ...state,
      bookings: [newBooking, ...state.bookings],
      hostels: updatedHostels,
      chats: [newThread, ...state.chats],
      messages: [welcomeMessage, ...state.messages],
      jobs: updatedJobs
    };
    saveStateAndSync(updated);

    setActiveTab('bookings');
  };

  // 5. Hiring an Inspector
  const handleRequestInspection = (hostelId: string) => {
    const hostel = state.hostels.find(h => h.id === hostelId)!;
    const jobId = 'job_' + Date.now();
    const booking = state.bookings.find(b => b.hostelId === hostelId && b.studentId === activeUser.id);

    const newJob: InspectorJob = {
      id: jobId,
      hostelId: hostelId,
      hostelName: hostel.name,
      hostelPhoto: hostel.photos[0],
      hostelAddress: hostel.address,
      landlordId: hostel.landlordId,
      landlordName: hostel.landlordName,
      studentId: activeUser.id,
      studentName: activeUser.name,
      status: 'UNASSIGNED',
      fee: 5000,
      createdAt: new Date().toISOString()
    };

    const updatedBookings = state.bookings.map(b => 
      b.id === booking?.id ? { ...b, inspectorJobId: jobId } : b
    );

    const updated = {
      ...state,
      jobs: [newJob, ...state.jobs],
      bookings: updatedBookings
    };
    saveStateAndSync(updated);

    setActiveTab('bookings');
  };

  // 6. Inspector Claims Job
  const handleAcceptJob = (jobId: string) => {
    setState(prev => {
      const updatedJobs = prev.jobs.map(j => 
        j.id === jobId 
          ? { 
              ...j, 
              status: 'ASSIGNED' as const, 
              inspectorId: activeUser.id, 
              inspectorName: activeUser.name 
            } 
          : j
      );

      // Open a chat line between student and inspector for booking coordination
      const job = prev.jobs.find(jb => jb.id === jobId)!;
      const threadId = 'thread_' + Date.now();
      const newThread: ChatThread = {
        id: threadId,
        studentId: job.studentId,
        otherId: activeUser.id,
        otherName: activeUser.name,
        otherRole: 'INSPECTOR',
        hostelId: job.hostelId,
        hostelName: job.hostelName,
        lastMessageText: 'Vetting coordination open.',
        lastMessageTime: new Date().toISOString(),
        isFlaggedByAdmin: false
      };

      const introMessage: Message = {
        id: 'msg_' + Date.now(),
        threadId: threadId,
        senderId: activeUser.id,
        senderName: activeUser.name,
        text: `Hello, I am Tunde Alao, your Roomly Inspector. I have claimed your inspection job for "${job.hostelName}". I will visit the property and upload the structural checklist within 24 hours.`,
        createdAt: new Date().toISOString(),
        isBlocked: false
      };

      const updated = {
        ...prev,
        jobs: updatedJobs,
        chats: [newThread, ...prev.chats],
        messages: [introMessage, ...prev.messages]
      };
      saveState(updated);
      return updated;
    });
  };

  // 7. Inspector Submits Report
  const handleSubmitReport = (jobId: string, reportDetails: any) => {
    const reportId = 'report_' + Date.now();
    const completedReport = {
      id: reportId,
      jobId: jobId,
      inspectorName: activeUser.name,
      ...reportDetails,
      createdAt: new Date().toISOString()
    };

    setState(prev => {
      const updatedJobs = prev.jobs.map(j => 
        j.id === jobId ? { ...j, status: 'COMPLETED' as const, report: completedReport } : j
      );

      const job = prev.jobs.find(jb => jb.id === jobId)!;
      
      // Notify student in chat thread
      const existingThread = prev.chats.find(c => c.studentId === job.studentId && c.otherId === activeUser.id);
      let updatedMessages = [...prev.messages];
      if (existingThread) {
        const notifMsg: Message = {
          id: 'msg_' + Date.now(),
          threadId: existingThread.id,
          senderId: activeUser.id,
          senderName: activeUser.name,
          text: `🚨 VETTING REPORT COMPLETED: I have uploaded clear photos and structural checklist. Final Verdict: ${reportDetails.recommendation}. Check your My Bookings tab to review.`,
          createdAt: new Date().toISOString(),
          isBlocked: false
        };
        updatedMessages.push(notifMsg);
      }

      const updated = {
        ...prev,
        jobs: updatedJobs,
        messages: updatedMessages
      };
      saveState(updated);
      return updated;
    });
  };

  // 8. Escrow Release (Satisfaction confirmation)
  const handleConfirmSatisfaction = (bookingId: string) => {
    setState(prev => {
      const updatedBookings = prev.bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'RELEASED' as const } : b
      );

      const booking = prev.bookings.find(bg => bg.id === bookingId)!;
      
      // Add transaction message
      const thread = prev.chats.find(c => c.bookingId === bookingId);
      let updatedMessages = [...prev.messages];
      if (thread) {
        const confirmMsg: Message = {
          id: 'msg_' + Date.now(),
          threadId: thread.id,
          senderId: 'admin_1',
          senderName: 'System Bot',
          text: `🔓 Escrow released! Student ${booking.studentName} confirmed full satisfaction. 90% of rent has been payout-processed to Landlord ${booking.landlordName}'s subaccount. 10% retained by Dormiversity.`,
          createdAt: new Date().toISOString(),
          isBlocked: false
        };
        updatedMessages.push(confirmMsg);
      }

      const updated = {
        ...prev,
        bookings: updatedBookings,
        messages: updatedMessages
      };
      saveState(updated);
      return updated;
    });
  };

  // 9. Open Dispute
  const handleOpenDispute = (bookingId: string, reason: string, evidence: string) => {
    setState(prev => {
      const updatedBookings = prev.bookings.map(b => 
        b.id === bookingId 
          ? { 
              ...b, 
              status: 'DISPUTED' as const, 
              disputeReason: reason, 
              disputeEvidence: evidence 
            } 
          : b
      );

      const booking = prev.bookings.find(bg => bg.id === bookingId)!;

      // Add dispute message to landlord chat line
      const thread = prev.chats.find(c => c.bookingId === bookingId);
      let updatedMessages = [...prev.messages];
      if (thread) {
        const disputeMsg: Message = {
          id: 'msg_' + Date.now(),
          threadId: thread.id,
          senderId: 'admin_1',
          senderName: 'System Bot',
          text: `⚖️ ESCROW DISPUTE LAUNCHED: Tenant filed a dispute regarding room conditions: "${reason}". Funds are completely frozen. Dormiversity administrative support will review structural reports and arbitrate.`,
          createdAt: new Date().toISOString(),
          isBlocked: false
        };
        updatedMessages.push(disputeMsg);
      }

      const updated = {
        ...prev,
        bookings: updatedBookings,
        messages: updatedMessages
      };
      saveState(updated);
      return updated;
    });
  };

  // 10. Admin Resolves Escrow Dispute
  const handleResolveDispute = (bookingId: string, action: 'RELEASE' | 'REFUND') => {
    setState(prev => {
      const resolvedStatus = action === 'RELEASE' ? ('RELEASED' as const) : ('REFUNDED' as const);
      
      const updatedBookings = prev.bookings.map(b => 
        b.id === bookingId 
          ? { 
              ...b, 
              status: resolvedStatus, 
              disputeResolvedAt: new Date().toISOString(),
              disputeResolutionNotes: `Arbitrated by System Admin. Action: ${action}`
            } 
          : b
      );

      const booking = prev.bookings.find(bg => bg.id === bookingId)!;
      
      // If refunded, mark hostel as available again
      let updatedHostels = prev.hostels;
      if (action === 'REFUND') {
        updatedHostels = prev.hostels.map(h => 
          h.id === booking.hostelId ? { ...h, isAvailable: true } : h
        );
      }

      const thread = prev.chats.find(c => c.bookingId === bookingId);
      let updatedMessages = [...prev.messages];
      if (thread) {
        const resolutionMsg: Message = {
          id: 'msg_' + Date.now(),
          threadId: thread.id,
          senderId: 'admin_1',
          senderName: 'System Bot',
          text: `⚖️ DISPUTE RESOLVED BY ADMIN: After reviewing inspection reports and structural checklists, Admin has ordered a ${
            action === 'RELEASE' 
              ? 'RELEASE of rent funds (90%) to Landlord' 
              : 'FULL REFUND (100%) to Student'
          }.`,
          createdAt: new Date().toISOString(),
          isBlocked: false
        };
        updatedMessages.push(resolutionMsg);
      }

      const updated = {
        ...prev,
        bookings: updatedBookings,
        hostels: updatedHostels,
        messages: updatedMessages
      };
      saveState(updated);
      return updated;
    });
  };

  // 11. Profile KYC Upgrading
  const handleUploadKYC = (details: any) => {
    setState(prev => {
      const updatedUsers = prev.users.map(u => 
        u.id === prev.activeUserId 
          ? { ...u, kycStatus: 'PENDING' as const, kycDetails: details } 
          : u
      );
      
      const updated = {
        ...prev,
        users: updatedUsers
      };
      saveState(updated);
      return updated;
    });
  };

  const handleUploadStudentKYC = (idType: string, idNumber: string) => {
    setState(prev => {
      const updatedUsers = prev.users.map(u => 
        u.id === prev.activeUserId 
          ? { 
              ...u, 
              kycStatus: 'APPROVED' as const, // Auto approve student KYC in prototype to save effort
              kycDetails: {
                idType,
                idNumber,
                idImage: 'Student_Card_Ayomide.png',
                proofDoc: 'School_Fees_Receipt.pdf'
              }
            } 
          : u
      );
      
      const updated = {
        ...prev,
        users: updatedUsers
      };
      saveState(updated);
      return updated;
    });
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setState(prev => {
      const updatedUsers = prev.users.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      );
      const updated = {
        ...prev,
        users: updatedUsers
      };
      saveState(updated);
      return updated;
    });
  };

  const handleDeleteAccount = (userId: string) => {
    setState(prev => {
      const updatedUsers = prev.users.filter(u => u.id !== userId);
      const firstRemainingUser = updatedUsers[0];
      const updated = {
        ...prev,
        users: updatedUsers,
        activeUserId: firstRemainingUser ? firstRemainingUser.id : ''
      };
      saveState(updated);
      if (!firstRemainingUser) {
        setIsLoggedIn(false);
      } else {
        // If there's another user, switch to them, or log out if none
        setIsLoggedIn(false);
      }
      return updated;
    });
    setActiveTab('landing');
  };

  // 12. Admin Audits KYC Uploads
  const handleApproveUserKYC = (userId: string) => {
    setState(prev => {
      const updatedUsers = prev.users.map(u => 
        u.id === userId ? { ...u, kycStatus: 'APPROVED' as const } : u
      );
      const updated = {
        ...prev,
        users: updatedUsers
      };
      saveState(updated);
      return updated;
    });
  };

  const handleRejectUserKYC = (userId: string, reason: string) => {
    setState(prev => {
      const updatedUsers = prev.users.map(u => 
        u.id === userId 
          ? { 
              ...u, 
              kycStatus: 'REJECTED' as const, 
              kycDetails: { 
                ...u.kycDetails!, 
                rejectionReason: reason 
              } 
            } 
          : u
      );
      const updated = {
        ...prev,
        users: updatedUsers
      };
      saveState(updated);
      return updated;
    });
  };

  // 13. Landlord Adds Listing
  const handleAddListing = (listingDetails: any) => {
    const newHostelId = 'hostel_' + Date.now();
    const newHostel: Hostel = {
      id: newHostelId,
      landlordId: activeUser.id,
      landlordName: activeUser.name,
      ...listingDetails,
      reviewsCount: 0,
      rating: 5.0
    };

    setState(prev => {
      const updated = {
        ...prev,
        hostels: [newHostel, ...prev.hostels]
      };
      saveState(updated);
      return updated;
    });
  };

  const handleToggleListingAvailable = (hostelId: string) => {
    setState(prev => {
      const updatedHostels = prev.hostels.map(h => 
        h.id === hostelId ? { ...h, isAvailable: !h.isAvailable } : h
      );
      const updated = {
        ...prev,
        hostels: updatedHostels
      };
      saveState(updated);
      return updated;
    });
  };

  // 14. Admin Adds School target
  const handleAddSchool = (schoolDetails: any) => {
    const newSchoolId = 'school_' + Date.now();
    const newSchool: School = {
      id: newSchoolId,
      ...schoolDetails
    };

    setState(prev => {
      const updated = {
        ...prev,
        schools: [...prev.schools, newSchool]
      };
      saveState(updated);
      return updated;
    });
  };

  const handleDeleteSchool = (schoolId: string) => {
    setState(prev => {
      const updated = {
        ...prev,
        schools: prev.schools.filter(s => s.id !== schoolId)
      };
      saveState(updated);
      return updated;
    });
  };

  // 15. Roommates Post Matcher actions
  const handleCreateCohabitantPost = (postDetails: any) => {
    const newPostId = 'post_' + Date.now();
    const newPost: CohabitantPost = {
      id: newPostId,
      studentId: activeUser.id,
      studentName: activeUser.name,
      studentPhoto: activeUser.profilePicture,
      isClosed: false,
      createdAt: new Date().toISOString(),
      ...postDetails
    };

    setState(prev => {
      const updated = {
        ...prev,
        cohabitants: [newPost, ...prev.cohabitants]
      };
      saveState(updated);
      return updated;
    });
  };

  const handleCloseCohabitantPost = (postId: string) => {
    setState(prev => {
      const updatedPosts = prev.cohabitants.filter(p => p.id !== postId); // Delete or close
      const updated = {
        ...prev,
        cohabitants: updatedPosts
      };
      saveState(updated);
      return updated;
    });
  };

  // 16. Send Chat Message (With Server-Grade Scanners)
  const handleSendMessage = (threadId: string, text: string) => {
    const filterResult = checkMessageContactSharing(text);

    const newMsgId = 'msg_' + Date.now();
    const newMessage: Message = {
      id: newMsgId,
      threadId: threadId,
      senderId: activeUser.id,
      senderName: activeUser.name,
      text: text,
      createdAt: new Date().toISOString(),
      isBlocked: filterResult.isBlocked,
      blockedReason: filterResult.isBlocked ? filterResult.reason : undefined
    };

    setState(prev => {
      // Find chat thread to update summary
      const updatedChats = prev.chats.map(chat => 
        chat.id === threadId 
          ? { 
              ...chat, 
              lastMessageText: filterResult.isBlocked ? '[Blocked: Contact attempted]' : text,
              lastMessageTime: new Date().toISOString(),
              isFlaggedByAdmin: chat.isFlaggedByAdmin || filterResult.isBlocked // Flag for Admin Review
            } 
          : chat
      );

      const updated = {
        ...prev,
        messages: [...prev.messages, newMessage],
        chats: updatedChats
      };
      saveState(updated);
      return updated;
    });

    if (filterResult.isBlocked) {
      return { success: false, error: filterResult.reason };
    }

    return { success: true };
  };

  // Navigation to secure chat
  const handleNavigateToChat = (otherId: string, hostelId?: string, bookingId?: string) => {
    const otherUser = state.users.find(u => u.id === otherId)!;
    
    // Find or create a thread in a direction-independent manner to prevent duplication
    let existingThread = state.chats.find(c => 
      ((c.studentId === activeUser.id && c.otherId === otherId) ||
       (c.studentId === otherId && c.otherId === activeUser.id)) &&
      (!hostelId || c.hostelId === hostelId)
    );
    
    if (!existingThread) {
      const newThreadId = 'thread_' + Date.now();
      const newThread: ChatThread = {
        id: newThreadId,
        studentId: activeUser.role === 'STUDENT' ? activeUser.id : otherId,
        otherId: activeUser.role === 'STUDENT' ? otherId : activeUser.id,
        otherName: otherUser.name,
        otherRole: otherUser.role,
        hostelId: hostelId,
        hostelName: hostelId ? state.hostels.find(h => h.id === hostelId)?.name : undefined,
        bookingId: bookingId,
        lastMessageText: 'Secure connection opened.',
        lastMessageTime: new Date().toISOString(),
        isFlaggedByAdmin: false
      };
      
      setState(prev => {
        const updated = {
          ...prev,
          chats: [newThread, ...prev.chats]
        };
        saveState(updated);
        return updated;
      });
      existingThread = newThread;
    }
    
    setSelectedChatThreadId(existingThread.id);
    setActiveTab('chat');
  };

  // Unread message indicator count
  const unreadMessagesCount = state.messages.filter(m => m.senderId !== activeUser.id && m.isBlocked === false && state.chats.some(c => c.id === m.threadId && (c.studentId === activeUser.id || c.otherId === activeUser.id))).length % 3;

  // Render check for gated administrative portal
  if (currentPath === '/dormiversity-control-90') {
    return (
      <AdminLogin onSuccess={(token) => {
        sessionStorage.setItem('dormiversity_admin_token', token);
        setAdminToken(token);
        setIsAdminVerified(true);
        window.history.pushState({}, '', '/admin/dashboard');
      }} />
    );
  }

  if (currentPath === '/admin/dashboard') {
    if (!isAdminVerified) {
      return (
        <div className="min-h-screen bg-wood-950 flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden font-sans">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
          
          <div className="max-w-md w-full bg-wood-900 border border-wood-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
              <Shield size={32} />
            </div>
            <div className="space-y-2">
              <h1 className="font-display font-bold text-xl text-white">Administrative Vault Locked</h1>
              <p className="text-xs text-wood-400">Your session token is missing, invalid, or expired. You must authenticate to access state control records.</p>
            </div>
            
            <div className="pt-4 space-y-3">
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/dormiversity-control-90');
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-wood-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer uppercase tracking-wider font-sans"
              >
                Authenticate at System Console
              </button>
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/');
                }}
                className="w-full py-3 bg-transparent hover:bg-wood-800 border border-wood-850 text-wood-400 hover:text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                Return to Landing Page
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="bg-wood-50 min-h-screen font-sans">
      {currentPath === '/terms' ? (
        <TermsPage onBack={() => {
          window.history.pushState({}, '', '/');
        }} />
      ) : !isLoggedIn ? (
        currentPath === '/signup' ? (
          <SignUpPage
            schools={state.schools}
            onSignUp={handleSignUp}
            onNavigateToLanding={() => window.history.pushState({}, '', '/')}
          />
        ) : currentPath === '/signin' ? (
          <SignInPage
            users={state.users}
            onSignIn={(role, userId) => {
              handleSelectRoleFromLanding(role, userId);
              window.history.pushState({}, '', '/');
            }}
            onNavigateToLanding={() => window.history.pushState({}, '', '/')}
          />
        ) : (
          <LandingPage
            schools={state.schools}
            users={state.users}
            onSelectRole={handleSelectRoleFromLanding}
            onSearchSchool={handleSearchSchoolFromLanding}
          />
        )
      ) : (
        <>
          <Navigation
            activeUser={activeUser}
            allUsers={state.users}
            currentRole={activeUser.role}
            onSwitchUser={handleSwitchUser}
            onNavigate={setActiveTab}
            activeTab={activeTab}
            onLogout={handleLogout}
            unreadMessagesCount={unreadMessagesCount}
          />

          <main className="transition-all duration-200">
            {['dashboard', 'roommates', 'bookings', 'profile', 'bookmarks'].includes(activeTab) && activeUser.role === 'STUDENT' && (
              <StudentDashboard
                activeStudent={activeUser}
                schools={state.schools}
                hostels={state.hostels}
                bookings={state.bookings}
                jobs={state.jobs}
                cohabitants={state.cohabitants}
                bookmarks={state.bookmarks}
                onToggleBookmark={handleToggleBookmark}
                onBookHostel={handleBookHostel}
                onRequestInspection={handleRequestInspection}
                onConfirmSatisfaction={handleConfirmSatisfaction}
                onOpenDispute={handleOpenDispute}
                onNavigateToChat={handleNavigateToChat}
                onCreateCohabitantPost={handleCreateCohabitantPost}
                onCloseCohabitantPost={handleCloseCohabitantPost}
                onUploadStudentKYC={handleUploadStudentKYC}
                onUpdateProfile={handleUpdateProfile}
                onDeleteAccount={handleDeleteAccount}
                initialSubTab={
                  activeTab === 'profile' ? 'profile' :
                  activeTab === 'bookings' ? 'bookings' :
                  activeTab === 'roommates' ? 'roommates' :
                  activeTab === 'bookmarks' ? 'bookmarks' : 'search'
                }
              />
            )}

            {['dashboard', 'bookings', 'profile', 'payouts', 'verification'].includes(activeTab) && activeUser.role === 'LANDLORD' && (
              <LandlordDashboard
                activeLandlord={activeUser}
                schools={state.schools}
                hostels={state.hostels}
                bookings={state.bookings}
                jobs={state.jobs}
                onUploadKYC={handleUploadKYC}
                onAddListing={handleAddListing}
                onToggleListingAvailable={handleToggleListingAvailable}
                onNavigateToChat={handleNavigateToChat}
                onUpdateProfile={handleUpdateProfile}
                onDeleteAccount={handleDeleteAccount}
                initialSubTab={
                  activeTab === 'profile' ? 'profile' :
                  activeTab === 'bookings' ? 'escrows' :
                  activeTab === 'payouts' ? 'payouts' :
                  activeTab === 'verification' ? 'verification' : 'listings'
                }
              />
            )}

            {['dashboard', 'profile'].includes(activeTab) && activeUser.role === 'INSPECTOR' && (
              <InspectorDashboard
                activeInspector={activeUser}
                schools={state.schools}
                jobs={state.jobs}
                onUploadKYC={handleUploadKYC}
                onAcceptJob={handleAcceptJob}
                onSubmitReport={handleSubmitReport}
                onUpdateProfile={handleUpdateProfile}
                onDeleteAccount={handleDeleteAccount}
                initialSubTab={activeTab === 'profile' ? 'profile' : 'available'}
              />
            )}

            {activeTab === 'dashboard' && activeUser.role === 'ADMIN' && (
              <AdminDashboard
                schools={state.schools}
                users={state.users}
                bookings={state.bookings}
                jobs={state.jobs}
                messages={state.messages}
                adminToken={adminToken}
                onApproveUserKYC={handleApproveUserKYC}
                onRejectUserKYC={handleRejectUserKYC}
                onResolveDispute={handleResolveDispute}
                onDeleteSchool={handleDeleteSchool}
              />
            )}

            {activeTab === 'chat' && (
              <ChatInbox
                activeUser={activeUser}
                threads={state.chats}
                messages={state.messages}
                onSendMessage={handleSendMessage}
                selectedThreadId={selectedChatThreadId}
                onSelectThread={setSelectedChatThreadId}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}
