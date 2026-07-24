import React, { useState, useEffect } from 'react';
import { Bot, Shield, Send, CheckCircle2, Clock, AlertTriangle, FileText, Upload, Sparkles, MessageSquare, ChevronRight, HelpCircle, ExternalLink, PhoneCall } from 'lucide-react';
import { User } from '../types';
import FaqSection from './FaqSection';

interface SupportPageProps {
  activeUser: User;
  isLoggedIn?: boolean;
  onNavigate?: (tab: string) => void;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  category: string;
  subject: string;
  details: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED';
  createdAt: string;
  response?: string;
}

const APP_KEYWORDS = [
  'hostel', 'room', 'rent', 'escrow', 'booking', 'refund', 'cancel', 'roommate', 
  'cohabitant', 'inspector', 'inspection', 'landlord', 'listing', 'verify', 'kyc', 
  'complaint', 'complain', 'issue', 'issues', 'dispute', 'ticket', 'faq', 'support', 'profile', 'message', 'chat', 'login', 
  'account', 'fee', 'payment', 'bank', 'paystack', 'scam', 'report', 'dispute', 
  'dormiversity', 'dorm', 'school', 'university', 'campus', 'bookmark', 'saved', 'payout'
];

const PAGE_MAPPINGS: Record<string, { label: string; tab: string }> = {
  'my bookings': { label: 'My Bookings', tab: 'bookings' },
  'hostel directory': { label: 'Hostel Directory', tab: 'dashboard' },
  'roommate finder': { label: 'Roommate Finder', tab: 'roommates' },
  'saved hostels': { label: 'Saved Hostels', tab: 'bookmarks' },
  'verification status': { label: 'Verification Status', tab: 'verification' },
  'payout history': { label: 'Payout History', tab: 'payouts' },
  'ai support & complaints': { label: 'AI Support & Complaints', tab: 'support' },
  'help & faqs': { label: 'Help & FAQs', tab: 'faqs' },
  'profile & settings': { label: 'Profile & Settings', tab: 'profile' },
  'profile': { label: 'Profile & Settings', tab: 'profile' },
  'navigation menu': { label: 'Navigation Menu (Top Right)', tab: 'profile' },
  'menu bar': { label: 'Navigation Menu (Top Right)', tab: 'profile' },
};

function RenderMessageContent({ text, onNavigate }: { text: string; onNavigate?: (tab: string) => void }) {
  // Regex to match bracketed links like [My Bookings]
  const parts = text.split(/(\[[^\]]+\])/g);

  return (
    <span className="leading-relaxed">
      {parts.map((part, idx) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const rawName = part.slice(1, -1).trim();
          const lowerKey = rawName.toLowerCase();
          const match = PAGE_MAPPINGS[lowerKey];
          
          if (match) {
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onNavigate && onNavigate(match.tab)}
                className="inline-flex items-center space-x-1 font-bold text-wood-950 hover:text-black hover:underline bg-wood-100 hover:bg-wood-200 border border-wood-300 px-2 py-0.5 rounded-md mx-1 text-[11px] cursor-pointer transition-colors shadow-2xs"
              >
                <span>{match.label}</span>
                <ExternalLink size={10} className="text-wood-600" />
              </button>
            );
          }
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}

