import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Scale, FileText, Printer, Lock, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface TermsPageProps {
  onBack?: () => void;
}

export default function TermsPage({ onBack }: TermsPageProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'dataprotection'>('terms');

  // Detect query param "tab" on mount to set initial active tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'terms' || tabParam === 'privacy' || tabParam === 'dataprotection') {
      setActiveTab(tabParam);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleTabChange = (tab: 'terms' | 'privacy' | 'dataprotection') => {
    setActiveTab(tab);
    // Update query param in URL without forcing page refresh
    const newUrl = `${window.location.pathname}?tab=${tab}`;
    window.history.pushState({}, '', newUrl);
  };

  return (
    <div className="min-h-screen bg-wood-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative Wood Background Rings */}
      <div className="absolute right-0 top-0 opacity-5 font-display font-black text-9xl select-none translate-x-20 -translate-y-10 text-wood-900 pointer-events-none">DORM</div>
      <div className="absolute left-0 bottom-0 opacity-5 font-display font-black text-9xl select-none -translate-x-20 translate-y-10 text-wood-900 pointer-events-none">SECURE</div>

      <div className="max-w-3xl mx-auto w-full relative z-10 bg-white border border-wood-200 shadow-xl rounded-3xl p-6 sm:p-10 animate-fadeIn">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-wood-100 pb-6 mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-wood-500 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md">
              {activeTab === 'terms' && <Scale size={24} />}
              {activeTab === 'privacy' && <Lock size={24} />}
              {activeTab === 'dataprotection' && <ShieldCheck size={24} />}
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl text-wood-950">
                {activeTab === 'terms' && 'Terms of Use'}
                {activeTab === 'privacy' && 'Privacy Policy'}
                {activeTab === 'dataprotection' && 'Data Protection Compliance'}
              </h1>
              <p className="text-xs text-wood-500 font-semibold uppercase tracking-wider">
                {activeTab === 'terms' && 'Dormiversity Platform Agreement'}
                {activeTab === 'privacy' && 'Student & Landlord Privacy Standard'}
                {activeTab === 'dataprotection' && 'NDPR & GDPR Statutory Compliance'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-wood-50 hover:bg-wood-100 text-wood-700 text-xs font-bold rounded-lg border border-wood-200 transition-colors cursor-pointer"
            >
              <Printer size={14} />
              <span>Print/PDF</span>
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-wood-900 hover:bg-wood-950 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Go Back</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex border-b border-wood-100 mb-8 font-sans gap-2 overflow-x-auto">
          <button
            onClick={() => handleTabChange('terms')}
            className={`pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-wood-600 text-wood-950'
                : 'border-transparent text-wood-400 hover:text-wood-600'
            }`}
          >
            Terms of Use
          </button>
          <button
            onClick={() => handleTabChange('privacy')}
            className={`pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-wood-600 text-wood-950'
                : 'border-transparent text-wood-400 hover:text-wood-600'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => handleTabChange('dataprotection')}
            className={`pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dataprotection'
                ? 'border-wood-600 text-wood-950'
                : 'border-transparent text-wood-400 hover:text-wood-600'
            }`}
          >
            Data Protection Compliance
          </button>
        </div>

        {/* Active Content Body */}
        <div className="space-y-6 text-sm text-wood-800 leading-relaxed min-h-[350px]">
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <section className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 flex items-start space-x-3">
                <Shield className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-amber-900 font-medium">
                  <strong>Important Notice:</strong> Dormiversity operates a secure, legally-binding Escrow Housing Protection Service for Nigerian tertiary institutions. By using this portal, all Students, Landlords, and Inspectors agree to be bound by these platform terms.
                </p>
              </section>

              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-bold text-base text-wood-950 flex items-center mb-2">
                    <span className="w-6 h-6 bg-wood-100 text-wood-800 rounded-full flex items-center justify-center text-xs font-bold mr-2">1</span>
                    General Terms &amp; Scope
                  </h3>
                  <p className="pl-8 text-wood-600 text-xs sm:text-sm">
                    Dormiversity acts as an intermediary student hosteling facilitator in Nigeria. We provide a platform for tertiary institution students to discover vetted hostels, communicate with verified landlords, pay rent via secure escrow, and hire certified physical inspectors to eliminate rental scams.
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-wood-950 flex items-center mb-2">
                    <span className="w-6 h-6 bg-wood-100 text-wood-800 rounded-full flex items-center justify-center text-xs font-bold mr-2">2</span>
                    Escrow Guarantee and Payment Flow
                  </h3>
                  <div className="pl-8 space-y-2 text-wood-600 text-xs sm:text-sm">
                    <p>
                      To secure a room, students must complete payment through Dormiversity’s secure portal. Payments are held safely in a non-interest-bearing Escrow housing account.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li><strong>Physical Vetting Period:</strong> From payment receipt, the student has a maximum grace period of <strong>3 days (72 hours)</strong> to confirm the room matches the advertised listings.</li>
                      <li><strong>Release of Funds:</strong> Escrowed rental funds are disbursed to the Landlord’s bank account only when:
                        <ul className="list-[circle] pl-5 mt-1 space-y-1">
                          <li>The student conducts an inspection (within 3 days maximum after payment) and submits satisfaction confirmation, OR</li>
                          <li>A Certified Physical Inspector completes the inspection task showing no defects, and the student approves the report.</li>
                        </ul>
                      </li>
                      <li><strong>Dormiversity Commission:</strong> Service processing fees of <strong>2.5%</strong> are automatically deducted from the landlord's payout to cover security verifications, OTP SMS gateway dispatches, and administrative upkeep.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-wood-950 flex items-center mb-2">
                    <span className="w-6 h-6 bg-wood-100 text-wood-800 rounded-full flex items-center justify-center text-xs font-bold mr-2">3</span>
                    Certified Physical Vetting &amp; Inspector Service
                  </h3>
                  <div className="pl-8 space-y-2 text-wood-600 text-xs sm:text-sm">
                    <p>
                      Students who reside far from their tertiary campus can request the <strong>Roomly Certified Inspector</strong> service for a fee of ₦5,000.
                    </p>
                    <p className="text-xs">
                      Certified Inspectors are independent third-party professionals vetted by Dormiversity. Inspectors must conduct an honest, comprehensive, in-person inspection of the designated hostel premises within <strong>24 hours</strong> of task acceptance, reporting water, electricity, roofing, and safety conditions. Fraudulent inspection reports will result in immediate termination, loss of inspector license, and referral to Nigerian Law Enforcement Agencies.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-wood-950 flex items-center mb-2">
                    <span className="w-6 h-6 bg-wood-100 text-wood-800 rounded-full flex items-center justify-center text-xs font-bold mr-2">4</span>
                    Landlord &amp; Agent Warranties
                  </h3>
                  <div className="pl-8 space-y-2 text-wood-600 text-xs sm:text-sm">
                    <p>
                      Landlords listing hostel accommodations on Dormiversity warrant that:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>They hold legal title or valid sublease/management agency rights to the listed hostel property.</li>
                      <li>The photographs, pricing, proximity descriptions, and amenity indicators are 100% genuine and not misleading.</li>
                      <li>They will not solicit off-platform direct cash payments from Dormiversity registered students. Any landlord caught bypassing escrow will be blacklisted, their KYC canceled, and listed hostels removed permanently.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-wood-950 flex items-center mb-2">
                    <span className="w-6 h-6 bg-wood-100 text-wood-800 rounded-full flex items-center justify-center text-xs font-bold mr-2">5</span>
                    Student Tenant Code of Conduct
                  </h3>
                  <p className="pl-8 text-wood-600 text-xs sm:text-sm">
                    Students agree to maintain respect and decorum in hostel listings and messaging threads. In-app chats are fully monitored to protect students from housing broker scams. Hostels are for legal residential use during active tertiary semesters. Unlawful activities (including cultism, exam malpractice, drug abuse, or property destruction) are strictly prohibited and will lead to eviction without rent refund.
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-wood-950 flex items-center mb-2">
                    <span className="w-6 h-6 bg-wood-100 text-wood-800 rounded-full flex items-center justify-center text-xs font-bold mr-2">6</span>
                    Disputes &amp; Rent Refund Policies
                  </h3>
                  <div className="pl-8 space-y-2 text-wood-600 text-xs sm:text-sm">
                    <p>
                      If a student discovers that a booked room does not exist, is double-booked, or has extreme discrepancies from the listing:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>The student must click the <strong>"Open Dispute"</strong> button in their booking tab within 3 days of payment.</li>
                      <li>Dormiversity Administration will lock the escrowed funds and contact both parties. If the landlord fails to resolve the issue within 24 hours, the full amount (minus platform dispatch fee) will be refunded to the student's designated bank account.</li>
                      <li>Decisions rendered by the Dormiversity Escrow Resolution Board are final and legally binding.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <section className="bg-emerald-50/50 border border-emerald-200/50 rounded-2xl p-4 flex items-start space-x-3">
                <Lock className="text-emerald-700 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-emerald-900 font-medium">
                  <strong>Privacy Pledge:</strong> Dormiversity Technologies values your personal data. We implement AES-256 equivalent database protection standards to safeguard student registration records, landlord KYC details, and payment authorization keys.
                </p>
              </section>

              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-bold text-base text-wood-950 flex items-center mb-2">
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-850 rounded-full flex items-center justify-center text-xs font-bold mr-2">1</span>
                    Information We Collect
                  </h3>
                  <div className="pl-8 space-y-2 text-wood-600 text-xs sm:text-sm">
                    <p>
                      We collect information to verify accounts, execute legal student escrows, and secure transactions on behalf of users:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li><strong>Students:</strong> Full Name, Email Address, Phone Number, WhatsApp Link, Primary University/College, Profile Photo, Roommate Compatibility Questionnaire, and local Saved bookmarks.</li>
                      <li><strong>Landlords:</strong> National Identification Number (NIN) verification details, Government ID Photos, Business Entity documents (where applicable), Bank account name and number (for verified payout dispatches), and Property Location credentials.</li>
                      <li><strong>Inspectors:</strong> Active College matriculation ID, Proof of Local Campus Residence, Personal Identification records, and physical live GPS coordinate stamps during vetted property visits.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-wood-950 flex items-center mb-2">
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-850 rounded-full flex items-center justify-center text-xs font-bold mr-2">2</span>
                    How Your Information is Used
                  </h3>
                  <div className="pl-8 space-y-2 text-wood-600 text-xs sm:text-sm">
                    <p>
                      Your information is exclusively utilized to run the secure matching and vetting ecosystem:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li><strong>Identity Vetting:</strong> Restricting access to fraudulent accounts.</li>
                      <li><strong>Escrow Operations:</strong> Authorizing bank verifications and safe rent retention with Paystack Gateway.</li>
                      <li><strong>Roommate Matching:</strong> Showcasing compatible student preferences to fellow scholars based on explicit opt-in search listings.</li>
                      <li><strong>On-Site Reports:</strong> Linking requested inspector task cards with certified local students to perform physical checks.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-wood-950 flex items-center mb-2">
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-850 rounded-full flex items-center justify-center text-xs font-bold mr-2">3</span>
                    Data Sharing &amp; Third Parties
                  </h3>
                  <p className="pl-8 text-wood-600 text-xs sm:text-sm">
                    We do NOT sell, lease, or distribute your private contact records to advertising networks or third-party brokers. Data is shared strictly to execute services: Student and Landlord contact cards are only shared with each other AFTER a booking is initiated to prepare the keys, or when a student actively clicks to connect with a potential roommate post.
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-wood-950 flex items-center mb-2">
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-850 rounded-full flex items-center justify-center text-xs font-bold mr-2">4</span>
                    Retention Policy
                  </h3>
                  <p className="pl-8 text-wood-600 text-xs sm:text-sm">
                    Identity details (ID cards/NIN snapshots) used to verify landlord and student legitimacy are archived immediately after the vetting checks are approved by our administration, preventing database theft or security breaches. Transacted escrow records are preserved for up to 7 years to comply with standard Central Bank of Nigeria financial reporting guidelines.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dataprotection' && (
            <div className="space-y-6">
              <section className="bg-blue-50/50 border border-blue-200/50 rounded-2xl p-4 flex items-start space-x-3">
                <ShieldCheck className="text-blue-700 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-blue-900 font-medium">
                  <strong>NDPR Statutory Charter:</strong> Dormiversity maintains full compliance under the Nigeria Data Protection Regulation (NDPR) and general data protection practices (GDPR aligned) for handling local Nigerian student records.
                </p>
              </section>

              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-bold text-base text-wood-950 flex items-center mb-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-2">1</span>
                    Legal Basis for Processing
                  </h3>
                  <p className="pl-8 text-wood-600 text-xs sm:text-sm">
                    We process your data based on <strong>Explicit User Consent</strong> (when creating your profile and checking the agreement boxes) and for <strong>Contractual Necessity</strong> (to securely hold rent in escrow, execute verification checklists, and disburse hostel payouts).
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-wood-950 flex items-center mb-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-2">2</span>
                    The 5 Rights of the Data Subject
                  </h3>
                  <div className="pl-8 space-y-2 text-wood-600 text-xs sm:text-sm">
                    <p>
                      Under the NDPR framework, all Dormiversity users have enforceable statutory rights regarding their personal data:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs">
                      <li><strong>Right to Information:</strong> Clear, jargon-free knowledge of how your data is managed (as outlined in this tab).</li>
                      <li><strong>Right of Access:</strong> You can request a digital file of all transacted bookings, profile logs, and chats.</li>
                      <li><strong>Right to Rectification:</strong> Edit your personal name, photos, contact numbers, and school association at any time from your Dashboard Profile section.</li>
                      <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request complete purging of your active credentials. Landlords with unsettled booking dispatches must conclude ongoing disputes before data deletion can be fully compiled.</li>
                      <li><strong>Right to Data Portability:</strong> Securely export your transacted history or listings metadata upon written application to our support officers.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-wood-950 flex items-center mb-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-2">3</span>
                    Security Audits &amp; Encryption
                  </h3>
                  <p className="pl-8 text-wood-600 text-xs sm:text-sm">
                    Dormiversity carries out bi-annual security integrity testing across its cloud hosting frameworks. Our communication threads use Secure Web Socket protections and database table isolates. We require multi-factor landlord identification before releasing active escrow funds, preventing third-party wire transfer hijack schemes.
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-wood-950 flex items-center mb-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-2">4</span>
                    Compliance Officer &amp; Breach Protocol
                  </h3>
                  <p className="pl-8 text-wood-600 text-xs sm:text-sm">
                    In the highly unlikely event of a security compromise, Dormiversity maintains an active incident response task force. Users will be informed of any data integrity concerns within <strong>72 hours</strong> of confirmation, in compliance with the Nigeria Data Protection Bureau (NDPB) statutory guidelines. For compliance-related requests, email us directly at <strong>compliance@dormiversity.org</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-wood-100 mt-8 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-wood-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Dormiversity Technologies Nigeria. All rights reserved.</p>
          <div className="flex items-center space-x-1 font-semibold text-wood-400">
            <FileText size={12} />
            <span>Version 1.2 • Updated: July 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
