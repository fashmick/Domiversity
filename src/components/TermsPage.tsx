import React from 'react';
import { ArrowLeft, Shield, Scale, FileText, HelpCircle, Printer } from 'lucide-react';

interface TermsPageProps {
  onBack?: () => void;
}

export default function TermsPage({ onBack }: TermsPageProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-wood-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative Wood Background Rings */}
      <div className="absolute right-0 top-0 opacity-5 font-display font-black text-9xl select-none translate-x-20 -translate-y-10 text-wood-900 pointer-events-none">DORM</div>
      <div className="absolute left-0 bottom-0 opacity-5 font-display font-black text-9xl select-none -translate-x-20 translate-y-10 text-wood-900 pointer-events-none">SECURE</div>

      <div className="max-w-3xl mx-auto w-full relative z-10 bg-white border border-wood-200 shadow-xl rounded-3xl p-6 sm:p-10 animate-fadeIn">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-wood-100 pb-6 mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-wood-500 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md">
              <Scale size={24} />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl text-wood-950">Terms &amp; Conditions</h1>
              <p className="text-xs text-wood-500 font-semibold uppercase tracking-wider">Dormiversity Platform Agreement</p>
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

        {/* Introduction */}
        <div className="space-y-6 text-sm text-wood-800 leading-relaxed">
          <section className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 flex items-start space-x-3">
            <Shield className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-amber-900 font-medium">
              <strong>Important Notice:</strong> Dormiversity operates a secure, legal-binding Escrow Housing Protection Service for Nigerian tertiary institutions. By using this portal, all Students, Landlords, and Inspectors agree to be bound by these legal terms.
            </p>
          </section>

          {/* Core Terms Sections */}
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

        {/* Footer */}
        <div className="border-t border-wood-100 mt-8 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-wood-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Dormiversity Nigeria. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <FileText size={12} />
            <span>Last Updated: July 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
