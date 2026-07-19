import React, { useState } from 'react';
import { ClipboardCheck, ShieldAlert, CheckCircle2, Clock, MapPin, Clipboard, DollarSign, PenTool, Check, FileText, User, AlertCircle } from 'lucide-react';
import { InspectorJob, User as PlatformUser, School } from '../types';
import { formatNaira, formatDate } from '../utils';
import CustomSelect from './CustomSelect';

interface InspectorDashboardProps {
  activeInspector: PlatformUser;
  schools: School[];
  jobs: InspectorJob[];
  onUploadKYC: (details: { idType: string; idNumber: string; idImage: string; proofDoc: string; bankName: string; bankAccount: string; bankAccountName: string }) => void;
  onAcceptJob: (jobId: string) => void;
  onSubmitReport: (jobId: string, report: {
    waterStatus: 'Excellent' | 'Good' | 'Poor' | 'Broken';
    powerStatus: 'Constant' | 'Scheduled (Gen/Solar)' | 'Unstable' | 'No Power';
    securityStatus: 'Highly Secured' | 'Moderately Secured' | 'Poor';
    cleanlinessStatus: 'Spotless' | 'Clean' | 'Average' | 'Dirty';
    matchStatus: 'Exactly as listed' | 'Minor discrepancies' | 'Major discrepancy / Fake';
    notes: string;
    recommendation: 'Highly Recommended' | 'Recommended with cautions' | 'Do Not Book';
    photos: string[];
  }) => void;
  onUpdateProfile?: (updatedUser: PlatformUser) => void;
  onDeleteAccount?: (userId: string) => void;
  initialSubTab?: 'available' | 'my-jobs' | 'earnings' | 'profile';
}

