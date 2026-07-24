import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, ShieldCheck, AlertCircle, Building, X, ArrowLeft, Clock, Lock } from 'lucide-react';
import { formatNaira } from '../utils';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  hostelName: string;
  amount: number;
  currentStatus?: string;
  onSubmitRefund?: (bookingId: string, bankName: string, accountNumber: string, accountName: string, reason: string) => void;
  onRefundSubmitted?: () => void;
}

export const NIGERIAN_BANKS = [
  'Zenith Bank',
  'Guaranty Trust Bank (GTBank)',
  'Kuda Microfinance Bank',
  'Access Bank',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'OPay Digital Services',
  'Moniepoint Microfinance Bank',
  'PalmPay',
  'FCMB',
  'Stanbic IBTC Bank',
  'Sterling Bank',
  'Wema Bank / ALAT',
  'Fidelity Bank'
];

export default function RefundModal({
  isOpen,
  onClose,
  bookingId,
  hostelName,
  amount,
  currentStatus = 'BOOKED',
  onSubmitRefund,
  onRefundSubmitted
}: RefundModalProps) {
  const [bankName, setBankName] = useState(NIGERIAN_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [isBankVerified, setIsBankVerified] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-verify account name when 10 digits are typed
  useEffect(() => {
    const cleanNum = accountNumber.replace(/\D/g, '');
    if (cleanNum.length === 10) {
      setIsVerifyingBank(true);
      const timer = setTimeout(() => {
        setIsVerifyingBank(false);
        setIsBankVerified(true);
        // Simulate real NIBSS account lookup result
        setAccountName("AYOMIDE FASHINA (" + bankName.toUpperCase() + " VERIFIED)");
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setIsBankVerified(false);
      setAccountName('');
    }
  }, [accountNumber, bankName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBankVerified || !accountNumber) {
      alert("Please enter a valid 10-digit NUBAN account number to verify your bank account name.");
      return;
    }
    if (!reason.trim()) {
      alert("Please enter a reason for requesting the refund.");
      return;
    }

    const wordCount = reason.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 10) {
      alert(`Description too short: Reason for refund must contain at least 10 words (currently ${wordCount} words). Please explain why you are requesting this refund.`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onSubmitRefund) {
        onSubmitRefund(bookingId, bankName, accountNumber, accountName, reason);
      }
      if (onRefundSubmitted) {
        onRefundSubmitted();
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-wood-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-wood-200 shadow-2xl animate-scaleUp">
        
        {/* HEADER */}
        <div className="p-5 bg-gradient-to-r from-wood-950 via-amber-950 to-wood-950 text-white flex justify-between items-center relative overflow-hidden">
          <div className="flex items-center space-x-3 relative z-10">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20 backdrop-blur-xs">
              <RefreshCw size={20} className="text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-2 py-0.5 rounded">
                Escrow Refund Portal
              </span>
              <h3 className="font-extrabold text-base text-white mt-0.5">Request Rent Escrow Refund</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-all cursor-pointer relative z-10"
          >
            <X size={16} />
          </button>
        </div>

        {/* CONTENT */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="font-extrabold text-lg text-wood-950">Refund Request & Reversal Initiated</h4>
            <p className="text-xs text-wood-600 leading-relaxed max-w-sm mx-auto">
              Your refund request for <span className="font-bold text-wood-900">{hostelName}</span> has been processed.
            </p>

            {/* STATUS BADGES & DETAILS */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-3 text-left text-xs">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <span className="font-bold text-emerald-950">Refund Amount:</span>
                <span className="font-extrabold text-emerald-800 text-base">{formatNaira(amount)}</span>
              </div>
              <div className="space-y-1">
                <p className="text-emerald-900 font-semibold">Destination Bank Account:</p>
                <p className="font-mono font-bold text-emerald-950 bg-white p-2 rounded-lg border border-emerald-200 text-[11px]">
                  {accountName} • {bankName} ({accountNumber})
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-2xs flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>Money Refunded</span>
                </span>
                <span className="bg-blue-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-2xs flex items-center gap-1">
                  <ShieldCheck size={12} />
                  <span>Dispute Settled</span>
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-wood-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md"
            >
              Return to Bookings
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-wood-700">
            
            {/* PROPERTY & REFUND AMOUNT SUMMARY */}
            <div className="bg-wood-50 p-4 rounded-2xl border border-wood-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-wood-400 uppercase tracking-wider block">Refunding Property</span>
                <span className="font-bold text-wood-950 text-sm">{hostelName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Refundable Escrow</span>
                <span className="font-extrabold text-emerald-700 text-base font-display">{formatNaira(amount)}</span>
              </div>
            </div>

            {/* AUTOMATIC BANK DETAILS & NAME VERIFICATION */}
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-3.5">
              <div className="flex items-center space-x-2 text-amber-950 border-b border-amber-200 pb-2">
                <Building size={16} className="text-amber-700" />
                <h4 className="font-bold text-xs">Destination NUBAN Bank Account</h4>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-wood-900 text-[11px] block">Select Bank *</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-2.5 bg-white rounded-xl border border-wood-200 text-xs font-semibold text-wood-900 focus:ring-2 focus:ring-amber-500"
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-wood-900 text-[11px] block">10-Digit Account Number *</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. 0123456789"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-2.5 pr-10 bg-white rounded-xl border border-wood-200 font-mono text-xs text-wood-900 font-bold focus:ring-2 focus:ring-amber-500"
                  />
                  {isVerifyingBank && (
                    <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 animate-spin" />
                  )}
                  {isBankVerified && (
                    <CheckCircle2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                  )}
                </div>
              </div>

              {/* Automatic Account Name Resolution Box */}
              {isBankVerified && (
                <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl flex items-center space-x-2.5 text-emerald-900 animate-fadeIn">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Verified NIBSS Account Name</span>
                    <span className="font-bold text-xs font-mono text-emerald-950">{accountName}</span>
                  </div>
                </div>
              )}
            </div>

            {/* REASON FOR REFUND */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-wood-900 text-xs block">Reason for Refund *</label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  reason.trim().split(/\s+/).filter(Boolean).length >= 10
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {reason.trim().split(/\s+/).filter(Boolean).length} / 10 words min
                </span>
              </div>
              <textarea
                rows={3}
                required
                placeholder="Describe why you are rejecting or refunding (minimum 10 words, e.g. physical inspection failed, borehole broken, false photos)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 bg-white rounded-xl border border-wood-200 text-xs text-wood-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* ESCROW SAFETY GUARANTEE */}
            <div className="bg-wood-50 p-3.5 rounded-2xl border border-wood-200 flex items-start space-x-2.5 text-[11px] text-wood-700">
              <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Refunding will immediately lock escrow settlement to the landlord, revert your funds, and update booking status to <span className="font-bold text-emerald-800">Refunded & Settled</span>.
              </p>
            </div>

            {/* BUTTONS */}
            <div className="pt-2 flex items-center justify-between space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-wood-100 hover:bg-wood-200 text-wood-800 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isBankVerified || isSubmitting}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <Clock size={16} className="animate-spin" />
                ) : (
                  <>
                    <RefreshCw size={14} />
                    <span>Request Refund ({formatNaira(amount)})</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
