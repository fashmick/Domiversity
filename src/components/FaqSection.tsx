import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Search, ShieldCheck, GraduationCap, Building, UserCheck, MessageSquare } from 'lucide-react';

export interface FAQItem {
  id: string;
  category: 'STUDENT' | 'LANDLORD' | 'INSPECTOR' | 'GENERAL';
  question: string;
  answer: string;
  actionText?: string;
  actionTarget?: string;
}

export const FAQ_DATA: FAQItem[] = [
  // STUDENT FAQs
  {
    id: 'faq_s1',
    category: 'STUDENT',
    question: 'How does the 100% Escrow Protection work for students?',
    answer: 'When you book a hostel, your rent payment is deposited into Dormiversity’s secure institutional escrow account powered by Paystack. The landlord receives ₦0 until you physically inspect the room or your 3-day inspection window elapses. If the property differs from listing photos or has critical defects, you can request an instant 100% refund.'
  },
  {
    id: 'faq_s2',
    category: 'STUDENT',
    question: 'How do I request a refund for a hostel booking?',
    answer: 'Go to your Student Dashboard under "My Bookings". Select the booking and click "Request Refund". You will be prompted to enter your 10-digit bank account number and bank name (e.g., Zenith Bank, GTBank). Our system automatically verifies your account name, and your money is refunded back to your bank account after escrow reversal.'
  },
  {
    id: 'faq_s3',
    category: 'STUDENT',
    question: 'What is a Roomly Inspector and why should I hire one?',
    answer: 'If you are currently away from campus or cannot physically inspect the hostel yourself, you can hire a vetted on-campus Roomly Student Inspector for ₦5,000. They will physically visit the hostel, check water taps, test electricity stability, verify room dimensions, and upload photographic reports to your dashboard.'
  },
  {
    id: 'faq_s4',
    category: 'STUDENT',
    question: 'How does the Roommate / Cohabitant finder work?',
    answer: 'You can browse or create cohabitant posts under "Roommate Finder". View student profiles with verified department and budget filters. Note: For safety, direct phone numbers are only unlocked once both students are verified or connected on platform chat.'
  },
  {
    id: 'faq_s5',
    category: 'STUDENT',
    question: 'How can I report a suspicious or fake hostel listing?',
    answer: 'On every hostel card across the app, click the "Report Hostel" flag button. Select your reason (e.g., false photos, overpriced/scam attempt, damaged facilities, safety concerns). Our Safety & Compliance team will investigate and take down fraudulent listings within 24 hours.'
  },

  // LANDLORD FAQs
  {
    id: 'faq_l1',
    category: 'LANDLORD',
    question: 'Why do I need to complete NIN/KYC Verification before listing?',
    answer: 'Dormiversity enforces strict anti-scam student safety protocols. All landlords must submit a government-issued ID (NIN, Driver’s License, or International Passport) and property proof documents. This earns you the "Audited Landlord Badge" and builds total trust with student tenants.'
  },
  {
    id: 'faq_l2',
    category: 'LANDLORD',
    question: 'When and how do I receive my rent payout?',
    answer: 'Rent funds are held securely in escrow during the 3-day student inspection period. Once the student completes physical inspection and clicks "Confirm & Release Escrow", or after 3 days without dispute, the full rent is automatically credited directly to your registered bank account.'
  },
  {
    id: 'faq_l3',
    category: 'LANDLORD',
    question: 'What happens if a student opens a dispute on my property?',
    answer: 'If a student opens a dispute during the 3-day window, escrow funds remain locked while our Admin team reviews the inspection report. If the issue is resolved or rectified, funds are released to you. If the property was falsely represented, funds are refunded to the student.'
  },
  {
    id: 'faq_l4',
    category: 'LANDLORD',
    question: 'Is my draft KYC progress saved if I exit the app?',
    answer: 'Yes! Our multi-step Landlord KYC form features continuous auto-save. You can leave the onboarding form at any step and return anytime without losing your entered ID numbers or document uploads.'
  },

  // INSPECTOR FAQs
  {
    id: 'faq_i1',
    category: 'INSPECTOR',
    question: 'How do I become an accredited on-campus Roomly Inspector?',
    answer: 'To become an inspector, sign up as an Inspector or update your profile to Inspector role. You must complete student student ID verification and present an active campus matriculation number. Once approved by Admin, you will receive nearby inspection assignments.'
  },
  {
    id: 'faq_i2',
    category: 'INSPECTOR',
    question: 'How much do I earn per inspection and how am I paid?',
    answer: 'You earn ₦5,000 per completed physical inspection report. Once you visit the hostel, conduct the structural checklist, and upload photos, the payment is paid directly into your verified bank account (e.g., Zenith Bank).'
  },
  {
    id: 'faq_i3',
    category: 'INSPECTOR',
    question: 'What protocols must I follow during a room inspection?',
    answer: 'Inspectors must verify water availability (borehole/pipe), test power points and bulb sockets, inspect ceiling condition, check security locks/doors, and take clear timestamped photos of the room interior and exterior.'
  },

  // GENERAL FAQs
  {
    id: 'faq_g1',
    category: 'GENERAL',
    question: 'How do I reach Customer Care or submit a complaint?',
    answer: 'You can use the 24/7 AI Customer Support Chat floating icon at the bottom right of your screen, or navigate to the "AI Support & Complaints" page in your navigation menu. All complaints generate an official tracking ticket with a guaranteed response within 24 hours.'
  },
  {
    id: 'faq_g2',
    category: 'GENERAL',
    question: 'Are there any hidden agency or caretaker fees?',
    answer: 'No! Dormiversity eliminates traditional agent commissions and caretaker extortion. Prices listed on the platform are the direct annual rent costs set by verified landlords.'
  }
];

