import React, { useState } from 'react';
import { AlertTriangle, Flag, X, ShieldAlert, CheckCircle2, Upload } from 'lucide-react';

interface ReportHostelModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostelId: string;
  hostelName: string;
}

export const REPORT_REASONS = [
  { id: 'FALSE_DETAILS', label: '🚨 False or Misleading Photos / Details', desc: 'Photos do not match the real room or false amenities were advertised.' },
  { id: 'SCAM_OVERPRICE', label: '💸 Overpriced / Scam Attempt / Extra Fees', desc: 'Landlord requesting unapproved agency, caution, or cash fees outside escrow.' },
  { id: 'DAMAGED_FACILITIES', label: '🛠️ Damaged Facilities / No Water or Light', desc: 'Borehole broken, plumbing leaks, structural damage, or power issues.' },
  { id: 'UNRESPONSIVE_HOST', label: '👤 Unresponsive or Suspicious Landlord', desc: 'Host refuses to answer calls, schedule physical visits, or provide proof.' },
  { id: 'SAFETY_CONCERN', label: '🔒 Safety, Security, or Neighborhood Threat', desc: 'Unsafe doors/locks, high crime area, or dangerous structural integrity.' },
  { id: 'OTHER', label: '❓ Other Compliance Issue', desc: 'Any other violation of Dormiversity student safety rules.' }
];

export default function ReportHostelModal({ isOpen, onClose, hostelId, hostelName }: ReportHostelModalProps) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0].id);
  const [details, setDetails] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      alert("Please provide a brief description of the issue.");
      return;
    }

    // Save report to client storage for local record
    try {
      const existingStr = localStorage.getItem('dorm_hostel_reports') || '[]';
      const existing = JSON.parse(existingStr);
      existing.push({
        id: 'rep_' + Date.now(),
        hostelId,
        hostelName,
        reason: selectedReason,
        details,
        proofImage,
        createdAt: new Date().toISOString(),
        status: 'PENDING_REVIEW'
      });
      localStorage.setItem('dorm_hostel_reports', JSON.stringify(existing));
    } catch (err) {
      console.warn("Could not record report", err);
    }

    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setDetails('');
    setProofImage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-wood-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-wood-200 shadow-2xl animate-scaleUp">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-red-950 via-red-800 to-red-950 text-white flex justify-between items-center relative overflow-hidden">
          <div className="flex items-center space-x-3 relative z-10">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20 backdrop-blur-xs">
              <Flag size={20} className="text-red-200" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-200 bg-white/10 px-2 py-0.5 rounded">
                Safety & Compliance
              </span>
              <h3 className="font-extrabold text-base text-white mt-0.5">Report Hostel Listing</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-all cursor-pointer relative z-10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="font-extrabold text-lg text-wood-950">Report Logged Successfully</h4>
            <p className="text-xs text-wood-600 leading-relaxed max-w-sm mx-auto">
              Thank you for keeping Dormiversity safe. Our Safety & Auditing team has received your report for <span className="font-bold text-wood-900">{hostelName}</span> and will review it within <span className="font-bold text-emerald-700">24 hours</span>.
            </p>
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-[11px] text-amber-900 text-left space-y-1">
              <span className="font-bold text-amber-950 block">🛡️ In-App Dispute Monitoring</span>
              <p>You can track updates or log additional complaint details in the AI Support & Complaint Desk from your navigation menu.</p>
            </div>
            <button
              onClick={handleResetAndClose}
              className="w-full py-3 bg-wood-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-wood-700">
            
            {/* Target Hostel Card */}
            <div className="bg-wood-50 p-3.5 rounded-2xl border border-wood-200 flex items-center space-x-3">
              <ShieldAlert className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <span className="text-[10px] font-bold text-wood-400 uppercase tracking-wider block">Target Listing</span>
                <span className="font-bold text-wood-950 text-sm">{hostelName}</span>
              </div>
            </div>

            {/* Select Reason */}
            <div className="space-y-2">
              <label className="font-bold text-wood-900 text-xs block">Select Reason for Report *</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-start space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedReason === r.id
                        ? 'bg-red-50/80 border-red-300 ring-1 ring-red-400 shadow-2xs'
                        : 'bg-white border-wood-200 hover:bg-wood-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      checked={selectedReason === r.id}
                      onChange={() => setSelectedReason(r.id)}
                      className="mt-0.5 text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-wood-900 text-xs">{r.label}</p>
                      <p className="text-[10px] text-wood-500 mt-0.5 leading-normal">{r.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="font-bold text-wood-900 text-xs block">Detailed Explanation *</label>
              <textarea
                rows={3}
                required
                placeholder="Explain what happened or what is wrong with this listing (e.g., room size is smaller, tap water is dirty, landlord demanded cash)..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full p-3 bg-white rounded-xl border border-wood-200 text-xs text-wood-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Optional Image Proof URL */}
            <div className="space-y-1">
              <label className="font-bold text-wood-900 text-[11px] block flex items-center justify-between">
                <span>Proof Image URL (Optional)</span>
                <span className="text-[10px] text-wood-400 font-normal">Photo of room or chat screenshot</span>
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={proofImage}
                onChange={(e) => setProofImage(e.target.value)}
                className="w-full p-2.5 bg-white rounded-xl border border-wood-200 text-xs text-wood-900 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Warning & Submit */}
            <div className="pt-2 flex items-center justify-between space-x-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 bg-wood-100 hover:bg-wood-200 text-wood-800 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center justify-center space-x-1.5"
              >
                <Flag size={14} />
                <span>Submit Report to Safety Team</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
