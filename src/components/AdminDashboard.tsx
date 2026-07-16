import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Info, Landmark, HelpCircle, Users, Scale, FileText, Plus, AlertTriangle, MessageSquare, Compass, BarChart3, TrendingUp, Building2, Check, DollarSign } from 'lucide-react';
import { User, Booking, InspectorJob, School } from '../types';
import { formatNaira, formatDate } from '../utils';

interface AdminDashboardProps {
  schools: School[];
  users: User[];
  bookings: Booking[];
  jobs: InspectorJob[];
  messages: any[];
  onApproveUserKYC: (userId: string) => void;
  onRejectUserKYC: (userId: string, reason: string) => void;
  onResolveDispute: (bookingId: string, action: 'RELEASE' | 'REFUND') => void;
  onAddSchool: (school: Omit<School, 'id'>) => void;
}

export default function AdminDashboard({
  schools,
  users,
  bookings,
  jobs,
  messages,
  onApproveUserKYC,
  onRejectUserKYC,
  onResolveDispute,
  onAddSchool
}: AdminDashboardProps) {
  const [subTab, setSubTab] = useState<'approvals' | 'disputes' | 'moderation' | 'schools'>('approvals');
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // School Form state
  const [schoolName, setSchoolName] = useState('');
  const [schoolType, setSchoolType] = useState<'University' | 'Polytechnic' | 'College of Education' | 'Technical School'>('University');
  const [schoolOwnership, setSchoolOwnership] = useState<'Federal' | 'State' | 'Private'>('Federal');
  const [schoolState, setSchoolState] = useState('');

  // Filter pending KYC users
  const pendingUsers = users.filter(u => u.kycStatus === 'PENDING');

  // Filter disputed bookings
  const disputedBookings = bookings.filter(b => b.status === 'DISPUTED');

  // Filter blocked chat messages (contact prevention logs)
  const flaggedMessages = messages.filter(m => m.isBlocked);

  // Platform Metrics
  const gmvBooked = bookings.reduce((acc, b) => acc + b.price, 0);
  const rentCommissions = bookings.filter(b => b.status === 'RELEASED').reduce((acc, b) => acc + (b.price * 0.1), 0);
  const inspectionCommissions = jobs.filter(j => j.status === 'COMPLETED').reduce((acc, j) => acc + 500, 0); // flat N500 per job
  const totalCommissionsEarned = rentCommissions + inspectionCommissions;

  const handleSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || !schoolState.trim()) return;

    onAddSchool({
      name: schoolName.trim(),
      type: schoolType,
      ownership: schoolOwnership,
      state: schoolState.trim()
    });

    setSchoolName('');
    setSchoolState('');
  };

  const handleReject = (userId: string) => {
    if (!rejectionReason.trim()) return;
    onRejectUserKYC(userId, rejectionReason);
    setRejectingUserId(null);
    setRejectionReason('');
  };

  return (
    <div className="bg-wood-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Dashboard Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-wood-200/80 shadow-2xs gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center space-x-1">
              <Scale size={14} />
              <span>Administration Command Console</span>
            </span>
            <h1 className="font-display font-bold text-2xl text-wood-950 mt-1">Dormiversity Platform Controls</h1>
            <p className="text-xs text-wood-600 mt-1">Vet landlords & inspectors, arbitrate student rental escrow conflicts, expand targeting, and track safety ledgers.</p>
          </div>

          <div className="flex flex-wrap bg-wood-50 p-1.5 rounded-2xl border border-wood-200">
            <button
              onClick={() => setSubTab('approvals')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${subTab === 'approvals' ? 'bg-white text-wood-950 shadow-2xs' : 'text-wood-600 hover:text-wood-950'}`}
            >
              KYC Audits ({pendingUsers.length})
            </button>
            <button
              onClick={() => setSubTab('disputes')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${subTab === 'disputes' ? 'bg-white text-wood-950 shadow-2xs' : 'text-wood-600 hover:text-wood-950'}`}
            >
              Disputes Arbitration ({disputedBookings.length})
            </button>
            <button
              onClick={() => setSubTab('moderation')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${subTab === 'moderation' ? 'bg-white text-wood-950 shadow-2xs' : 'text-wood-600 hover:text-wood-950'}`}
            >
              Chat Flags Log ({flaggedMessages.length})
            </button>
            <button
              onClick={() => setSubTab('schools')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${subTab === 'schools' ? 'bg-white text-wood-950 shadow-2xs' : 'text-wood-600 hover:text-wood-950'}`}
            >
              Institution Directories
            </button>
          </div>
        </div>

        {/* FINANCIAL ANALYTICS OVERVIEW PANEL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-wood-200 p-6 rounded-2xl shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-wood-400 font-bold uppercase tracking-wider">Gross Booking Volume</span>
              <p className="font-display font-bold text-xl text-wood-950 mt-0.5">{formatNaira(gmvBooked)}</p>
              <p className="text-[9px] text-wood-400 mt-0.5">Total processed rent</p>
            </div>
            <div className="bg-wood-50 p-3 rounded-xl text-wood-700"><TrendingUp size={18} /></div>
          </div>

          <div className="bg-white border border-wood-200 p-6 rounded-2xl shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-wood-400 font-bold uppercase tracking-wider">Commissions Ledger</span>
              <p className="font-display font-bold text-xl text-emerald-700 mt-0.5">{formatNaira(totalCommissionsEarned)}</p>
              <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">10% Rent + ₦500 Inspection Cuts</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-700"><DollarSign size={18} /></div>
          </div>

          <div className="bg-white border border-wood-200 p-6 rounded-2xl shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-wood-400 font-bold uppercase tracking-wider">Registered Scholars</span>
              <p className="font-display font-bold text-xl text-wood-950 mt-0.5">{users.filter(u => u.role === 'STUDENT').length}</p>
              <p className="text-[9px] text-wood-400 mt-0.5">Verified Nigerian Students</p>
            </div>
            <div className="bg-wood-50 p-3 rounded-xl text-wood-700"><Users size={18} /></div>
          </div>

          <div className="bg-white border border-wood-200 p-6 rounded-2xl shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-wood-400 font-bold uppercase tracking-wider">Target School Hubs</span>
              <p className="font-display font-bold text-xl text-wood-950 mt-0.5">{schools.length}</p>
              <p className="text-[9px] text-wood-400 mt-0.5">Active pilot directories</p>
            </div>
            <div className="bg-wood-50 p-3 rounded-xl text-wood-700"><Building2 size={18} /></div>
          </div>
        </div>

        {/* 1. KYC APPROVAL AUDITING SUBTAB */}
        {subTab === 'approvals' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-wood-900 border-b border-wood-200 pb-2">Pending Identity Credentials Verification ({pendingUsers.length})</h3>
            
            {pendingUsers.length === 0 ? (
              <p className="text-xs text-wood-500 bg-white p-6 rounded-2xl border border-wood-200">Excellent! All Landlords and Inspectors KYC records are audited and up-to-date.</p>
            ) : (
              pendingUsers.map(user => (
                <div key={user.id} className="bg-white border border-wood-200 rounded-2xl p-6 space-y-4 hover:shadow-2xs transition-all">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-wood-950">{user.name}</h4>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold text-white uppercase ${user.role === 'LANDLORD' ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs text-wood-500 mt-1">Email: {user.email} | Phone: {user.phone}</p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setRejectingUserId(user.id)}
                        className="px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => onApproveUserKYC(user.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer flex items-center space-x-1"
                      >
                        <Check size={14} />
                        <span>Vouch & Approve</span>
                      </button>
                    </div>
                  </div>

                  {/* Document details box */}
                  <div className="bg-wood-50 p-4 rounded-xl border border-wood-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-wood-400 block uppercase text-[9px] tracking-wider">Identity Details</span>
                      <p className="font-semibold text-wood-950 mt-1">{user.kycDetails?.idType}</p>
                      <p className="font-mono text-wood-600 mt-0.5">ID No: {user.kycDetails?.idNumber}</p>
                    </div>

                    <div>
                      <span className="font-bold text-wood-400 block uppercase text-[9px] tracking-wider">Uploaded Proof Attachments</span>
                      <p className="text-wood-700 mt-1 font-mono select-all">📄 {user.kycDetails?.idImage}</p>
                      <p className="text-wood-700 mt-0.5 font-mono select-all">📄 {user.kycDetails?.proofDoc}</p>
                    </div>

                    <div>
                      <span className="font-bold text-wood-400 block uppercase text-[9px] tracking-wider">Payout Coordinates</span>
                      <p className="font-semibold text-wood-950 mt-1">Bank: {user.kycDetails?.bankName}</p>
                      <p className="font-mono text-wood-600 mt-0.5">Acc No: {user.kycDetails?.bankAccount}</p>
                    </div>
                  </div>

                  {/* Rejection slide input window */}
                  {rejectingUserId === user.id && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-3 animate-fadeIn text-xs">
                      <label className="block font-bold text-red-800">State Reason for Rejection</label>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="E.g., NIN photo blurry, Bank account name does not match ID, or property license expired..."
                        className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setRejectingUserId(null)}
                          className="px-3.5 py-1 text-wood-700 border border-wood-200 rounded-lg font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(user.id)}
                          disabled={!rejectionReason.trim()}
                          className="px-4 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold rounded-lg cursor-pointer"
                        >
                          Confirm Reject
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        )}

        {/* 2. DISPUTE MEDIATION ARBITRATION SUBTAB */}
        {subTab === 'disputes' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-wood-900 border-b border-wood-200 pb-2">Active Rent Escrow Disputes Arbitration ({disputedBookings.length})</h3>
            
            {disputedBookings.length === 0 ? (
              <p className="text-xs text-wood-500 bg-white p-6 rounded-2xl border border-wood-200">Peaceful times! No student is currently disputing their escrow rental deposits.</p>
            ) : (
              disputedBookings.map(booking => {
                // Find associated inspector report for the hostel
                const inspectorJob = jobs.find(j => j.hostelId === booking.hostelId && j.status === 'COMPLETED');
                const report = inspectorJob?.report;
                
                return (
                  <div key={booking.id} className="bg-white border border-wood-200 rounded-2xl p-6 space-y-6 hover:shadow-2xs transition-all">
                    
                    {/* Dispute Info */}
                    <div className="flex justify-between items-start flex-wrap gap-4 pb-4 border-b border-wood-100">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-base text-wood-950">{booking.hostelName}</h4>
                          <span className="px-2.5 py-0.5 bg-red-100 text-red-800 rounded text-[10px] font-bold">⚠️ ESCROW BLOCKED</span>
                        </div>
                        <p className="text-xs text-wood-500 mt-1">Tenant: <strong>{booking.studentName}</strong> | Landlord: <strong>{booking.landlordName}</strong></p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-wood-400 font-bold uppercase tracking-wider block">Escrow locked value</span>
                        <p className="font-bold text-wood-950 text-lg mt-0.5">{formatNaira(booking.price)}</p>
                      </div>
                    </div>

                    {/* Complaint vs Evidence Block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      <div className="bg-red-50/50 p-4 rounded-xl border border-red-200/60">
                        <span className="font-bold text-red-800 uppercase block tracking-wider text-[10px]">Student Complaint</span>
                        <p className="text-red-700 font-medium italic mt-2">"{booking.disputeReason}"</p>
                        <p className="text-wood-500 text-[10px] mt-3">Evidence: {booking.disputeEvidence}</p>
                      </div>

                      {/* Vetted Inspector report (CRITICAL EVIDENCE) */}
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/60">
                        <span className="font-bold text-blue-800 uppercase block tracking-wider text-[10px]">Unbiased Inspector Report Evidence</span>
                        {report ? (
                          <div className="mt-2 space-y-1 text-[11px] text-blue-900 leading-snug">
                            <p>🔍 Visual Accuracy: <strong>{report.matchStatus}</strong></p>
                            <p>🚰 Borehole Water: <strong>{report.waterStatus}</strong></p>
                            <p>⚡ Power Status: <strong>{report.powerStatus}</strong></p>
                            <p>🛡️ Security Grid: <strong>{report.securityStatus}</strong></p>
                            <p>🏡 Vetting Rec: <strong className="bg-white px-1 py-0.5 rounded text-[10px] shadow-3xs">{report.recommendation}</strong></p>
                            <p className="text-wood-500 text-[10px] pt-1">Notes: "{report.notes}"</p>
                          </div>
                        ) : (
                          <p className="text-wood-500 italic mt-2">No Roomly Inspection was requested. The student chose to book without checking. Admin must mediate via chat logs.</p>
                        )}
                      </div>
                    </div>

                    {/* Arbitration Decision Action Buttons */}
                    <div className="pt-4 border-t border-wood-100 flex justify-end space-x-2">
                      <button
                        onClick={() => onResolveDispute(booking.id, 'REFUND')}
                        className="px-4 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Refund Student (100%)
                      </button>
                      <button
                        onClick={() => onResolveDispute(booking.id, 'RELEASE')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                      >
                        Release Rent to Landlord (90%)
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 3. CONTACT PREVENTION MONITORING FLAG SUBTAB */}
        {subTab === 'moderation' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-wood-900 border-b border-wood-200 pb-2">Flagged Messages Ledger (Contact-Sharing Filter Violations)</h3>
            <p className="text-xs text-wood-500">Real-time log of communications blocked from being sent to protect escrow transactional security.</p>
            
            <div className="bg-white border border-wood-200 rounded-2xl overflow-hidden shadow-2xs text-xs">
              <div className="p-4 bg-wood-50 border-b border-wood-100 grid grid-cols-12 font-bold text-wood-800">
                <span className="col-span-2">Sender</span>
                <span className="col-span-6">Blocked Text Content</span>
                <span className="col-span-2">Flagged Code Reason</span>
                <span className="col-span-2 text-right">Time</span>
              </div>

              <div className="divide-y divide-wood-100">
                {flaggedMessages.length === 0 ? (
                  <p className="p-8 text-center text-wood-400">Perfect! No messages have triggered the contact-sharing blocker in this session.</p>
                ) : (
                  flaggedMessages.map(msg => (
                    <div key={msg.id} className="p-4 grid grid-cols-12 hover:bg-wood-50/50 gap-2">
                      <span className="col-span-2 font-semibold text-wood-950 truncate">{msg.senderName}</span>
                      <span className="col-span-6 text-red-600 bg-red-50 p-2 rounded-lg font-mono text-[11px] leading-relaxed break-all">"{msg.text}"</span>
                      <span className="col-span-2 font-medium text-amber-800 flex items-center space-x-1">
                        <AlertTriangle size={12} className="text-amber-500" />
                        <span>Contact Intercepted</span>
                      </span>
                      <span className="col-span-2 text-right text-wood-400">{formatDate(msg.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. SCHOOL DIRECTORY MANAGER SUBTAB */}
        {subTab === 'schools' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Create School Form (Left) */}
            <div className="bg-white p-6 rounded-3xl border border-wood-200/80 shadow-xs h-fit space-y-4 text-xs text-wood-700">
              <h3 className="font-display font-bold text-base text-wood-950 border-b border-wood-100 pb-3">Register New Pilot Hub</h3>
              
              <form onSubmit={handleSchoolSubmit} className="space-y-4">
                <div>
                  <label className="block font-bold mb-1">Institution Full Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="E.g., University of Benin (UNIBEN)"
                    className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-xs outline-hidden focus:border-wood-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">School Type</label>
                    <select
                      value={schoolType}
                      onChange={(e) => setSchoolType(e.target.value as any)}
                      className="w-full bg-wood-50 border border-wood-200 rounded-xl px-2 py-2 text-xs outline-hidden"
                    >
                      <option value="University">University</option>
                      <option value="Polytechnic">Polytechnic</option>
                      <option value="College of Education">College of Ed.</option>
                      <option value="Technical School">Technical School</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Ownership</label>
                    <select
                      value={schoolOwnership}
                      onChange={(e) => setSchoolOwnership(e.target.value as any)}
                      className="w-full bg-wood-50 border border-wood-200 rounded-xl px-2 py-2 text-xs outline-hidden"
                    >
                      <option value="Federal">Federal Gov.</option>
                      <option value="State">State Gov.</option>
                      <option value="Private">Private Board</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">Nigerian State</label>
                  <input
                    type="text"
                    value={schoolState}
                    onChange={(e) => setSchoolState(e.target.value)}
                    placeholder="E.g., Edo"
                    className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-xs outline-hidden focus:border-wood-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-wood-600 hover:bg-wood-700 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Register Campus Hub</span>
                </button>
              </form>
            </div>

            {/* School Directories list (Right) */}
            <div className="lg:col-span-2 bg-white border border-wood-200 rounded-3xl p-6 shadow-xs">
              <h3 className="font-display font-bold text-base text-wood-950 mb-4">Pilot Target Directory ({schools.length})</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {schools.map(s => (
                  <div key={s.id} className="bg-wood-50/50 p-4 rounded-xl border border-wood-200/50 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-wood-950 leading-tight">{s.name}</h4>
                      <p className="text-[10px] text-wood-400 mt-1 uppercase font-semibold tracking-wider">State: {s.state}</p>
                    </div>

                    <div className="mt-3 flex gap-1.5 text-[9px] font-bold text-white uppercase">
                      <span className="bg-wood-700 px-2 py-0.5 rounded">
                        {s.type}
                      </span>
                      <span className="bg-amber-600 px-2 py-0.5 rounded">
                        {s.ownership}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
