import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, Menu, X, ChevronDown, ShieldAlert, LogOut, Settings, Compass, Users, Bookmark, CreditCard, ShieldCheck, Bot, HelpCircle, Receipt, Camera, Sun, Moon } from 'lucide-react';
import { User, UserRole } from '../types';
import DormiversityLogo from './DormiversityLogo';

interface NavigationProps {
  activeUser: User;
  allUsers: User[];
  currentRole: UserRole;
  onSwitchUser: (userId: string) => void;
  onNavigate: (tab: string) => void;
  activeTab: string;
  onLogout: () => void;
  unreadMessagesCount: number;
}

export default function Navigation({
  activeUser,
  allUsers,
  currentRole,
  onSwitchUser,
  onNavigate,
  activeTab,
  onLogout,
  unreadMessagesCount
}: NavigationProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Global theme switcher state (Wood-inspired vs Late-Night High-Contrast Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('dormiversity_theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dormiversity_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dormiversity_theme', 'wood');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <nav className="bg-white border-b border-wood-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate('dashboard')}>
              <DormiversityLogo size={34} showText={true} textSize="text-lg" textColor="text-wood-900" />
            </div>
          </div>

          {/* Right Section: User Info, Avatar, Theme Toggle & Menu Button */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* User Profile Badge */}
            {currentRole !== 'STUDENT' && currentRole !== 'LANDLORD' && (
              <div className="bg-wood-50 text-wood-900 border border-wood-200 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 text-xs font-semibold shadow-xs">
                <span className="hidden sm:inline-block">Signed In As:</span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold text-white ${
                  currentRole === 'INSPECTOR' ? 'bg-amber-600' : 'bg-red-600'
                }`}>
                  {currentRole}
                </span>
                <span className="max-w-[80px] sm:max-w-[120px] truncate font-medium">{activeUser.name}</span>
              </div>
            )}

            {/* Global Theme Toggle Button (Top Bar) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDarkMode ? "Switch to Wood-Inspired Theme" : "Switch to Late-Night High-Contrast Dark Mode"}
              aria-label="Toggle theme"
              className="p-2 rounded-xl transition-all cursor-pointer bg-wood-100 hover:bg-wood-200 text-wood-800 border border-wood-250 shadow-2xs flex items-center justify-center"
            >
              {isDarkMode ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} className="text-wood-800" />
              )}
            </button>

            {/* Profile Avatar, Menu & Actions */}
            <div className="flex items-center space-x-2.5">
              {/* Menu Button (Desktop) */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="hidden sm:flex px-3.5 py-2 rounded-xl text-xs font-bold transition-all items-center space-x-2 bg-wood-900 hover:bg-wood-850 text-white shadow-xs hover:shadow-sm cursor-pointer mr-2"
              >
                <Menu size={14} />
                <span>Menu</span>
                {unreadMessagesCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white animate-pulse">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="w-9 h-9 rounded-full bg-wood-200 overflow-hidden border border-wood-250 focus:outline-none transition-all cursor-pointer hover:ring-2 hover:ring-wood-500"
                title="View My Profile & Settings"
              >
                {activeUser.profilePicture ? (
                  <img src={activeUser.profilePicture} alt={activeUser.name} className="w-full h-full object-cover animate-fadeIn" />
                ) : (
                  <div className="w-full h-full bg-wood-500 text-white font-bold flex items-center justify-center text-sm">
                    {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </button>

              <button
                onClick={onLogout}
                title="Exit Demo Portal to Landing Page"
                className="text-wood-500 hover:text-red-600 p-2 rounded-xl hover:bg-wood-100 transition-colors cursor-pointer"
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile Menu Button (Hamburger) */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-wood-500 hover:text-wood-950 hover:bg-wood-100 focus:outline-hidden cursor-pointer"
              >
                {drawerOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Side Drawer */}
      <>
        {/* Backdrop Overlay with transition */}
        <div
          className={`fixed inset-0 bg-black/45 z-50 transition-opacity duration-300 ease-in-out ${
            drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setDrawerOpen(false)}
        />

        {/* Drawer Panel sliding in from left */}
        <div
          className={`fixed top-0 left-0 bottom-0 w-72 max-w-full bg-white z-50 shadow-2xl border-r border-wood-200 flex flex-col transform transition-transform duration-350 ease-in-out ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-wood-100 flex items-center justify-between bg-wood-50/50">
            <div className="flex items-center space-x-2">
              <DormiversityLogo size={32} showText={true} textSize="text-md font-bold" textColor="text-wood-950" />
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded-lg text-wood-500 hover:text-wood-950 hover:bg-wood-100 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Account Card */}
          <button 
            type="button"
            onClick={() => { onNavigate('profile'); setDrawerOpen(false); }}
            className="w-full text-left px-5 py-4 border-b border-wood-100 bg-white hover:bg-wood-50/50 transition-colors focus:outline-none cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-wood-100 overflow-hidden border border-wood-200">
                {activeUser.profilePicture ? (
                  <img src={activeUser.profilePicture} alt={activeUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-wood-550 text-white font-bold flex items-center justify-center text-sm">
                    {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-wood-950 truncate">{activeUser.name}</h4>
                <p className="text-[10px] text-wood-500 font-semibold tracking-wider uppercase">
                  {currentRole === 'STUDENT' ? 'Student Portal' :
                   currentRole === 'LANDLORD' ? 'Landlord Portal' :
                   currentRole === 'INSPECTOR' ? 'Inspector Portal' : 'Admin Portal'}
                </p>
              </div>
            </div>
          </button>

          {/* Theme Switcher Toggle Card inside Drawer */}
          <div className="px-4 py-3 mx-3.5 my-2.5 bg-wood-50 rounded-2xl border border-wood-200 flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2.5 text-xs font-bold text-wood-950">
              {isDarkMode ? <Moon size={16} className="text-amber-400" /> : <Sun size={16} className="text-amber-600" />}
              <span>{isDarkMode ? 'Late-Night Dark Mode' : 'Wood Theme'}</span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDarkMode ? 'bg-amber-600' : 'bg-wood-300'
              }`}
              role="switch"
              aria-checked={isDarkMode}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Navigation links inside drawer */}
          <div className="flex-1 overflow-y-auto py-3 px-3.5 space-y-1 bg-white">
            {currentRole === 'STUDENT' && (
              <>
                <button
                  onClick={() => { onNavigate('dashboard'); setDrawerOpen(false); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-wood-100 text-wood-950 shadow-xs'
                      : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
                  }`}
                >
                  <Compass size={16} className={activeTab === 'dashboard' ? 'text-wood-900' : 'text-wood-500'} />
                  <span>Hostels Search</span>
                </button>

                <button
                  onClick={() => { onNavigate('roommates'); setDrawerOpen(false); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                    activeTab === 'roommates'
                      ? 'bg-wood-100 text-wood-950 shadow-xs'
                      : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
                  }`}
                >
                  <Users size={16} className={activeTab === 'roommates' ? 'text-wood-900' : 'text-wood-500'} />
                  <span>Roommate Finder</span>
                </button>

                <button
                  onClick={() => { onNavigate('bookings'); setDrawerOpen(false); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                    activeTab === 'bookings'
                      ? 'bg-wood-100 text-wood-950 shadow-xs'
                      : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
                  }`}
                >
                  <Receipt size={16} className={activeTab === 'bookings' ? 'text-wood-900' : 'text-wood-500'} />
                  <span>My Bookings</span>
                </button>

                <button
                  onClick={() => { onNavigate('bookmarks'); setDrawerOpen(false); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                    activeTab === 'bookmarks'
                      ? 'bg-wood-100 text-wood-950 shadow-xs'
                      : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
                  }`}
                >
                  <Bookmark size={16} className={activeTab === 'bookmarks' ? 'text-wood-900' : 'text-wood-500'} />
                  <span>My Bookmarks</span>
                </button>
              </>
            )}

            {currentRole === 'LANDLORD' && (
              <>
                <button
                  onClick={() => { onNavigate('dashboard'); setDrawerOpen(false); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-wood-100 text-wood-950 shadow-xs'
                      : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
                  }`}
                >
                  <Compass size={16} className={activeTab === 'dashboard' ? 'text-wood-900' : 'text-wood-500'} />
                  <span>My Hostel Listings</span>
                </button>

                <button
                  onClick={() => { onNavigate('bookings'); setDrawerOpen(false); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                    activeTab === 'bookings'
                      ? 'bg-wood-100 text-wood-950 shadow-xs'
                      : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
                  }`}
                >
                  <Bookmark size={16} className={activeTab === 'bookings' ? 'text-wood-900' : 'text-wood-500'} />
                  <span>Active Rent Escrows</span>
                </button>

                <button
                  onClick={() => { onNavigate('payouts'); setDrawerOpen(false); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                    activeTab === 'payouts'
                      ? 'bg-wood-100 text-wood-950 shadow-xs'
                      : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
                  }`}
                >
                  <CreditCard size={16} className={activeTab === 'payouts' ? 'text-wood-900' : 'text-wood-500'} />
                  <span>Payout History</span>
                </button>

                <button
                  onClick={() => { onNavigate('verification'); setDrawerOpen(false); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                    activeTab === 'verification'
                      ? 'bg-wood-100 text-wood-950 shadow-xs'
                      : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
                  }`}
                >
                  <ShieldCheck size={16} className={activeTab === 'verification' ? 'text-wood-900' : 'text-wood-500'} />
                  <span>Verification Status</span>
                </button>

                <button
                  onClick={() => { onNavigate('profile'); setDrawerOpen(false); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-wood-100 text-wood-950 shadow-xs'
                      : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
                  }`}
                >
                  <Settings size={16} className={activeTab === 'profile' ? 'text-wood-900' : 'text-wood-500'} />
                  <span>Profile and Settings Page</span>
                </button>
              </>
            )}

            {currentRole === 'INSPECTOR' && (
              <>
                <button
                  onClick={() => { onNavigate('dashboard'); setDrawerOpen(false); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-wood-100 text-wood-950 shadow-xs'
                      : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
                  }`}
                >
                  <Compass size={16} className={activeTab === 'dashboard' ? 'text-wood-900' : 'text-wood-500'} />
                  <span>Available Vetting Requests</span>
                </button>

                <button
                  onClick={() => { onNavigate('my-jobs'); setDrawerOpen(false); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                    activeTab === 'my-jobs'
                      ? 'bg-wood-100 text-wood-950 shadow-xs'
                      : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
                  }`}
                >
                  <ShieldCheck size={16} className={activeTab === 'my-jobs' ? 'text-wood-900' : 'text-wood-500'} />
                  <span>My Active Assignments</span>
                </button>

                <button
                  onClick={() => { onNavigate('earnings'); setDrawerOpen(false); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                    activeTab === 'earnings'
                      ? 'bg-wood-100 text-wood-950 shadow-xs'
                      : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
                  }`}
                >
                  <CreditCard size={16} className={activeTab === 'earnings' ? 'text-wood-900' : 'text-wood-500'} />
                  <span>Completed Payout Logs</span>
                </button>

                <button
                  onClick={() => { onNavigate('profile'); setDrawerOpen(false); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-wood-100 text-wood-950 shadow-xs'
                      : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
                  }`}
                >
                  <Settings size={16} className={activeTab === 'profile' ? 'text-wood-900' : 'text-wood-500'} />
                  <span>Inspector Profile & Settings</span>
                </button>
              </>
            )}

            {currentRole === 'ADMIN' && (
              <>
                <button
                  onClick={() => { onNavigate('dashboard'); setDrawerOpen(false); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-wood-100 text-wood-950 shadow-xs'
                      : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
                  }`}
                >
                  <Compass size={16} className={activeTab === 'dashboard' ? 'text-wood-900' : 'text-wood-500'} />
                  <span>Admin Controls</span>
                </button>
              </>
            )}

            <div className="h-[1px] my-3 bg-wood-100" />

            <button
              onClick={() => { onNavigate('support'); setDrawerOpen(false); }}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-amber-100 text-amber-950 shadow-xs'
                  : 'text-amber-800 hover:text-wood-950 hover:bg-amber-50/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Bot size={16} className={activeTab === 'support' ? 'text-amber-700' : 'text-amber-600'} />
                <span>AI Support & Complaints</span>
              </div>
              <span className="text-[9px] font-extrabold bg-amber-500 text-white px-1.5 py-0.2 rounded uppercase">
                24/7
              </span>
            </button>

            <button
              onClick={() => { onNavigate('faqs'); setDrawerOpen(false); }}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'faqs'
                  ? 'bg-wood-100 text-wood-950 shadow-xs'
                  : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
              }`}
            >
              <div className="flex items-center space-x-3">
                <HelpCircle size={16} className={activeTab === 'faqs' ? 'text-amber-600' : 'text-wood-500'} />
                <span>Help & FAQs Page</span>
              </div>
            </button>

            <button
              onClick={() => { onNavigate('media-gallery'); setDrawerOpen(false); }}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'media-gallery'
                  ? 'bg-wood-100 text-wood-950 shadow-xs'
                  : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Camera size={16} className={activeTab === 'media-gallery' ? 'text-amber-600' : 'text-wood-500'} />
                <span>Inspected Media Gallery</span>
              </div>
              <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded uppercase">
                Vetted
              </span>
            </button>

            <button
              onClick={() => { onNavigate('chat'); setDrawerOpen(false); }}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-wood-100 text-wood-950 shadow-xs'
                  : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
              }`}
            >
              <div className="flex items-center space-x-3">
                <MessageSquare size={16} className={activeTab === 'chat' ? 'text-wood-900' : 'text-wood-500'} />
                <span>Message Page</span>
              </div>
              {unreadMessagesCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-xs">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {currentRole !== 'LANDLORD' && (
              <button
                onClick={() => { onNavigate('profile'); setDrawerOpen(false); }}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-wood-100 text-wood-950 shadow-xs'
                    : 'text-wood-600 hover:text-wood-950 hover:bg-wood-50/70'
                }`}
              >
                <Settings size={16} className={activeTab === 'profile' ? 'text-wood-900' : 'text-wood-500'} />
                <span>Settings Page</span>
              </button>
            )}
          </div>

          {/* Logout/Footer Area */}
          <div className="p-4 border-t border-wood-100 bg-wood-50/30">
            <button
              onClick={() => { onLogout(); setDrawerOpen(false); }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all flex items-center justify-center space-x-2 cursor-pointer border border-transparent hover:border-red-100"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </>
    </nav>
  );
}
