import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon, Shield, Sparkles, ExternalLink, PhoneCall, CheckCircle2, AlertCircle, Clock, RefreshCw } from 'lucide-react';

import { User } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'BOT' | 'USER';
  text: string;
  timestamp: string;
  ticketId?: string;
}

interface CustomerCareChatbotProps {
  activeUser?: User;
  isLoggedIn?: boolean;
  onNavigate?: (tab: string) => void;
  onOpenSignIn?: () => void;
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

function RenderChatMessage({ text, onNavigate }: { text: string; onNavigate?: (tab: string) => void }) {
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

export default function CustomerCareChatbot({ activeUser, isLoggedIn, onNavigate, onOpenSignIn }: CustomerCareChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync / Load account-scoped chat history
  useEffect(() => {
    if (isLoggedIn && activeUser?.id) {
      const key = `dorm_chat_history_${activeUser.id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        } catch (e) {}
      }
      setMessages([
        {
          id: 'm_welcome',
          sender: 'BOT',
          text: `Hello ${activeUser.name || 'there'}! 👋 Welcome to the 24/7 Dormiversity AI Support Assistant.\n\nI am here to help you navigate and understand the Dormiversity platform. What would you like to know or find today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      setMessages([
        {
          id: 'm_welcome_guest',
          sender: 'BOT',
          text: "Hello! 👋 Welcome to Dormiversity 24/7 Support. Please sign in to send messages and save your chat history with our AI Support Assistant.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [activeUser?.id, isLoggedIn]);

  // Auto-save chat history for active user
  useEffect(() => {
    if (isLoggedIn && activeUser?.id && messages.length > 0) {
      localStorage.setItem(`dorm_chat_history_${activeUser.id}`, JSON.stringify(messages));
    }
  }, [messages, activeUser?.id, isLoggedIn]);

  // Position state for movable floating button
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({ startX: 0, startY: 0, posX: 20, posY: 20 });

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Drag handlers for movable widget icon (Touch & Mouse)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragRef.current = { startX: touch.clientX, startY: touch.clientY, posX: position.x, posY: position.y };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = dragRef.current.startX - touch.clientX;
    const dy = dragRef.current.startY - touch.clientY;
    setPosition({
      x: Math.max(10, Math.min(window.innerWidth - 70, dragRef.current.posX + dx)),
      y: Math.max(10, Math.min(window.innerHeight - 70, dragRef.current.posY + dy))
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, posX: position.x, posY: position.y };
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = dragRef.current.startX - e.clientX;
      const dy = dragRef.current.startY - e.clientY;
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 70, dragRef.current.posX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 70, dragRef.current.posY + dy))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleSendMessage = (customText?: string) => {
    if (!isLoggedIn || !activeUser) {
      alert("You must be logged in to send messages to the AI Support Assistant. Please sign in first.");
      if (onOpenSignIn) onOpenSignIn();
      return;
    }

    const query = customText || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'USER',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputText('');
    setIsTyping(true);

    // AI Response Logic
    setTimeout(() => {
      const lower = query.toLowerCase();
      let botResponse = "";
      let ticketId: string | undefined = undefined;

      const isAppTopic = APP_KEYWORDS.some(k => lower.includes(k));

      if (!isAppTopic) {
        botResponse = "I am Dormiversity's dedicated 24/7 AI Support Assistant. I only answer messages and questions related to the Dormiversity application.";
      } else if (lower.includes('complain') || lower.includes('complaint') || lower.includes('issue') || lower.includes('dispute') || lower.includes('ticket') || lower.includes('problem')) {
        botResponse = "To make or view complaints, you can file an issue ticket directly or track existing ones on [AI Support & Complaints].";
      } else if (lower.includes('profile') || lower.includes('setting') || lower.includes('account')) {
        botResponse = "To access your profile and settings, you can open the [Navigation Menu] at the top right of the navigation bar, or click directly on [Profile & Settings].";
      } else if (lower.includes('refund') || lower.includes('money') || lower.includes('cancel')) {
        botResponse = "For hostel refunds: Open [My Bookings], click 'Request Refund' on your booking card, and provide your bank details for name verification.";
      } else if (lower.includes('roommate') || lower.includes('flatmate') || lower.includes('cohabitant')) {
        botResponse = "Looking for compatible flatmates? You can browse verified students on [Roommate Finder].";
      } else if (lower.includes('save') || lower.includes('bookmark') || lower.includes('favorite')) {
        botResponse = "You can view all your saved hostels under [Saved Hostels].";
      } else if (lower.includes('report') || lower.includes('scam') || lower.includes('fake')) {
        botResponse = "To report a suspicious hostel listing: Find it in [Hostel Directory], click the red 'Report Hostel' flag, or log a complaint ticket in [AI Support & Complaints].";
      } else if (lower.includes('kyc') || lower.includes('verification') || lower.includes('nin') || lower.includes('landlord')) {
        botResponse = "Landlords can submit identity and property verification details under [Verification Status].";
      } else if (lower.includes('payout') || lower.includes('bank') || lower.includes('withdraw')) {
        botResponse = "You can manage your bank account details and view payout history on [Payout History].";
      } else if (lower.includes('faq') || lower.includes('help')) {
        botResponse = "You can read answers to common platform questions under [Help & FAQs].";
      } else {
        ticketId = 'TICK-' + Math.floor(10000 + Math.random() * 90000);
        botResponse = `Your request has been logged under Support Ticket ID: ${ticketId} and dispatched to 08109211130. You can track complaints in [AI Support & Complaints].`;
      }

      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'BOT',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ticketId
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* MOVABLE FLOATING CUSTOMER CARE BUTTON (STRICTLY CIRCULAR) */}
      {!isOpen && (
        <div
          style={{ right: `${position.x}px`, bottom: `${position.y}px` }}
          className="fixed z-50 transition-transform active:scale-95 cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 rounded-full bg-gradient-to-r from-wood-900 via-amber-900 to-wood-950 text-white shadow-2xl border-2 border-amber-400/80 flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
            title="Open 24/7 AI Customer Support"
          >
            {/* Pulse Indicator */}
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>

            <Bot size={26} className="text-amber-400 animate-pulse" />
          </button>
        </div>
      )}

      {/* CHATBOT DRAWER / MODAL */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:max-w-md h-[550px] max-h-[90vh] bg-white rounded-3xl border border-wood-200 shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
          
          {/* HEADER */}
          <div className="p-4 bg-gradient-to-r from-wood-950 via-amber-950 to-wood-950 text-white flex justify-between items-center border-b border-amber-500/30">
            <div className="flex items-center space-x-3">
              <div className="relative p-2 bg-amber-500/20 rounded-2xl border border-amber-400/40">
                <Bot size={22} className="text-amber-400" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-wood-950 rounded-full" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-white">Dormiversity AI Support</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold px-1.5 py-0.2 rounded">
                    ONLINE 24/7
                  </span>
                </div>
                <p className="text-[10px] text-wood-300 flex items-center gap-1 mt-0.5">
                  <Clock size={10} className="text-amber-400" />
                  <span>Forwarded to support line 08109211130</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* IN-APP NOTICE BANNER */}
          <div className="bg-amber-950 text-amber-100 p-2.5 px-3 text-[10px] flex items-center justify-between border-b border-amber-800">
            <div className="flex items-center space-x-1.5">
              <Shield size={12} className="text-amber-400" />
              <span className="font-bold text-amber-200">App-Specific AI Support Desk:</span>
            </div>
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[8px] border border-amber-400/40">
              08109211130
            </span>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-wood-50/40 text-xs">
            
            {/* Quick Suggestion Chips */}
            <div className="space-y-1.5 mb-3">
              <p className="text-[10px] font-bold text-wood-400 uppercase tracking-wider">Quick Suggestions</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "How to request a refund?",
                  "Report a fake hostel",
                  "Landlord NIN verification",
                  "File complaint ticket"
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSendMessage(chip)}
                    className="bg-white hover:bg-amber-50 text-wood-800 border border-wood-200 hover:border-amber-300 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-2xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'USER' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed space-y-2 shadow-2xs ${
                    m.sender === 'USER'
                      ? 'bg-wood-900 text-white rounded-br-none'
                      : 'bg-white text-wood-900 border border-wood-200 rounded-bl-none'
                  }`}
                >
                  <RenderChatMessage text={m.text} onNavigate={onNavigate} />

                  {/* Ticket Badge if created */}
                  {m.ticketId && (
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl text-[10px] font-bold text-amber-900 flex items-center justify-between mt-1">
                      <span>Ticket ID: {m.ticketId}</span>
                      <span className="bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded text-[9px]">
                        08109211130
                      </span>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-wood-400 mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-1.5 bg-white p-2.5 px-3 rounded-2xl border border-wood-200 text-wood-500 text-[10px] w-fit animate-pulse">
                <Bot size={14} className="text-amber-500 animate-spin" />
                <span>AI Support is checking app features...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM OR LOGIN PROMPT */}
          <div className="p-3 bg-white border-t border-wood-200">
            {isLoggedIn && activeUser ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  placeholder="Type your question or complaint..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 p-2.5 bg-wood-50 rounded-xl border border-wood-200 text-xs text-wood-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center"
                >
                  <Send size={16} />
                </button>
              </form>
            ) : (
              <div className="p-2.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl text-center space-y-2">
                <p className="text-[11px] font-extrabold text-amber-950">
                  🔒 Sign In Required to Chat
                </p>
                <p className="text-[10px] text-wood-600 leading-tight">
                  You cannot send messages until logged into your account.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenSignIn) onOpenSignIn();
                    else if (onNavigate) onNavigate('signin');
                    else window.history.pushState({}, '', '/signin');
                  }}
                  className="w-full py-2 bg-wood-950 hover:bg-black text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                >
                  Sign In / Register Account
                </button>
              </div>
            )}
            <p className="text-[9px] text-wood-500 font-medium text-center mt-1.5">
              Support Desk Line: 08109211130 • 24-Hour Resolution Guarantee
            </p>
          </div>

        </div>
      )}
    </>
  );
}