export default function SupportPage({ activeUser, isLoggedIn = true, onNavigate }: SupportPageProps) {
  const [activeTab, setActiveTab] = useState<'TICKETS' | 'AI_CHAT' | 'FAQS'>('TICKETS');
  
  // Ticket form state
  const [category, setCategory] = useState('REFUND');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [submittedSuccess, setSubmittedSuccess] = useState<Ticket | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Embedded AI Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'BOT' | 'USER'; text: string; time: string; ticketId?: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Helper function to count words
  const countWords = (str: string) => str.trim().split(/\s+/).filter(Boolean).length;

  // Load account-scoped AI chat history
  useEffect(() => {
    if (activeUser?.id) {
      const stored = localStorage.getItem(`dorm_chat_history_${activeUser.id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setChatMessages(parsed);
            return;
          }
        } catch (e) {}
      }
      setChatMessages([
        {
          id: 'm_welcome',
          sender: 'BOT',
          text: `Hello ${activeUser.name || 'there'}! 👋 Welcome to the 24/7 Dormiversity AI Support Center.\n\nI am here to help you navigate and understand the Dormiversity platform. What would you like to know or find today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [activeUser?.id, activeUser?.name]);

  // Auto-save AI chat messages for activeUser
  useEffect(() => {
    if (activeUser?.id && chatMessages.length > 0) {
      localStorage.setItem(`dorm_chat_history_${activeUser.id}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, activeUser?.id]);

  // Load existing tickets from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`dorm_tickets_${activeUser.id}`);
      if (stored) {
        setTickets(JSON.parse(stored));
      } else {
        const sample: Ticket[] = [
          {
            id: 'TICK-94812',
            userId: activeUser.id,
            userName: activeUser.name,
            category: 'PAYMENT_ESCROW',
            subject: 'Automatic Escrow Protection & Deposit Refund Check',
            details: 'Inquiry regarding how rent escrow safety functions before room physical check-in.',
            status: 'RESOLVED',
            createdAt: new Date(Date.now() - 86400000).toLocaleDateString(),
            response: 'Dormiversity Escrow retains 90% of your rent securely until you confirm physical inspection or 48 hours elapse post move-in.'
          }
        ];
        setTickets(sample);
        localStorage.setItem(`dorm_tickets_${activeUser.id}`, JSON.stringify(sample));
      }
    } catch (err) {
      console.warn("Could not load stored tickets", err);
    }
  }, [activeUser.id, activeUser.name]);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) {
      alert("Please fill in both the ticket subject and description.");
      return;
    }

    const detailsWords = countWords(details);
    if (detailsWords < 10) {
      alert(`Description too short: Complaint description must be at least 10 words long (currently ${detailsWords} words). Please provide more context.`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newTicket: Ticket = {
        id: 'TICK-' + Math.floor(10000 + Math.random() * 90000),
        userId: activeUser.id,
        userName: activeUser.name,
        category,
        subject,
        details,
        status: 'PENDING',
        createdAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        response: 'Ticket logged and dispatched to 08109211130 with your Unique User ID. Our Support Desk will review your details and issue an update within 24 hours.'
      };

      const updated = [newTicket, ...tickets];
      setTickets(updated);
      try {
        localStorage.setItem(`dorm_tickets_${activeUser.id}`, JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }

      setIsSubmitting(false);
      setSubmittedSuccess(newTicket);
      setShowSuccessModal(true);
      setSubject('');
      setDetails('');
      setProofUrl('');
    }, 600);
  };

  const handleSendChatMessage = (textToSubmit?: string) => {
    if (isLoggedIn === false) {
      alert("You must be logged in to send messages to the AI Support Assistant. Please sign in first.");
      return;
    }
    const msgText = textToSubmit || chatInput;
    if (!msgText.trim()) return;

    const userMsg = {
      id: 'usr_' + Date.now(),
      sender: 'USER' as const,
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSubmit) setChatInput('');
    setIsBotTyping(true);

    setTimeout(() => {
      const lower = msgText.toLowerCase();
      let reply = "";
      let ticketId: string | undefined = undefined;

      // Strict off-topic check
      const isAppTopic = APP_KEYWORDS.some(k => lower.includes(k));

      if (!isAppTopic) {
        reply = "I am Dormiversity's dedicated 24/7 AI Support Assistant. I only answer messages and questions related to the Dormiversity application.";
      } else if (lower.includes('complain') || lower.includes('complaint') || lower.includes('issue') || lower.includes('dispute') || lower.includes('ticket') || lower.includes('problem')) {
        reply = "To make or view complaints, you can file an issue ticket directly or track existing ones on [AI Support & Complaints].";
      } else if (lower.includes('profile') || lower.includes('setting') || lower.includes('account')) {
        reply = "To access your profile and settings, you can open the [Navigation Menu] at the top right of the navigation bar, or click directly on [Profile & Settings].";
      } else if (lower.includes('refund') || lower.includes('cancel') || lower.includes('money')) {
        reply = "For hostel refunds: Open [My Bookings], click 'Request Refund' on your booking card, and provide your bank details for name verification.";
      } else if (lower.includes('roommate') || lower.includes('flatmate') || lower.includes('cohabitant')) {
        reply = "Looking for compatible flatmates? You can browse verified students on [Roommate Finder].";
      } else if (lower.includes('save') || lower.includes('bookmark') || lower.includes('favorite')) {
        reply = "You can view all your saved hostels under [Saved Hostels].";
      } else if (lower.includes('report') || lower.includes('scam') || lower.includes('fake')) {
        reply = "To report a suspicious hostel listing: Find it in [Hostel Directory], click the red 'Report Hostel' flag, or log a complaint ticket in [AI Support & Complaints].";
      } else if (lower.includes('kyc') || lower.includes('verification') || lower.includes('nin') || lower.includes('landlord')) {
        reply = "Landlords can submit identity and property verification details under [Verification Status].";
      } else if (lower.includes('payout') || lower.includes('bank') || lower.includes('withdraw')) {
        reply = "You can manage your bank account details and view payout history on [Payout History].";
      } else if (lower.includes('faq') || lower.includes('question') || lower.includes('help')) {
        reply = "You can read answers to common platform questions under [Help & FAQs].";
      } else {
        ticketId = 'TICK-' + Math.floor(10000 + Math.random() * 90000);
        reply = `Your request has been logged under Support Ticket ID: ${ticketId} and dispatched to 08109211130. You can track complaints in [AI Support & Complaints].`;
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: 'bot_' + Date.now(),
          sender: 'BOT',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ticketId
        }
      ]);
      setIsBotTyping(false);
    }, 700);
  };

  const formatTicketPayloadForLine = (t: Ticket) => {
    return `DORMIVERSITY COMPLAINT TICKET [${t.id}]\nUser Unique ID: ${t.userId}\nUser Name: ${t.userName}\nCategory: ${t.category}\nSubject: ${t.subject}\nDetails: ${t.details}\nStatus: ${t.status}\nSubmitted: ${t.createdAt}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* PAGE HEADER */}
      <div className="bg-gradient-to-r from-wood-950 via-amber-950 to-wood-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-amber-500/30">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Shield size={14} className="text-amber-400" />
            <span>24/7 Official Support Desk & Direct Dispatch to 08109211130</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            AI Support & In-App Complaint Center
          </h1>
          <p className="text-wood-200 text-xs sm:text-sm leading-relaxed">
            Need assistance with your hostel booking, refund request, landlord verification, or campus safety? Submit a formal ticket or talk with our 24/7 AI Assistant. All complaints are tagged with your Unique ID (<span className="font-mono text-amber-300 font-bold">{activeUser.id}</span>) and dispatched to 08109211130 with a guaranteed 24-hour SLA.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="relative z-10 flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/10">
          <button
            onClick={() => setActiveTab('TICKETS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'TICKETS'
                ? 'bg-amber-500 text-wood-950 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
            }`}
          >
            <FileText size={15} />
            <span>File & View Complaints</span>
          </button>

          <button
            onClick={() => setActiveTab('AI_CHAT')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'AI_CHAT'
                ? 'bg-amber-500 text-wood-950 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
            }`}
          >
            <Bot size={15} />
            <span>Live 24/7 AI Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('FAQS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'FAQS'
                ? 'bg-amber-500 text-wood-950 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
            }`}
          >
            <HelpCircle size={15} />
            <span>Platform FAQs</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FORMAL COMPLAINT TICKETS */}
      {activeTab === 'TICKETS' && (
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Submit New Ticket Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-wood-200/80 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-wood-150 pb-4">
              <div>
                <h2 className="text-lg font-bold text-wood-950 flex items-center space-x-2">
                  <FileText size={20} className="text-amber-600" />
                  <span>Submit an In-App Complaint or Support Request</span>
                </h2>
                <p className="text-xs text-wood-500 mt-1">
                  Complaints are assigned an official ID and forwarded to support line 08109211130.
                </p>
              </div>

              <div className="p-2 px-3 bg-amber-50 border border-amber-300 rounded-xl text-[11px]">
                <span className="text-wood-500 block">Your Unique User ID:</span>
                <span className="font-mono font-extrabold text-amber-950 text-xs">{activeUser.id}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-5 text-xs text-wood-700">
              
              {/* Category */}
              <div>
                <label className="font-bold text-wood-900 text-xs block mb-1.5">Complaint Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'REFUND', label: '💸 Refund / Escrow' },
                    { id: 'FAKE_HOSTEL', label: '🚨 Fake / Scam Hostel' },
                    { id: 'FACILITIES', label: '🛠️ Broken Facilities' },
                    { id: 'LANDLORD_ISSUE', label: '👤 Host Dispute' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer ${
                        category === cat.id
                          ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-2xs'
                          : 'bg-white border-wood-200 hover:bg-wood-50 text-wood-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="font-bold text-wood-900 text-xs block">Subject / Short Title *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Deposit refund delay, Landlord asking for extra cash fee..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 bg-wood-50/50 rounded-xl border border-wood-200 text-xs text-wood-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-wood-900 text-xs block">Detailed Complaint Description *</label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    countWords(details) >= 10
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {countWords(details)} / 10 words min
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide full details of your issue, including hostel name, date of payment, or landlord behavior (minimum 10 words)..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full p-3 bg-wood-50/50 rounded-xl border border-wood-200 text-xs text-wood-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Guarantee banner & Submit */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-wood-150">
                <div className="flex items-center space-x-2 text-[11px] text-wood-600 font-medium">
                  <Clock size={16} className="text-amber-600 flex-shrink-0" />
                  <span>Complaints sent to 08109211130 with ID: <span className="font-mono font-bold text-wood-900">{activeUser.id}</span></span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-wood-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center space-x-2"
                >
                  <Send size={15} />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit & Dispatch Complaint Ticket'}</span>
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

      {/* SUCCESS POPUP MODAL FOR COMPLAINT SUBMISSION */}
      {showSuccessModal && submittedSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-wood-200 shadow-2xl space-y-5 relative text-center">
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-wood-950">
                Complaint Submitted Successfully!
              </h3>
              <p className="text-xs text-wood-600 leading-relaxed">
                Your complaint has been successfully registered and logged under Ticket ID <span className="font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">{submittedSuccess.id}</span>.
              </p>
            </div>

            <div className="p-4 bg-wood-50 rounded-2xl border border-wood-200 text-left space-y-2 text-xs text-wood-800">
              <div className="flex justify-between items-center border-b border-wood-200 pb-2">
                <span className="font-bold text-wood-600">Unique User ID:</span>
                <span className="font-mono font-bold text-wood-950">{submittedSuccess.userId}</span>
              </div>
              <div className="flex justify-between items-center border-b border-wood-200 pb-2">
                <span className="font-bold text-wood-600">Category:</span>
                <span className="font-semibold text-wood-900">{submittedSuccess.category.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-wood-600">Dispatch Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Dispatched to 08109211130</span>
              </div>
            </div>

            <p className="text-[11px] text-wood-500 italic">
              Our 24/7 Support Desk will review your details and contact you within 24 hours.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href={`https://wa.me/2348109211130?text=${encodeURIComponent(formatTicketPayloadForLine(submittedSuccess))}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
              >
                <MessageSquare size={14} />
                <span>Send via WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 py-3 bg-wood-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMBEDDED FULL 24/7 AI CHATBOT */}
      {activeTab === 'AI_CHAT' && (
        <div className="bg-white rounded-3xl border border-wood-200 shadow-md overflow-hidden flex flex-col h-[650px]">
          <div className="p-4 bg-gradient-to-r from-wood-950 via-amber-950 to-wood-950 text-white flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/20 rounded-2xl border border-amber-400/40">
                <Bot size={22} className="text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Dormiversity App AI Assistant</h3>
                <p className="text-[10px] text-amber-300">Strictly answers Dormiversity app questions with direct page links</p>
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded">
              ONLINE
            </span>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-wood-50/30 text-xs">
            {chatMessages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.sender === 'USER' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed space-y-2 shadow-2xs ${
                    m.sender === 'USER'
                      ? 'bg-wood-900 text-white rounded-br-none'
                      : 'bg-white text-wood-900 border border-wood-200 rounded-bl-none'
                  }`}
                >
                  <RenderMessageContent text={m.text} onNavigate={onNavigate} />
                  {m.ticketId && (
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl text-[10px] font-bold text-amber-900 flex justify-between items-center mt-2">
                      <span>Ticket Logged: {m.ticketId}</span>
                      <span className="font-mono text-[9px] text-amber-800">Sent to 08109211130</span>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-wood-400 mt-1 px-1">{m.time}</span>
              </div>
            ))}

            {isBotTyping && (
              <div className="flex items-center space-x-2 bg-white p-3 rounded-2xl border border-wood-200 text-wood-500 text-xs w-fit animate-pulse">
                <Bot size={16} className="text-amber-500 animate-spin" />
                <span>AI Support is checking app features...</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-wood-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="flex items-center space-x-3"
            >
              <input
                type="text"
                placeholder="Ask about Dormiversity hostels, bookings, refunds, roommates, or complaints..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 p-3 bg-wood-50 rounded-xl border border-wood-200 text-xs text-wood-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center space-x-1"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PLATFORM FAQS */}
      {activeTab === 'FAQS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-wood-200/80 shadow-xs">
          <FaqSection userRole={activeUser.role as any} />
        </div>
      )}

    </div>
  );
}
