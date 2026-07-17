import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Info, Landmark, HelpCircle, Users, Scale, FileText, Plus, AlertTriangle, MessageSquare, Compass, BarChart3, TrendingUp, Building2, Check, DollarSign, Trash2, Key, CreditCard, Mail, Sliders } from 'lucide-react';
import { User, Booking, InspectorJob, School } from '../types';
import { formatNaira, formatDate, getApiUrl } from '../utils';

interface AdminDashboardProps {
  schools: School[];
  users: User[];
  bookings: Booking[];
  jobs: InspectorJob[];
  messages: any[];
  adminToken?: string | null;
  onApproveUserKYC: (userId: string) => void;
  onRejectUserKYC: (userId: string, reason: string) => void;
  onResolveDispute: (bookingId: string, action: 'RELEASE' | 'REFUND') => void;
  onDeleteSchool: (schoolId: string) => void;
}

export default function AdminDashboard({
  schools,
  users,
  bookings,
  jobs,
  messages,
  adminToken,
  onApproveUserKYC,
  onRejectUserKYC,
  onResolveDispute,
  onDeleteSchool
}: AdminDashboardProps) {
  const [subTab, setSubTab] = useState<'approvals' | 'disputes' | 'moderation' | 'schools' | 'integrations'>('approvals');
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Integrations state
  const [paystackPubKey, setPaystackPubKey] = useState('');
  const [paystackSecKey, setPaystackSecKey] = useState('');
  const [resendKey, setResendKey] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);

  // Load existing credentials when Integrations tab is activated
  useEffect(() => {
    if (subTab === 'integrations' && adminToken) {
      setIsLoadingKeys(true);
      fetch(getApiUrl('/api/admin/data'), {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setPaystackPubKey(data.settings.paystackPublicKey || '');
          setPaystackSecKey(data.settings.paystackSecretKey || '');
          setResendKey(data.settings.resendApiKey || '');
          setGoogleClientId(data.settings.googleClientId || '');
          setGoogleClientSecret(data.settings.googleClientSecret || '');
        }
      })
      .catch(err => console.error('Error loading API configurations:', err))
      .finally(() => setIsLoadingKeys(false));
    }
  }, [subTab, adminToken]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(getApiUrl('/api/admin/settings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          paystackPublicKey: paystackPubKey,
          paystackSecretKey: paystackSecKey,
          resendApiKey: resendKey,
          googleClientId,
          googleClientSecret
        })
      });
      if (res.ok) {
        setSaveMessage({ type: 'success', text: 'API Integration Credentials updated successfully!' });
      } else {
        const errData = await res.json();
        setSaveMessage({ type: 'error', text: errData.error || 'Failed to save integrations configuration.' });
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Network connection failed.' });
    } finally {
      setIsSaving(false);
    }
  };

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
            <button
              onClick={() => setSubTab('integrations')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${subTab === 'integrations' ? 'bg-white text-wood-950 shadow-2xs' : 'text-wood-600 hover:text-wood-950'}`}
            >
              Integrations Settings
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            
            {/* Information Directory Panel (Left) */}
            <div className="bg-white p-6 rounded-3xl border border-wood-200/80 shadow-xs h-fit space-y-5 text-xs text-wood-700">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-wood-100 text-wood-700 rounded-xl flex items-center justify-center">
                  <Landmark size={20} className="text-wood-700" />
                </div>
                <h3 className="font-display font-bold text-base text-wood-950">Pre-populated Directories</h3>
                <p className="text-xs text-wood-500 leading-relaxed">
                  Dormiversity now automatically integrates <strong>90 major higher institutions</strong> across Nigeria. This includes federal, state, and private universities and polytechnics.
                </p>
              </div>
              
              <div className="border-t border-wood-100 pt-4 space-y-3">
                <span className="font-bold text-wood-800 uppercase tracking-wide block">Directory Policy:</span>
                <ul className="space-y-2 text-wood-600 list-disc list-inside leading-relaxed">
                  <li>Manual entry is disabled for admins to prevent human errors or formatting mismatches.</li>
                  <li>Campus directories are fed from national accreditation databases dynamically.</li>
                  <li>As an administrator, you have the full authority to <strong>remove or delete</strong> institutions that are inactive or have completed pilot testing.</li>
                </ul>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl space-y-1.5 text-amber-950">
                <div className="flex items-center space-x-1 font-bold">
                  <Info size={14} className="text-amber-500" />
                  <span>Important Note on Deletion</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Deleting a school immediately removes it from the search hubs and student registries. All current listing agreements under that school remain intact but hidden from discovery.
                </p>
              </div>
            </div>

            {/* School Directories list (Right) */}
            <div className="lg:col-span-2 bg-white border border-wood-200 rounded-3xl p-6 shadow-xs">
              <h3 className="font-display font-bold text-base text-wood-950 mb-4">Pilot Target Directory ({schools.length})</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs max-h-[600px] overflow-y-auto pr-2">
                {schools.map(s => (
                  <div key={s.id} className="bg-wood-50/50 p-4 rounded-xl border border-wood-200/50 flex flex-col justify-between relative group hover:border-wood-300 transition-colors">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${s.name} from Dormiversity directories?`)) {
                          onDeleteSchool(s.id);
                        }
                      }}
                      title="Delete Institution Directory"
                      className="absolute top-3 right-3 text-wood-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div>
                      <h4 className="font-bold text-wood-950 leading-tight pr-6">{s.name}</h4>
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

        {/* 5. INTEGRATIONS SETTINGS SUBTAB */}
        {subTab === 'integrations' && (
          <div className="bg-white border border-wood-200 rounded-3xl p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-6">
            <div className="flex items-start space-x-3 border-b border-wood-100 pb-4">
              <div className="bg-amber-500/10 text-amber-600 p-2.5 rounded-xl">
                <Sliders size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-wood-950">Third-Party Service Configurations</h3>
                <p className="text-xs text-wood-500 mt-1">Configure live production keys for Paystack secure escrow gateway and Resend notification deliverability pipelines.</p>
              </div>
            </div>

            {isLoadingKeys ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-wood-500 font-semibold animate-pulse">Loading secure service configurations...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Paystack Integration Section */}
                <div className="space-y-4">
                  <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center space-x-1.5 border-b border-wood-50 pb-1.5">
                    <CreditCard size={14} />
                    <span>Paystack Escrow System Credentials</span>
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-wood-700">Paystack Public Key</label>
                      <input
                        type="text"
                        value={paystackPubKey}
                        onChange={(e) => setPaystackPubKey(e.target.value)}
                        placeholder="pk_live_..."
                        className="w-full bg-wood-50/50 border border-wood-200 rounded-xl px-4 py-2.5 text-xs text-wood-900 outline-hidden focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-wood-700">Paystack Secret Key</label>
                      <input
                        type="password"
                        value={paystackSecKey}
                        onChange={(e) => setPaystackSecKey(e.target.value)}
                        placeholder="sk_live_..."
                        className="w-full bg-wood-50/50 border border-wood-200 rounded-xl px-4 py-2.5 text-xs text-wood-900 outline-hidden focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-wood-400">
                    Your keys are stored securely on the isolated administrative container server environment. Paystack powers all automated 90% rental escrows.
                  </p>
                </div>

                {/* Resend Integration Section */}
                <div className="space-y-4 pt-2">
                  <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center space-x-1.5 border-b border-wood-50 pb-1.5">
                    <Mail size={14} />
                    <span>Resend Email Dispatcher API Key</span>
                  </span>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-wood-700">Resend API Key</label>
                    <input
                      type="password"
                      value={resendKey}
                      onChange={(e) => setResendKey(e.target.value)}
                      placeholder="re_..."
                      className="w-full bg-wood-50/50 border border-wood-200 rounded-xl px-4 py-2.5 text-xs text-wood-900 outline-hidden focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-wood-400">
                    Resend acts as the system SMTP relay, executing student verification receipts, escrow disputes reports, and inspections notifications.
                  </p>
                </div>

                {/* Google OAuth Integration Section */}
                <div className="space-y-4 pt-2">
                  <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center space-x-1.5 border-b border-wood-50 pb-1.5">
                    <Key size={14} />
                    <span>Google OAuth 2.0 Identity Credentials</span>
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-wood-700">Google Client ID</label>
                      <input
                        type="text"
                        value={googleClientId}
                        onChange={(e) => setGoogleClientId(e.target.value)}
                        placeholder="your-client-id.apps.googleusercontent.com"
                        className="w-full bg-wood-50/50 border border-wood-200 rounded-xl px-4 py-2.5 text-xs text-wood-900 outline-hidden focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-wood-700">Google Client Secret</label>
                      <input
                        type="password"
                        value={googleClientSecret}
                        onChange={(e) => setGoogleClientSecret(e.target.value)}
                        placeholder="GOCSPX-..."
                        className="w-full bg-wood-50/50 border border-wood-200 rounded-xl px-4 py-2.5 text-xs text-wood-900 outline-hidden focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-wood-400">
                    Enter your Google Cloud Console Web Application credentials. Be sure to register the correct redirect URI shown in the auth flow callback window.
                  </p>
                </div>

                {saveMessage && (
                  <div className={`p-4 rounded-xl text-xs text-center font-semibold border ${
                    saveMessage.type === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800' 
                      : 'bg-red-500/10 border-red-500/20 text-red-800'
                  }`}>
                    {saveMessage.type === 'success' ? '✅' : '⚠️'} {saveMessage.text}
                  </div>
                )}

                {/* Submit controls */}
                <div className="pt-4 border-t border-wood-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-wood-200 disabled:text-wood-400 text-wood-950 font-bold rounded-xl text-xs transition-all shadow-xs flex items-center space-x-2 cursor-pointer uppercase tracking-wider"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-wood-950 border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving credentials...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Apply & Deploy Integrations</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
