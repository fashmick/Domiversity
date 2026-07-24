import React, { useState, useRef, useEffect } from 'react';
import { Send, Shield, AlertTriangle, MessageSquare, Info, ShieldCheck, ArrowLeft, Camera, Image as ImageIcon, X } from 'lucide-react';
import { ChatThread, Message, User } from '../types';
import { formatDate } from '../utils';
import { checkMessageContactSharing } from '../state';

interface ChatInboxProps {
  activeUser: User;
  allUsers: User[];
  threads: ChatThread[];
  messages: Message[];
  onSendMessage: (threadId: string, text: string, attachments?: string[]) => { success: boolean; error?: string };
  selectedThreadId?: string | null;
  onSelectThread?: (threadId: string | null) => void;
}

export default function ChatInbox({
  activeUser,
  allUsers = [],
  threads,
  messages,
  onSendMessage,
  selectedThreadId: propSelectedThreadId,
  onSelectThread: propOnSelectThread
}: ChatInboxProps) {
  const [internalSelectedThreadId, setInternalSelectedThreadId] = useState<string | null>(threads[0]?.id || null);

  const selectedThreadId = propSelectedThreadId !== undefined ? propSelectedThreadId : internalSelectedThreadId;
  const setSelectedThreadId = (id: string | null) => {
    if (propOnSelectThread) {
      propOnSelectThread(id);
    } else {
      setInternalSelectedThreadId(id);
    }
  };

  const [inputText, setInputText] = useState('');
  const [blockedAlert, setBlockedAlert] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample inspection photos inspectors can quickly attach
  const SAMPLE_INSPECTION_PHOTOS = [
    { label: 'Room Interior & Lighting', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600' },
    { label: 'Running Water Tap Test', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600' },
    { label: 'Bathroom & Sanitary Check', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600' },
    { label: 'Hostel Compound & Security Gate', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=600' }
  ];

  // Filter threads that belong to the active user (either as the initiator studentId or the otherId)
  const userThreads = threads.filter(thread => 
    thread.studentId === activeUser.id || thread.otherId === activeUser.id
  );

  // Helper to resolve the other person in the thread dynamically to prevent name mismatch
  const getThreadPartner = (thread: any) => {
    const partnerId = thread.studentId === activeUser.id ? thread.otherId : thread.studentId;
    const partner = allUsers.find(u => u.id === partnerId);
    return {
      id: partnerId,
      name: partner ? partner.name : (thread.studentId === activeUser.id ? thread.otherName : 'User'),
      role: partner ? partner.role : (thread.studentId === activeUser.id ? thread.otherRole : 'STUDENT'),
      avatar: partner?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
    };
  };

  const activeThread = userThreads.find(t => t.id === selectedThreadId) || null;
  const activeThreadMessages = activeThread ? messages.filter(m => m.threadId === activeThread.id) : [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThreadMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && selectedAttachments.length === 0) || !activeThread) return;

    // Run the contact sharing prevention check on text
    if (inputText.trim()) {
      const filterResult = checkMessageContactSharing(inputText);

      if (filterResult.isBlocked) {
        setBlockedAlert(filterResult.reason || 'Message blocked.');
        setTimeout(() => {
          setBlockedAlert(null);
        }, 7000);
        return;
      }
    }

    // Send message with attachments
    onSendMessage(activeThread.id, inputText, selectedAttachments.length > 0 ? selectedAttachments : undefined);
    setInputText('');
    setSelectedAttachments([]);
    setBlockedAlert(null);
  };

  return (
    <div className="w-full bg-wood-50/40 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Threads List Pane */}
        <div className={`w-full md:w-85 border-r border-wood-200 flex flex-col h-full bg-white flex-shrink-0 ${
          selectedThreadId && activeThread ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-4 border-b border-wood-200 bg-white">
            <h2 className="font-display font-bold text-lg text-wood-950 flex items-center space-x-2">
              <MessageSquare size={18} className="text-wood-600" />
              <span>Secure Inbox</span>
            </h2>
            <p className="text-xs text-wood-500 mt-1 flex items-center space-x-1">
              <Shield size={12} className="text-amber-500" />
              <span>Dormiversity contact protection active</span>
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-wood-100">
            {userThreads.length === 0 ? (
              <div className="p-8 text-center text-wood-400">
                <p className="text-sm font-semibold">No active chats yet.</p>
                <p className="text-xs mt-1.5 leading-relaxed">
                  Chat will unlock when you initiate a hostel booking, inspection request, or roommate inquiry.
                </p>
              </div>
            ) : (
              userThreads.map(thread => {
                const isSelected = activeThread?.id === thread.id;
                const partner = getThreadPartner(thread);
                return (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setSelectedThreadId(thread.id);
                      setBlockedAlert(null);
                    }}
                    className={`w-full text-left p-4 hover:bg-wood-50 transition-all flex items-start space-x-3 cursor-pointer ${
                      isSelected ? 'bg-wood-100/70 font-medium border-l-4 border-wood-600' : ''
                    }`}
                  >
                    {partner.avatar ? (
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border border-wood-200/55 object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-wood-200 font-bold text-wood-700 flex items-center justify-center border border-wood-200/50 flex-shrink-0 text-sm">
                        {partner.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-wood-950 truncate">
                          {partner.name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-wood-400 font-bold uppercase tracking-wider mt-0.5 truncate">
                        {thread.hostelName ? thread.hostelName : 'Roommate Inquiry'}
                      </p>
                      <p className="text-xs text-wood-600 truncate mt-1.5">{thread.lastMessageText}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Conversation View Pane */}
        <div className={`flex-1 flex flex-col h-full bg-white relative ${
          !selectedThreadId || !activeThread ? 'hidden md:flex' : 'flex'
        }`}>
          {activeThread ? (
            <>
              {/* Thread Header */}
              {(() => {
                const partner = getThreadPartner(activeThread);
                return (
                  <div className="p-4 border-b border-wood-200 bg-white flex items-center justify-between shadow-2xs">
                    <div className="flex items-center space-x-3">
                      {/* Mobile Back Button */}
                      <button
                        onClick={() => setSelectedThreadId(null)}
                        className="md:hidden p-2 -ml-1 hover:bg-wood-100 rounded-xl text-wood-600 transition-colors cursor-pointer"
                        title="Back to Chats List"
                      >
                        <ArrowLeft size={20} />
                      </button>

                      {partner.avatar ? (
                        <img
                          src={partner.avatar}
                          alt={partner.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full border border-wood-200/55 object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-wood-600 text-white font-bold flex items-center justify-center text-sm">
                          {partner.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-wood-950 text-sm leading-snug">
                          {partner.name}
                        </h3>
                        <div className="flex items-center space-x-1.5 text-xs text-wood-500 font-medium mt-0.5">
                          <span className="px-1.5 py-0.5 bg-wood-100 rounded text-[10px] font-semibold text-wood-700 uppercase">
                            {partner.role}
                          </span>
                          {activeThread.hostelName && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[120px] sm:max-w-[200px] text-wood-600">
                                Hostel: {activeThread.hostelName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-semibold">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>Escrow Protection Line</span>
                    </div>
                  </div>
                );
              })()}

              {/* Secure Chat Advice */}
              <div className="bg-wood-50 border-b border-wood-100 p-3 px-4 flex items-start space-x-2.5">
                <Info size={14} className="text-wood-600 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-wood-600 leading-normal">
                  <strong>Safety Protocol:</strong> To protect our students from fraud, sharing phone numbers, emails, or social handles is disallowed. Communicating or transacting outside this secure line voids the ₦ Escrow Guarantee.
                </p>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-wood-50/10">
                {activeThreadMessages.map(msg => {
                  const isMe = msg.senderId === activeUser.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Message Bubble */}
                      <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed shadow-3xs ${
                        isMe 
                          ? 'bg-wood-700 text-white rounded-br-none' 
                          : 'bg-wood-100 text-wood-950 rounded-bl-none border border-wood-200/40'
                      }`}>
                        {msg.isBlocked ? (
                          <div className="flex items-start space-x-1 text-red-500 italic">
                            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                            <span>[Message blocked for contact-sharing attempt]</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {msg.attachments.map((imgUrl, i) => (
                                  <a key={i} href={imgUrl} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border border-black/10 group relative">
                                    <img src={imgUrl} alt="Inspection Attachment" referrerPolicy="no-referrer" className="w-full h-36 object-cover group-hover:scale-105 transition-transform" />
                                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">Inspection Photo</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Message Metadata */}
                      <span className="text-[10px] text-wood-400 mt-1 font-semibold">
                        {msg.senderName} • {formatDate(msg.createdAt)}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Selected Photo Attachments Preview bar */}
              {selectedAttachments.length > 0 && (
                <div className="p-3 bg-wood-50 border-t border-wood-200 flex items-center gap-2 overflow-x-auto">
                  <span className="text-[10px] font-bold text-wood-600 uppercase shrink-0">Attachments:</span>
                  {selectedAttachments.map((url, idx) => (
                    <div key={idx} className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-wood-300">
                      <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setSelectedAttachments(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 text-[9px]"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Blocked Message Alert Toast */}
              {blockedAlert && (
                <div className="absolute bottom-20 left-4 right-4 bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start space-x-2.5 shadow-lg animate-bounce z-10">
                  <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <h5 className="text-xs font-bold text-amber-800">Message Intercepted & Blocked</h5>
                    <p className="text-[11px] text-amber-700 leading-normal mt-0.5">{blockedAlert}</p>
                  </div>
                </div>
              )}

              {/* Chat Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-wood-200 bg-white flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="p-3 bg-wood-100 hover:bg-amber-100 text-wood-700 hover:text-amber-900 rounded-xl transition-all cursor-pointer flex-shrink-0"
                  title="Upload Inspection Photo"
                >
                  <Camera size={18} />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (blockedAlert) setBlockedAlert(null); // Clear on retyping
                  }}
                  placeholder="Type your message securely or attach inspection proof..."
                  className="flex-1 bg-wood-50 border border-wood-200 focus:border-wood-500 rounded-xl px-4 py-3 text-sm text-wood-950 outline-hidden placeholder-wood-400 focus:ring-1 focus:ring-wood-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() && selectedAttachments.length === 0}
                  className="bg-wood-600 hover:bg-wood-700 disabled:bg-wood-200 text-white p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-wood-50/10">
              <MessageSquare size={48} className="text-wood-300 mb-4" />
              <h3 className="font-display font-bold text-lg text-wood-950">Select a Secure Chat Line</h3>
              <p className="text-xs text-wood-500 max-w-sm mt-1 leading-relaxed">
                Connect with prospective roommates, landlords, or local student inspectors. All messages are securely audited to prevent tertiary student housing fraud.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Attach Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-wood-200 shadow-2xl relative">
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-4 right-4 text-wood-400 hover:text-wood-900 font-bold p-1 rounded-full cursor-pointer"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="font-display font-bold text-lg text-wood-950 flex items-center gap-2">
                <Camera size={20} className="text-amber-600" />
                <span>Attach Inspection Photo</span>
              </h3>
              <p className="text-xs text-wood-500 mt-1">
                Upload room, tap water, power, or security gate photos. Pictures sent here are stored directly on the <strong>Inspected Media Records</strong> page.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-wood-800">Choose Sample Inspection Photo:</label>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_INSPECTION_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedAttachments(prev => [...prev, sample.url]);
                      setShowPhotoModal(false);
                    }}
                    className="p-2 bg-wood-50 hover:bg-amber-50 border border-wood-200 hover:border-amber-300 rounded-xl text-left flex items-center gap-2.5 transition-all cursor-pointer group"
                  >
                    <img src={sample.url} alt={sample.label} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                    <span className="text-[11px] font-bold text-wood-800 group-hover:text-amber-950 line-clamp-2">{sample.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-wood-800 mb-1">Or Paste Direct Image URL:</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customPhotoUrl}
                    onChange={(e) => setCustomPhotoUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 bg-wood-50 border border-wood-200 rounded-xl px-3 py-2 text-xs text-wood-900 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customPhotoUrl.trim()) {
                        setSelectedAttachments(prev => [...prev, customPhotoUrl.trim()]);
                        setCustomPhotoUrl('');
                        setShowPhotoModal(false);
                      }
                    }}
                    className="px-4 py-2 bg-wood-800 hover:bg-wood-900 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Attach
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