export default function InspectorDashboard({
  activeInspector,
  schools,
  jobs,
  onUploadKYC,
  onAcceptJob,
  onSubmitReport,
  onUpdateProfile,
  onDeleteAccount,
  initialSubTab
}: InspectorDashboardProps) {
  const [subTab, setSubTab] = useState<'available' | 'my-jobs' | 'earnings' | 'profile'>(initialSubTab || 'available');

  React.useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [reportingJobId, setReportingJobId] = useState<string | null>(null);

  // Profile settings state
  const [profileName, setProfileName] = useState(activeInspector.name);
  const [profilePhone, setProfilePhone] = useState(activeInspector.phone);
  const [profileEmail, setProfileEmail] = useState(activeInspector.email);
  const [profilePic, setProfilePic] = useState(activeInspector.profilePicture || '');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  React.useEffect(() => {
    setProfileName(activeInspector.name);
    setProfilePhone(activeInspector.phone);
    setProfileEmail(activeInspector.email);
    setProfilePic(activeInspector.profilePicture || '');
  }, [activeInspector.id, activeInspector.name, activeInspector.phone, activeInspector.email, activeInspector.profilePicture]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError('');

    const cleanPhone = profilePhone.replace(/[\s\-\(\)\+]/g, '');
    const isNigerian = /^(0\d{10}|234\d{10})$/.test(cleanPhone);
    if (!isNigerian) {
      setUpdateError('Please enter a valid Nigerian phone number (11 digits starting with 0, or +234 format).');
      return;
    }

    if (onUpdateProfile) {
      onUpdateProfile({
        ...activeInspector,
        name: profileName,
        phone: cleanPhone.startsWith('234') ? `0${cleanPhone.slice(3)}` : cleanPhone,
        email: profileEmail,
        profilePicture: profilePic || activeInspector.profilePicture
      });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  // Inspector Onboarding states
  const [idType, setIdType] = useState("Student ID Card");
  const [idNum, setIdNum] = useState('');
  const [bankName, setBankName] = useState('Zenith Bank');
  const [accountNum, setAccountNum] = useState('');
  const [accountName, setAccountName] = useState('');

  // Report Form state
  const [water, setWater] = useState<'Excellent' | 'Good' | 'Poor' | 'Broken'>('Good');
  const [power, setPower] = useState<'Constant' | 'Scheduled (Gen/Solar)' | 'Unstable' | 'No Power'>('Scheduled (Gen/Solar)');
  const [security, setSecurity] = useState<'Highly Secured' | 'Moderately Secured' | 'Poor'>('Moderately Secured');
  const [cleanliness, setCleanliness] = useState<'Spotless' | 'Clean' | 'Average' | 'Dirty'>('Clean');
  const [match, setMatch] = useState<'Exactly as listed' | 'Minor discrepancies' | 'Major discrepancy / Fake'>('Exactly as listed');
  const [notes, setNotes] = useState('');
  const [recommendation, setRecommendation] = useState<'Highly Recommended' | 'Recommended with cautions' | 'Do Not Book'>('Highly Recommended');

  // Filter jobs by inspector's associated school directory
  const inspectorSchool = schools.find(s => s.id === activeInspector.schoolId);
  const unassignedJobs = jobs.filter(j => j.status === 'UNASSIGNED');
  const myAssignedJobs = jobs.filter(j => j.inspectorId === activeInspector.id);
  const completedJobs = myAssignedJobs.filter(j => j.status === 'COMPLETED');
  const pendingInspectionJobs = myAssignedJobs.filter(j => j.status === 'ASSIGNED');

  // Earnings calculation (N4,500 net payout per job)
  const totalEarnings = completedJobs.length * 4500;

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNum.trim() || !accountNum.trim() || !accountName.trim()) return;

    onUploadKYC({
      idType,
      idNumber: idNum,
      idImage: 'Inspector_ID_' + activeInspector.name.replace(/\s+/g, '_') + '.jpg',
      proofDoc: 'Campus_Enrollment_Doc_' + activeInspector.name.replace(/\s+/g, '_') + '.pdf',
      bankName,
      bankAccount: accountNum,
      bankAccountName: accountName
    });
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingJobId || !notes.trim()) return;

    onSubmitReport(reportingJobId, {
      waterStatus: water,
      powerStatus: power,
      securityStatus: security,
      cleanlinessStatus: cleanliness,
      matchStatus: match,
      notes: notes,
      recommendation: recommendation,
      photos: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=400'
      ]
    });

    setReportingJobId(null);
    setNotes('');
  };

  return (
    <div className="bg-wood-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* INSPECTOR PROFILE KYC GATED */}
        {activeInspector.kycStatus === 'NOT_SUBMITTED' || activeInspector.kycStatus === 'REJECTED' ? (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-wood-200/80 p-8 shadow-md">
            <div className="text-center mb-8">
              <div className="bg-amber-100 text-amber-700 p-3 rounded-2xl w-fit mx-auto mb-4">
                <ShieldAlert size={32} />
              </div>
              <h2 className="font-display font-bold text-2xl text-wood-950">Inspector Certification Gate</h2>
              <p className="text-xs text-wood-500 mt-2 max-w-md mx-auto leading-relaxed">
                Join our trusted vetting network. Verify your campus enrollment (Student ID Card) and add banking details to receive your ₦4,500 inspection fees.
              </p>
              {activeInspector.kycStatus === 'REJECTED' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-left max-w-md mx-auto mt-4 text-xs">
                  <p className="font-bold text-red-800">Verification Rejected by Admin:</p>
                  <p className="text-red-700 mt-0.5">{activeInspector.kycDetails?.rejectionReason || 'Uploaded student card matches an expired date or invalid matric number.'}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-6 text-xs text-wood-700">
              <div className="bg-wood-50 p-4 rounded-2xl border border-wood-100">
                <h3 className="font-bold text-sm text-wood-950 mb-4">1. Campus Verification Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1.5">Enrollment ID Type</label>
                    <CustomSelect
                      value={idType}
                      onChange={(val) => setIdType(val)}
                      options={[
                        { value: 'Student ID Card', label: 'Campus Student ID Card' },
                        { value: 'School Portal Registration PDF', label: 'School Portal Registration PDF' },
                        { value: 'National Identity Card (NIN)', label: 'National ID Card (NIN)' }
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1.5">Matric / Card Registration Number</label>
                    <input
                      type="text"
                      value={idNum}
                      onChange={(e) => setIdNum(e.target.value)}
                      placeholder="E.g., 180902120 or NIN-92834789012"
                      className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block font-bold mb-1.5">Upload Clear ID Document Photo (Simulated)</label>
                  <div className="border border-dashed border-wood-300 rounded-xl bg-white p-6 text-center cursor-pointer">
                    <FileText size={24} className="text-wood-400 mx-auto mb-1.5" />
                    <span className="font-semibold block text-[11px] text-wood-600">Click to upload JPG / PDF of ID</span>
                  </div>
                </div>
              </div>

              <div className="bg-wood-50 p-4 rounded-2xl border border-wood-100">
                <h3 className="font-bold text-sm text-wood-950 mb-4">2. Bank Payout Coordinates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold mb-1.5">Bank Name</label>
                    <CustomSelect
                      value={bankName}
                      onChange={(val) => setBankName(val)}
                      options={[
                        { value: 'Zenith Bank', label: 'Zenith Bank' },
                        { value: 'Access Bank', label: 'Access Bank' },
                        { value: 'Guaranty Trust Bank (GTB)', label: 'Guaranty Trust Bank (GTB)' },
                        { value: 'United Bank for Africa (UBA)', label: 'United Bank for Africa (UBA)' }
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1.5">10-Digit Bank Account Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={accountNum}
                      onChange={(e) => setAccountNum(e.target.value)}
                      placeholder="E.g., 2112233445"
                      className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1.5">Payout Account Holder Name</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="E.g., Tunde Alao"
                      className="w-full bg-white border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-wood-600 hover:bg-wood-700 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
              >
                Submit Inspector Verification Credentials
              </button>
            </form>
          </div>
        ) : activeInspector.kycStatus === 'PENDING' ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-wood-200 p-8 shadow-xs text-center space-y-6">
            <div className="bg-amber-100 text-amber-700 p-3 rounded-full w-fit mx-auto mb-4 animate-bounce">
              <Clock size={32} />
            </div>
            <h2 className="font-display font-bold text-xl text-wood-950">Documents Under Admin Vetting</h2>
            <p className="text-sm text-wood-600 leading-relaxed max-w-md mx-auto">
              Your inspector application is currently **PENDING** review. Administrators are matching your Student ID card with our target pilots.
            </p>
            <div className="bg-wood-50 p-4 rounded-2xl border border-wood-100 inline-block text-left text-xs max-w-sm">
              <p className="font-bold text-wood-950">How to bypass in this Demo:</p>
              <p className="text-wood-600 mt-1">Switch to the **ADMIN** portal using the top navbar. You can approve this inspector profile in one-click from there!</p>
            </div>
          </div>
        ) : (
          /* APPROVED INSPECTOR WORKSPACE */
          <div className="space-y-8">
            
            {/* Header / Stats Block */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-wood-200/80 shadow-2xs gap-4">
              <div>
                <span className="text-xs font-bold text-wood-500 uppercase tracking-widest flex items-center space-x-1">
                  <ClipboardCheck size={14} />
                  <span>Verified Roomly Inspector</span>
                </span>
                <h1 className="font-display font-bold text-xl sm:text-2xl text-wood-950 mt-1">Vetting Arena: {activeInspector.name}</h1>
                <p className="text-xs text-wood-600">Assigned Campus: **{inspectorSchool?.name || 'Local Pilot'}**</p>
              </div>

              <div className="flex items-center space-x-6">
                <div>
                  <span className="text-[10px] text-wood-400 font-bold uppercase tracking-wider block">Completed Jobs</span>
                  <p className="font-display font-bold text-2xl text-wood-950 mt-0.5">{completedJobs.length}</p>
                </div>
                <div className="h-8 w-px bg-wood-200"></div>
                <div>
                  <span className="text-[10px] text-wood-400 font-bold uppercase tracking-wider block">Wallet Balance (Net)</span>
                  <p className="font-display font-bold text-2xl text-emerald-700 mt-0.5">{formatNaira(totalEarnings)}</p>
                </div>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex border-b border-wood-200 pb-px space-x-2">
              <button
                onClick={() => setSubTab('available')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${subTab === 'available' ? 'bg-wood-600 text-white shadow-2xs' : 'bg-white border border-wood-200 text-wood-600 hover:text-wood-950'}`}
              >
                Available Vetting Requests ({unassignedJobs.length})
              </button>
              <button
                onClick={() => setSubTab('my-jobs')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer relative ${subTab === 'my-jobs' ? 'bg-wood-600 text-white shadow-2xs' : 'bg-white border border-wood-200 text-wood-600 hover:text-wood-950'}`}
              >
                My Active Assignments
                {pendingInspectionJobs.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">
                    {pendingInspectionJobs.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setSubTab('earnings')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${subTab === 'earnings' ? 'bg-wood-600 text-white shadow-2xs' : 'bg-white border border-wood-200 text-wood-600 hover:text-wood-950'}`}
              >
                Completed Payout Logs
              </button>
              <button
                onClick={() => setSubTab('profile')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${subTab === 'profile' ? 'bg-wood-600 text-white shadow-2xs' : 'bg-white border border-wood-200 text-wood-600 hover:text-wood-950'}`}
              >
                My Profile
              </button>
            </div>

            {/* AVAILABLE JOBS SUBTAB */}
            {subTab === 'available' && (
              <div className="space-y-4">
                {unassignedJobs.length === 0 ? (
                  <p className="text-xs text-wood-500 bg-white p-8 rounded-2xl border border-wood-200">No students are currently requesting inspections near your campus.</p>
                ) : (
                  unassignedJobs.map(job => (
                    <div key={job.id} className="bg-white border border-wood-200 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-2xs transition-all">
                      <div>
                        <h4 className="font-bold text-sm text-wood-950">{job.hostelName}</h4>
                        <p className="text-xs text-wood-500 mt-1 flex items-center"><MapPin size={12} className="mr-0.5" />{job.hostelAddress}</p>
                        <p className="text-[10px] text-wood-400 mt-1.5 font-medium">Student Requester: {job.studentName}</p>
                      </div>

                      <div className="md:text-right">
                        <span className="text-[10px] text-wood-400 uppercase font-bold tracking-wider block">Job Earnings</span>
                        <p className="font-bold text-emerald-700 text-lg mt-0.5">₦4,500 <span className="text-[10px] text-wood-400 font-normal">({formatNaira(job.fee)} gross)</span></p>
                      </div>

                      <button
                        onClick={() => onAcceptJob(job.id)}
                        className="px-4 py-2 bg-wood-600 hover:bg-wood-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
                      >
                        Claim Vetting Job
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* MY ASSIGNED ACTIVE JOBS SUBTAB */}
            {subTab === 'my-jobs' && (
              <div className="space-y-4">
                {pendingInspectionJobs.length === 0 ? (
                  <p className="text-xs text-wood-500 bg-white p-8 rounded-2xl border border-wood-200">You do not have any active claimed vetting jobs. Browse available jobs to claim assignments.</p>
                ) : (
                  pendingInspectionJobs.map(job => (
                    <div key={job.id} className="bg-white border border-wood-200 p-6 rounded-2xl space-y-4 hover:shadow-2xs transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-wood-950">{job.hostelName}</h4>
                          <p className="text-xs text-wood-500 flex items-center"><MapPin size={12} className="mr-0.5" />{job.hostelAddress}</p>
                        </div>
                        <button
                          onClick={() => setReportingJobId(job.id)}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center space-x-1"
                        >
                          <PenTool size={12} />
                          <span>Submit Vetting Report</span>
                        </button>
                      </div>

                      {/* Job details checklist */}
                      <div className="bg-wood-50 p-4 rounded-xl border border-wood-100 text-xs text-wood-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="font-bold text-wood-400 block uppercase text-[10px] tracking-wider">Student Details</span>
                          <p className="font-semibold text-wood-950 mt-1">{job.studentName}</p>
                          <p className="text-wood-500 mt-0.5">Contact through Secure Chat</p>
                        </div>
                        <div>
                          <span className="font-bold text-wood-400 block uppercase text-[10px] tracking-wider">Landlord Reference</span>
                          <p className="font-semibold text-wood-950 mt-1">{job.landlordName}</p>
                        </div>
                        <div>
                          <span className="font-bold text-wood-400 block uppercase text-[10px] tracking-wider">Assigned SLA</span>
                          <p className="font-semibold text-red-600 mt-1">Complete within 48 Hours</p>
                        </div>
                      </div>

                      {/* REPORT SUBMISSION DIALOG WINDOW */}
                      {reportingJobId === job.id && (
                        <form onSubmit={handleReportSubmit} className="bg-wood-100 p-6 rounded-2xl space-y-6 border border-wood-200/50 animate-fadeIn text-xs text-wood-700">
                          <div className="flex justify-between items-center border-b border-wood-200 pb-2">
                            <h5 className="font-display font-bold text-sm text-wood-950">Verify Structural Integrity Checklist</h5>
                            <button type="button" onClick={() => setReportingJobId(null)} className="text-wood-400 hover:text-wood-950">Cancel</button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                              <label className="block font-bold mb-1.5">🚰 Borehole Running Water</label>
                              <CustomSelect
                                value={water}
                                onChange={(val) => setWater(val as any)}
                                options={[
                                  { value: 'Excellent', label: 'Excellent Treatment' },
                                  { value: 'Good', label: 'Good/Operational' },
                                  { value: 'Poor', label: 'Poor pressure' },
                                  { value: 'Broken', label: 'Completely broken' }
                                ]}
                              />
                            </div>

                            <div>
                              <label className="block font-bold mb-1.5">⚡ Power Grid Access</label>
                              <CustomSelect
                                value={power}
                                onChange={(val) => setPower(val as any)}
                                options={[
                                  { value: 'Constant', label: 'Constant Grid' },
                                  { value: 'Scheduled (Gen/Solar)', label: 'Gen/Solar Backup' },
                                  { value: 'Unstable', label: 'Highly Unstable' },
                                  { value: 'No Power', label: 'No electrical supply' }
                                ]}
                              />
                            </div>

                            <div>
                              <label className="block font-bold mb-1.5">🛡️ Security Fencing</label>
                              <CustomSelect
                                value={security}
                                onChange={(val) => setSecurity(val as any)}
                                options={[
                                  { value: 'Highly Secured', label: 'Uniformed Guard + Gates' },
                                  { value: 'Moderately Secured', label: 'Gated fence only' },
                                  { value: 'Poor', label: 'No fence / Unsecured' }
                                ]}
                              />
                            </div>

                            <div>
                              <label className="block font-bold mb-1.5">🧼 Cleanliness Status</label>
                              <CustomSelect
                                value={cleanliness}
                                onChange={(val) => setCleanliness(val as any)}
                                options={[
                                  { value: 'Spotless', label: 'Spotless Layout' },
                                  { value: 'Clean', label: 'Neat & Swept' },
                                  { value: 'Average', label: 'Average' },
                                  { value: 'Dirty', label: 'Needs cleanup' }
                                ]}
                              />
                            </div>

                            <div>
                              <label className="block font-bold mb-1.5">📐 Visual vs Listing Match</label>
                              <CustomSelect
                                value={match}
                                onChange={(val) => setMatch(val as any)}
                                options={[
                                  { value: 'Exactly as listed', label: 'Exactly as listed' },
                                  { value: 'Minor discrepancies', label: 'Minor discrepancies' },
                                  { value: 'Major discrepancy / Fake', label: 'Fake listing / Wrong photos' }
                                ]}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                              <label className="block font-bold mb-1.5">Physically Verified Audit Notes</label>
                              <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="E.g., I checked the room 4 on Saint Finbarrs Road. Tested the borehole. Water was clean but slight rust smell. Landlord has solar panels. Gated wall is intact..."
                                className="w-full bg-white border border-wood-200 rounded-xl p-3 text-xs outline-hidden focus:ring-1 focus:ring-wood-500"
                                rows={3}
                                required
                              />
                            </div>

                            <div>
                              <label className="block font-bold mb-1.5">Final Vetting Recommendation</label>
                              <CustomSelect
                                value={recommendation}
                                onChange={(val) => setRecommendation(val as any)}
                                options={[
                                  { value: 'Highly Recommended', label: '⭐ Highly Recommended' },
                                  { value: 'Recommended with cautions', label: '⚠️ Recommended with cautions' },
                                  { value: 'Do Not Book', label: '❌ Do Not Book' }
                                ]}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2 pt-2 border-t border-wood-200">
                            <button
                              type="button"
                              onClick={() => setReportingJobId(null)}
                              className="px-4 py-2 bg-white text-wood-700 border border-wood-200 rounded-lg font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                            >
                              Submit Report & Earn ₦4,500
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* COMPLETED JOBS / EARNINGS LOG */}
            {subTab === 'earnings' && (
              <div className="bg-white border border-wood-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="p-4 bg-wood-50 border-b border-wood-100">
                  <h3 className="font-bold text-sm text-wood-950">Earnings Subaccount Log</h3>
                  <p className="text-xs text-wood-500 mt-0.5">₦4,500 payout per completed vetting, paid direct into Zenith Bank {activeInspector.kycDetails?.bankAccount}.</p>
                </div>

                <div className="divide-y divide-wood-100 text-xs">
                  {completedJobs.length === 0 ? (
                    <p className="p-8 text-center text-wood-400">You haven't completed any inspections yet.</p>
                  ) : (
                    completedJobs.map(job => (
                      <div key={job.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-wood-50/30">
                        <div>
                          <p className="font-bold text-wood-950">{job.hostelName}</p>
                          <p className="text-[10px] text-wood-400">Completed report on {formatDate(job.report?.createdAt || job.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-wood-400 block uppercase">Student Paid</span>
                          <span className="font-bold text-emerald-700">+₦4,500 <span className="text-[10px] text-wood-400 font-normal">(₦500 admin fee subtracted)</span></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* MY PROFILE SUBTAB */}
            {subTab === 'profile' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-wood-200/80 shadow-xs max-w-xl mx-auto">
                <h2 className="font-display font-bold text-xl text-wood-950 mb-1">Inspector Profile Settings</h2>
                <p className="text-xs text-wood-500 mb-6">Manage your contact details, profile photo, and check your vetting badge status.</p>

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  {updateSuccess && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
                      <CheckCircle2 size={16} className="text-emerald-600 animate-bounce" />
                      <span>Profile information has been successfully updated in settings!</span>
                    </div>
                  )}
                  {updateError && (
                    <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-800 rounded-2xl text-xs font-semibold">
                      {updateError}
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-wood-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-wood-700 mb-1">Phone Number (NGR)</label>
                      <input
                        type="tel"
                        required
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-wood-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-wood-700 mb-1">Avatar Profile Image URL</label>
                    <input
                      type="text"
                      value={profilePic}
                      onChange={(e) => setProfilePic(e.target.value)}
                      className="w-full bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500"
                    />
                  </div>

                  {/* Profile Picture Uploader Row */}
                  <div className="bg-wood-50/50 p-4 rounded-2xl border border-wood-100 flex flex-col sm:flex-row items-center gap-4 text-left">
                    <img 
                      src={profilePic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"} 
                      alt="Profile Avatar" 
                      className="w-14 h-14 rounded-full object-cover border-2 border-wood-300 shadow-xs flex-shrink-0" 
                    />
                    <div className="flex-1 w-full space-y-1.5">
                      <label className="block font-bold text-wood-700">Upload Another Profile Picture</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setProfilePic(event.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs text-wood-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-wood-800 file:text-white hover:file:bg-wood-950 file:cursor-pointer"
                      />
                      <p className="text-[10px] text-wood-400 font-semibold">Supports JPG, PNG formats. Converts to Base64 automatically.</p>
                    </div>
                  </div>

                  <div className="bg-wood-50 p-4 rounded-xl border border-wood-150 text-[11px] text-wood-600 leading-normal space-y-1">
                    <span className="font-bold text-wood-900 uppercase tracking-wide block">Audited Badge Status:</span>
                    {activeInspector.kycStatus === 'APPROVED' ? (
                      <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mt-1">
                        <CheckCircle2 size={12} className="mr-1 text-emerald-600" />
                        ID Approved Inspector
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full mt-1 animate-pulse">
                        <Clock size={12} className="mr-1 text-amber-600" />
                        Pending Admin Verification
                      </span>
                    )}
                    <p className="mt-2 text-wood-500 text-[10px]">Your vetting reports are marked as authoritative for students only after Admin verification of ID credentials.</p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-wood-900 hover:bg-wood-950 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs uppercase tracking-wider"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>

                {/* DANGER ZONE: DELETE ACCOUNT */}
                <div className="mt-8 bg-red-50/50 p-6 sm:p-8 rounded-3xl border border-red-200 shadow-xs text-left space-y-4">
                  <div className="flex items-start space-x-3 text-red-800">
                    <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-display font-bold text-base text-red-950">Danger Zone</h3>
                      <p className="text-xs text-red-700 mt-0.5 leading-normal">
                        Deleting your account is permanent. This will erase all your assigned inspections, vetting histories, and profile details from our database immediately.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you absolutely sure you want to permanently delete your Inspector account? This action is completely irreversible.")) {
                          if (onDeleteAccount) {
                            onDeleteAccount(activeInspector.id);
                          }
                        }
                      }}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs uppercase tracking-wider"
                    >
                      Permanently Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
export {};
