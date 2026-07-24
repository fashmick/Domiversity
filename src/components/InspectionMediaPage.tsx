import React, { useState } from 'react';
import { Camera, Search, User, Home, ShieldCheck, MapPin, Calendar, ExternalLink, Filter, Eye, Phone, Mail, Sparkles } from 'lucide-react';
import { User as PlatformUser, School, Hostel, Booking, InspectorJob, Message, ChatThread } from '../types';
import { formatDate, formatNaira } from '../utils';

interface InspectionMediaPageProps {
  users: PlatformUser[];
  schools: School[];
  hostels: Hostel[];
  bookings: Booking[];
  jobs: InspectorJob[];
  chats: ChatThread[];
  messages: Message[];
}

export default function InspectionMediaPage({
  users,
  schools,
  hostels,
  bookings,
  jobs,
  chats,
  messages
}: InspectionMediaPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [selectedImageModal, setSelectedImageModal] = useState<any | null>(null);

  // Aggregate all inspection media items from both Inspector Reports AND Chat Message Photo Attachments
  const mediaRecords: Array<{
    id: string;
    photoUrl: string;
    source: 'REPORT' | 'MESSAGE';
    uploadedAt: string;
    caption?: string;
    inspectorName: string;
    inspectorPhoto?: string;
    studentName: string;
    studentPhone?: string;
    studentEmail?: string;
    hostelName: string;
    hostelAddress?: string;
    schoolName?: string;
    landlordName?: string;
    landlordPhone?: string;
  }> = [];

  // 1. From Inspector Reports submitted in jobs
  jobs.forEach(job => {
    if (job.report && job.report.photos && job.report.photos.length > 0) {
      const hostel = hostels.find(h => h.id === job.hostelId);
      const student = users.find(u => u.id === job.studentId);
      const landlord = users.find(u => u.id === job.landlordId);
      const inspector = users.find(u => u.id === job.inspectorId) || users.find(u => u.role === 'INSPECTOR');
      const school = schools.find(s => s.id === hostel?.schoolId);

      job.report.photos.forEach((photoUrl, idx) => {
        mediaRecords.push({
          id: `report_media_${job.id}_${idx}`,
          photoUrl,
          source: 'REPORT',
          uploadedAt: job.report?.createdAt || job.createdAt,
          caption: `Official Inspection Findings: ${job.report?.notes || 'Structural checking protocol completed.'}`,
          inspectorName: job.inspectorName || inspector?.name || 'Vetted Roomly Inspector',
          inspectorPhoto: inspector?.profilePicture,
          studentName: job.studentName || student?.name || 'Student Tenant',
          studentPhone: student?.phone,
          studentEmail: student?.email,
          hostelName: job.hostelName || hostel?.name || 'Off-Campus Hostel',
          hostelAddress: job.hostelAddress || hostel?.address,
          schoolName: school?.name,
          landlordName: job.landlordName || landlord?.name,
          landlordPhone: landlord?.phone
        });
      });
    }
  });

  // 2. From Chat Messages sent by Inspectors with photo attachments or image links
  messages.forEach(msg => {
    if (msg.isBlocked) return;
    
    // Check if message has attachments or image URL pattern
    const isImageAttachment = (msg.attachments && msg.attachments.length > 0) || 
      /https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)|unsplash\.com/i.test(msg.text);

    if (isImageAttachment) {
      const thread = chats.find(c => c.id === msg.threadId);
      const sender = users.find(u => u.id === msg.senderId);
      
      // We check if sender is inspector or if thread involves inspection
      const isInspectorMsg = sender?.role === 'INSPECTOR' || msg.senderName.toLowerCase().includes('inspector');

      if (isInspectorMsg && thread) {
        const student = users.find(u => u.id === thread.studentId);
        const landlord = users.find(u => u.id === thread.otherId);
        const hostel = hostels.find(h => h.id === thread.hostelId);
        const school = schools.find(s => s.id === hostel?.schoolId);

        const photoUrls = msg.attachments && msg.attachments.length > 0 
          ? msg.attachments 
          : (msg.text.match(/https?:\/\/[^\s]+(?:\.png|\.jpg|\.jpeg|\.gif|\.webp|unsplash)/gi) || []);

        photoUrls.forEach((photoUrl, idx) => {
          mediaRecords.push({
            id: `msg_media_${msg.id}_${idx}`,
            photoUrl,
            source: 'MESSAGE',
            uploadedAt: msg.createdAt,
            caption: msg.text || 'Inspection photo uploaded via live escrow messaging.',
            inspectorName: msg.senderName,
            inspectorPhoto: sender?.profilePicture,
            studentName: student?.name || 'Student Tenant',
            studentPhone: student?.phone,
            studentEmail: student?.email,
            hostelName: thread.hostelName || hostel?.name || 'Inspected Hostel',
            hostelAddress: hostel?.address,
            schoolName: school?.name,
            landlordName: landlord?.name,
            landlordPhone: landlord?.phone
          });
        });
      }
    }
  });

  // Filter records by search term and selected school
  const filteredRecords = mediaRecords.filter(rec => {
    const matchesSearch = !searchTerm.trim() || 
      rec.hostelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.inspectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.landlordName && rec.landlordName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rec.caption && rec.caption.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSchool = !selectedSchoolId || (rec.schoolName && rec.schoolName.toLowerCase().includes(
      schools.find(s => s.id === selectedSchoolId)?.name.toLowerCase() || ''
    ));

    return matchesSearch && matchesSchool;
  });

  return (
    <div className="bg-wood-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Banner Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-wood-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-xs font-bold mb-3">
                <Camera size={14} className="text-amber-700" />
                <span>Audited Structural Photo Bank</span>
              </div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-wood-950">
                Inspected Hostel Media Records
              </h1>
              <p className="text-xs sm:text-sm text-wood-600 mt-1 max-w-2xl leading-relaxed">
                Central gallery storing all live inspection photos uploaded by certified student inspectors in messaging and report logs. Matches hiring students with inspected landlords.
              </p>
            </div>

            <div className="bg-wood-50 p-4 rounded-2xl border border-wood-150 flex items-center space-x-4 shrink-0">
              <div className="text-center px-2">
                <span className="block text-2xl font-black font-display text-wood-950">{filteredRecords.length}</span>
                <span className="text-[10px] font-bold text-wood-500 uppercase tracking-wider">Media Records</span>
              </div>
              <div className="h-8 w-px bg-wood-200"></div>
              <div className="text-center px-2">
                <span className="block text-2xl font-black font-display text-emerald-700">100%</span>
                <span className="text-[10px] font-bold text-wood-500 uppercase tracking-wider">Vetted Proof</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-6 pt-6 border-t border-wood-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wood-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by hostel, student, inspector, or landlord name..."
                className="w-full pl-10 pr-4 py-2.5 bg-wood-50 border border-wood-200 rounded-xl text-xs text-wood-900 outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-wood-400 shrink-0" />
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="w-full py-2.5 px-3 bg-wood-50 border border-wood-200 rounded-xl text-xs text-wood-900 outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                <option value="">All Schools & Institutions</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>
                    {school.name} ({school.abbreviation || school.state})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-3xl border border-wood-200 p-12 text-center text-wood-500 space-y-3">
            <div className="w-12 h-12 bg-wood-100 text-wood-500 rounded-full flex items-center justify-center mx-auto">
              <Camera size={24} />
            </div>
            <h3 className="font-bold text-base text-wood-900">No Inspection Photos Found</h3>
            <p className="text-xs text-wood-500 max-w-md mx-auto">
              No live inspection photos match your active search filters. When an inspector sends photos in a chat or submits a structural report, they will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-3xl border border-wood-200 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                {/* Photo Header & Image Preview */}
                <div className="relative aspect-4/3 bg-wood-900 overflow-hidden cursor-pointer" onClick={() => setSelectedImageModal(rec)}>
                  <img
                    src={rec.photoUrl}
                    alt={rec.hostelName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20"></div>

                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-white/20">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    <span>{rec.source === 'REPORT' ? 'Official Inspection Report' : 'In-Chat Live Upload'}</span>
                  </div>

                  <button className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-colors">
                    <Eye size={14} />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-sm truncate drop-shadow-sm">{rec.hostelName}</h3>
                    <p className="text-[10px] text-wood-200 truncate flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      <span>{rec.hostelAddress || rec.schoolName || 'Near Campus'}</span>
                    </p>
                  </div>
                </div>

                {/* Info Metadata */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-xs">
                  {/* Caption Note */}
                  <p className="text-wood-700 bg-wood-50 p-3 rounded-2xl border border-wood-100 italic leading-relaxed text-[11px]">
                    "{rec.caption}"
                  </p>

                  <div className="space-y-2.5 divide-y divide-wood-100 text-[11px]">
                    {/* Student Who Hired */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-wood-500 font-medium flex items-center gap-1">
                        <User size={12} className="text-wood-400" />
                        <span>Student Hired:</span>
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-wood-950 block">{rec.studentName}</span>
                        {rec.studentPhone && <span className="text-[10px] text-wood-500">{rec.studentPhone}</span>}
                      </div>
                    </div>

                    {/* Landlord Hostel */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-wood-500 font-medium flex items-center gap-1">
                        <Home size={12} className="text-wood-400" />
                        <span>Landlord:</span>
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-wood-950 block">{rec.landlordName || 'Property Manager'}</span>
                        {rec.landlordPhone && <span className="text-[10px] text-wood-500">{rec.landlordPhone}</span>}
                      </div>
                    </div>

                    {/* Inspector */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-wood-500 font-medium flex items-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        <span>Inspector:</span>
                      </span>
                      <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {rec.inspectorName}
                      </span>
                    </div>
                  </div>

                  {/* Upload Timestamp */}
                  <div className="pt-2 border-t border-wood-100 flex items-center justify-between text-[10px] text-wood-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{formatDate(rec.uploadedAt)}</span>
                    </span>
                    <button
                      onClick={() => setSelectedImageModal(rec)}
                      className="text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                    >
                      View Full Resolution
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Image Lightbox Modal */}
      {selectedImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedImageModal(null)}
              className="absolute top-4 right-4 text-wood-400 hover:text-wood-900 font-bold text-sm bg-wood-100 hover:bg-wood-200 px-3 py-1 rounded-full cursor-pointer"
            >
              ✕ Close
            </button>

            <h3 className="font-display font-bold text-xl text-wood-950 mb-1">{selectedImageModal.hostelName}</h3>
            <p className="text-xs text-wood-500 mb-4 flex items-center gap-1">
              <MapPin size={12} />
              <span>{selectedImageModal.hostelAddress || selectedImageModal.schoolName}</span>
            </p>

            <div className="rounded-2xl overflow-hidden bg-wood-900 mb-4 border border-wood-200">
              <img
                src={selectedImageModal.photoUrl}
                alt="Enlarged inspection media"
                referrerPolicy="no-referrer"
                className="w-full max-h-[500px] object-contain mx-auto"
              />
            </div>

            <div className="bg-wood-50 p-4 rounded-2xl border border-wood-100 space-y-3 text-xs text-wood-800">
              <p className="font-medium text-wood-900 italic">"{selectedImageModal.caption}"</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-wood-200 text-[11px]">
                <div>
                  <span className="text-wood-400 block font-bold">Hiring Student Tenant:</span>
                  <span className="font-bold text-wood-950">{selectedImageModal.studentName}</span>
                  {selectedImageModal.studentPhone && <p className="text-[10px] text-wood-600">{selectedImageModal.studentPhone}</p>}
                </div>
                <div>
                  <span className="text-wood-400 block font-bold">Landlord / Owner:</span>
                  <span className="font-bold text-wood-950">{selectedImageModal.landlordName || 'N/A'}</span>
                  {selectedImageModal.landlordPhone && <p className="text-[10px] text-wood-600">{selectedImageModal.landlordPhone}</p>}
                </div>
                <div>
                  <span className="text-wood-400 block font-bold">Assigned Inspector:</span>
                  <span className="font-bold text-emerald-800">{selectedImageModal.inspectorName}</span>
                  <p className="text-[10px] text-wood-500">{formatDate(selectedImageModal.uploadedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
