import React, { useState, useRef, useEffect } from 'react';
import { Send, Shield, AlertTriangle, MessageSquare, Info, UserCheck, ShieldCheck } from 'lucide-react';
import { ChatThread, Message, User } from '../types';
import { formatDate } from '../utils';
import { checkMessageContactSharing } from '../state';

interface ChatInboxProps {
  activeUser: User;
  threads: ChatThread[];
  messages: Message[];
  onSendMessage: (threadId: string, text: string) => { success: boolean; error?: string };
}

export default function ChatInbox({ activeUser, threads, messages, onSendMessage }: ChatInboxProps) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(threads[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const [blockedAlert, setBlockedAlert] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter threads that belong to the active student or active other roles
  const userThreads = threads.filter(thread => 
    activeUser.role === 'STUDENT' ? thread.studentId === activeUser.id : thread.otherId === activeUser.id
  );

  const activeThread = userThreads.find(t => t.id === selectedThreadId) || userThreads[0] || null;
  const activeThreadMessages = activeThread ? messages.filter(m => m.threadId === activeThread.id) : [];

  useEffect(() => {
    if (activeThread && !selectedThreadId) {
      setSelectedThreadId(activeThread.id);
    }
  }, [activeThread, selectedThreadId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThreadMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThread) return;

    // Run the contact sharing prevention check
    const filterResult = checkMessageContactSharing(inputText);

    if (filterResult.isBlocked) {
      setBlockedAlert(filterResult.reason || 'Message blocked.');
      // Auto-clear alert after 6 seconds
      setTimeout(() => {
        setBlockedAlert(null);
      }, 7000);
      return;
    }

    // If clean, send message
    onSendMessage(activeThread.id, inputText);
    setInputText('');
    setBlockedAlert(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-10rem)]">
      <div className="bg-white border border-wood-200 rounded-3xl overflow-hidden shadow-xs h-full flex flex-col md:flex-row">
        {/* Threads List (Left Pane) */}
        <div className="w-full md:w-80 border-r border-wood-200 flex flex-col h-1/3 md:h-full bg-wood-50/20">
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
                <p className="text-sm">No active chats yet.</p>
                <p className="text-xs mt-1">Chat will unlock when you initiate a hostel booking, inspection, or roommate inquiry.</p>
              </div>
            ) : (
              userThreads.map(thread => {
                const isSelected = activeThread?.id === thread.id;
                return (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setSelectedThreadId(thread.id);
                      setBlockedAlert(null);
                    }}
                    className={`w-full text-left p-4 hover:bg-wood-100/50 transition-all flex items-start space-x-3 cursor-pointer ${isSelected ? 'bg-wood-100 font-medium' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-wood-200 font-bold text-wood-700 flex items-center justify-center border border-wood-200 flex-shrink-0 text-sm">
                      {thread.otherName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-wood-950 truncate">
                          {activeUser.role === 'STUDENT' ? thread.otherName : 'Student: ' + thread.otherName}
                        </h4>
                      </div>
                      <p className="text-xs text-wood-400 font-semibold uppercase tracking-wider mt-0.5">
                        {thread.hostelName ? thread.hostelName : 'Roommate Inquiry'}
                      </p>
                      <p className="text-xs text-wood-600 truncate mt-1">{thread.lastMessageText}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Conversation View (Right Pane) */}
        <div className="flex-1 flex flex-col h-2/3 md:h-full bg-white relative">
          {activeThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-wood-200 bg-white flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-wood-500 text-white font-bold flex items-center justify-center text-sm">
                    {activeThread.otherName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-wood-950 text-sm leading-snug">
                      {activeUser.role === 'STUDENT' ? activeThread.otherName : activeThread.otherName}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-wood-500 font-medium mt-0.5">
                      <span className="px-1.5 py-0.5 bg-wood-100 rounded text-[10px] font-semibold text-wood-700 uppercase">
                        {activeUser.role === 'STUDENT' ? activeThread.otherRole : 'Student'}
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

                <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-medium">
                  <ShieldCheck size={14} />
                  <span>Escrow-Guaranteed Line</span>
                </div>
              </div>

              {/* Secure Chat Advice */}
              <div className="bg-wood-50 border-b border-wood-100 p-3 px-4 flex items-start space-x-2.5">
                <Info size={14} className="text-wood-600 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-wood-600 leading-normal">
                  <strong>Safety Notice:</strong> To protect our students from fraud, sharing phone numbers, emails, or social links is disabled. If you make transactions or communicate outside this box, you lose all Dormiversity ₦ Escrow Protection.
                </p>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-wood-50/10">
                {activeThreadMessages.map(msg => {
                  const isMe = msg.senderId === activeUser.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Message Bubble */}
                      <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed shadow-2xs ${
                        isMe 
                          ? 'bg-wood-600 text-white rounded-br-none' 
                          : 'bg-wood-100 text-wood-950 rounded-bl-none border border-wood-200/50'
                      }`}>
                        {msg.isBlocked ? (
                          <div className="flex items-start space-x-1 text-red-500 italic">
                            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                            <span>[Message blocked for contact-sharing attempt]</span>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
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
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (blockedAlert) setBlockedAlert(null); // Clear on retyping
                  }}
                  placeholder="Type your message securely... (phone, emails, and links are blocked)"
                  className="flex-1 bg-wood-50 border border-wood-200 focus:border-wood-500 rounded-xl px-4 py-3 text-sm text-wood-950 outline-hidden placeholder-wood-400 focus:ring-1 focus:ring-wood-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-wood-600 hover:bg-wood-700 disabled:bg-wood-200 text-white p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-wood-50/20">
              <MessageSquare size={48} className="text-wood-300 mb-4" />
              <h3 className="font-display font-bold text-lg text-wood-950">Select a Secure Chat Line</h3>
              <p className="text-xs text-wood-500 max-w-sm mt-1 leading-relaxed">
                Connect with prospective roommates, landlords, or Roomly inspectors. All correspondence is securely moderated to prevent housing scams.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
