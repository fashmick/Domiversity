import React, { useState } from 'react';
import { Bell, MessageSquare, Menu, X, ChevronDown, ShieldAlert, LogOut } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-wood-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Tab Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate('dashboard')}>
              <DormiversityLogo size={34} showText={true} textSize="text-lg" textColor="text-wood-900" />
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4 items-center">
              {currentRole === 'STUDENT' && (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:text-wood-900'}`}
                  >
                    Hostels Search
                  </button>
                  <button
                    onClick={() => onNavigate('roommates')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'roommates' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:text-wood-900'}`}
                  >
                    Roommate Matcher
                  </button>
                  <button
                    onClick={() => onNavigate('bookings')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'bookings' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:text-wood-900'}`}
                  >
                    My Bookings
                  </button>
                </>
              )}

              {currentRole === 'LANDLORD' && (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:text-wood-900'}`}
                  >
                    Manage Listings
                  </button>
                  <button
                    onClick={() => onNavigate('bookings')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'bookings' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:text-wood-900'}`}
                  >
                    Rent Escrows
                  </button>
                </>
              )}

              {currentRole === 'INSPECTOR' && (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:text-wood-900'}`}
                  >
                    Inspection Jobs
                  </button>
                </>
              )}

              {currentRole === 'ADMIN' && (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:text-wood-900'}`}
                  >
                    Admin Controls
                  </button>
                </>
              )}

              {/* Secure Chat Link */}
              <button
                onClick={() => onNavigate('chat')}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${activeTab === 'chat' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:text-wood-900'}`}
              >
                <MessageSquare size={16} />
                <span>Secure Inbox</span>
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right Section: User Info & Avatar */}
          <div className="flex items-center space-x-4">
            {/* User Profile Badge */}
            <div className="bg-wood-50 text-wood-900 border border-wood-200 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 text-xs font-semibold shadow-xs">
              <span className="hidden sm:inline-block">Signed In As:</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold text-white ${
                currentRole === 'STUDENT' ? 'bg-blue-600' :
                currentRole === 'INSPECTOR' ? 'bg-amber-600' :
                currentRole === 'LANDLORD' ? 'bg-emerald-600' : 'bg-red-600'
              }`}>
                {currentRole}
              </span>
              <span className="max-w-[80px] sm:max-w-[120px] truncate font-medium">{activeUser.name}</span>
            </div>

            {/* Profile Avatar & Actions */}
            <div className="flex items-center space-x-2">
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

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-wood-500 hover:text-wood-950 hover:bg-wood-100 focus:outline-hidden"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-wood-200 px-2 pt-2 pb-3 space-y-1">
          {currentRole === 'STUDENT' && (
            <>
              <button
                onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${activeTab === 'dashboard' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:bg-wood-50'}`}
              >
                Hostels Search
              </button>
              <button
                onClick={() => { onNavigate('roommates'); setMobileMenuOpen(false); }}
                className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${activeTab === 'roommates' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:bg-wood-50'}`}
              >
                Roommate Matcher
              </button>
              <button
                onClick={() => { onNavigate('bookings'); setMobileMenuOpen(false); }}
                className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${activeTab === 'bookings' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:bg-wood-50'}`}
              >
                My Bookings
              </button>
            </>
          )}

          {currentRole === 'LANDLORD' && (
            <>
              <button
                onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${activeTab === 'dashboard' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:bg-wood-50'}`}
              >
                Manage Listings
              </button>
              <button
                onClick={() => { onNavigate('bookings'); setMobileMenuOpen(false); }}
                className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${activeTab === 'bookings' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:bg-wood-50'}`}
              >
                Rent Escrows
              </button>
            </>
          )}

          {currentRole === 'INSPECTOR' && (
            <button
              onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${activeTab === 'dashboard' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:bg-wood-50'}`}
            >
              Inspection Jobs
            </button>
          )}

          {currentRole === 'ADMIN' && (
            <button
              onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${activeTab === 'dashboard' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:bg-wood-50'}`}
            >
              Admin Controls
            </button>
          )}

          <button
            onClick={() => { onNavigate('chat'); setMobileMenuOpen(false); }}
            className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${activeTab === 'chat' ? 'bg-wood-100 text-wood-950 font-semibold' : 'text-wood-600 hover:bg-wood-50'}`}
          >
            Secure Inbox
          </button>
        </div>
      )}
    </nav>
  );
}