export interface FaqSectionProps {
  initialCategory?: 'STUDENT' | 'LANDLORD' | 'INSPECTOR' | 'ALL';
  userRole?: 'STUDENT' | 'LANDLORD' | 'INSPECTOR' | string;
  compact?: boolean;
}

export default function FaqSection({ initialCategory, userRole, compact = false }: FaqSectionProps) {
  // Role-specific filtering: If logged in as Landlord/Student/Inspector, filter exclusively for that role (+ General)
  const isRoleLocked = !!userRole && ['STUDENT', 'LANDLORD', 'INSPECTOR'].includes(userRole);
  
  const defaultCategory = (
    userRole === 'STUDENT' ? 'STUDENT' : 
    userRole === 'LANDLORD' ? 'LANDLORD' : 
    userRole === 'INSPECTOR' ? 'INSPECTOR' : 
    initialCategory || 'ALL'
  ) as any;

  const [activeCategory, setActiveCategory] = useState<'ALL' | 'STUDENT' | 'LANDLORD' | 'INSPECTOR'>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(FAQ_DATA[0]?.id || null);

  const filteredFaqs = FAQ_DATA.filter(faq => {
    // If role locked, show only role category + general
    if (isRoleLocked) {
      const targetCategory = userRole;
      const matchesRole = faq.category === targetCategory || faq.category === 'GENERAL';
      const matchesQuery = !searchQuery.trim() || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesQuery;
    }

    const matchesCategory = activeCategory === 'ALL' || faq.category === activeCategory || faq.category === 'GENERAL';
    const matchesQuery = !searchQuery.trim() || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className={`w-full ${compact ? 'py-4' : 'py-8 px-4 sm:px-6 max-w-5xl mx-auto'}`}>
      {!compact && (
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs">
            <HelpCircle size={14} className="text-amber-700" />
            <span>
              {userRole === 'LANDLORD' ? 'Landlord Support & Portal FAQs' :
               userRole === 'STUDENT' ? 'Student Support & Housing FAQs' :
               userRole === 'INSPECTOR' ? 'Inspector Vetting & Payout FAQs' :
               'Frequently Asked Questions'}
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-wood-950">
            Got Questions? We Have Answers.
          </h2>
          <p className="text-wood-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about Dormiversity's 100% Escrow, Verified Landlord Auditing, Student Vetting, and Complaint Resolution.
          </p>
        </div>
      )}

      {/* SEARCH BAR & CATEGORY SWITCHER */}
      <div className="space-y-4 mb-8">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wood-400" size={18} />
          <input
            type="text"
            placeholder="Search questions (e.g. refund, escrow, NIN, inspector)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-wood-200 text-xs text-wood-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs placeholder:text-wood-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-wood-400 hover:text-wood-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* CATEGORY TABS (Only shown on Home Page or when not locked to specific user role) */}
        {!isRoleLocked && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'ALL', label: 'All FAQs', icon: HelpCircle },
              { id: 'STUDENT', label: 'For Students', icon: GraduationCap },
              { id: 'LANDLORD', label: 'For Landlords', icon: Building },
              { id: 'INSPECTOR', label: 'For Inspectors', icon: UserCheck }
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-wood-900 text-white shadow-xs'
                      : 'bg-white text-wood-700 border border-wood-200 hover:bg-wood-50'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-amber-400' : 'text-wood-500'} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ACCORDION LIST */}
      {filteredFaqs.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-wood-200 text-center space-y-2 max-w-lg mx-auto shadow-xs">
          <HelpCircle className="mx-auto text-wood-300" size={32} />
          <p className="font-bold text-wood-900 text-sm">No matching questions found</p>
          <p className="text-wood-500 text-xs">Try searching for different terms like "escrow", "refund", or "inspection".</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl mx-auto">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen ? 'border-amber-400 shadow-md ring-1 ring-amber-400/30' : 'border-wood-200/90 shadow-2xs hover:border-amber-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer space-x-3 group"
                >
                  <div className="flex items-center space-x-3 pr-2">
                    <div className="p-2 bg-amber-50 rounded-xl text-amber-800 border border-amber-200/60 flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <span className="inline-block text-[9px] font-extrabold text-amber-900 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 mb-1">
                        {faq.category}
                      </span>
                      <h3 className="font-bold text-wood-950 text-xs sm:text-sm leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-wood-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-amber-600' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 text-xs text-wood-700 leading-relaxed border-t border-wood-100 bg-wood-50/40 space-y-3">
                    <p className="text-wood-800 font-normal">{faq.answer}</p>
                    <div className="pt-2 border-t border-wood-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-wood-500 font-medium">Have an issue or complaint?</span>
                      <span className="text-amber-800 font-bold flex items-center space-x-1">
                        <MessageSquare size={13} />
                        <span>Submit ticket in 24/7 Support Desk</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
