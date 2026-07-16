import { School, User, Hostel, Booking, InspectorJob, CohabitantPost, ChatThread, Message, KYCStatus, BookingStatus, JobStatus } from './types';
import { INITIAL_SCHOOLS, INITIAL_USERS, INITIAL_HOSTELS, INITIAL_BOOKINGS, INITIAL_INSPECTIONS, INITIAL_COHABITANTS, INITIAL_CHATS, INITIAL_MESSAGES } from './mockData';

// Core State Interface
export interface PlatformState {
  schools: School[];
  users: User[];
  hostels: Hostel[];
  bookings: Booking[];
  jobs: InspectorJob[];
  cohabitants: CohabitantPost[];
  chats: ChatThread[];
  messages: Message[];
  bookmarks: string[]; // hostel IDs bookmarked by active student
  activeUserId: string;
}

// Contact Sharing Filter Logic
export function checkMessageContactSharing(text: string): { isBlocked: boolean; reason?: string } {
  const normalized = text.toLowerCase().trim();

  // 1. Phone number regex patterns (Nigerian phone formats: 070, 080, 081, 090, 091, +234 with spaces, dashes, dots, or parenthesis)
  const phoneRegex = /(?:(?:\+?234)[-.\s]??|[0])(?:[789][01][-.\s]??\d{3}[-.\s]??\d{4}|\d{3}[-.\s]??\d{3}[-.\s]??\d{4})/g;
  
  // Handlers for spelled-out digits like "zero eight zero"
  const spelledNumbers = /(?:zero|one|two|three|four|five|six|seven|eight|nine)[-\s]??(?:zero|one|two|three|four|five|six|seven|eight|nine)/i;

  // 2. Email Address regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  // 3. Social media handles, websites, and chat keywords
  const blockedKeywords = [
    'whatsapp', 'wa.me', 'instagram', 'facebook', 'snapchat', 'tiktok', 'twitter', 'telegram',
    'ig:', 'fb:', 'dm me', 'contact me on', 'reach me via', 'call me', 'text me',
    'wh@tsapp', 'watsap', 'insta', 'tele', 'number is', 'my phone', 'email is', 'gmail'
  ];

  // Specific check for @ signs when not in emails, indicating handles
  const handleRegex = /@\w+/g;

  if (phoneRegex.test(normalized)) {
    return { isBlocked: true, reason: 'Sharing phone numbers is not allowed. Please keep all communication inside Dormiversity.' };
  }

  if (spelledNumbers.test(normalized)) {
    return { isBlocked: true, reason: 'Spelling out phone numbers to bypass filters is prohibited. All communication must stay in-app.' };
  }

  if (emailRegex.test(normalized)) {
    return { isBlocked: true, reason: 'Sharing email addresses is not allowed. All communication must stay inside Dormiversity.' };
  }

  for (const keyword of blockedKeywords) {
    if (normalized.includes(keyword)) {
      return { isBlocked: true, reason: `Mentioning contact/social platform "${keyword}" is blocked to prevent outside transactions. Keep details in-app.` };
    }
  }

  // Check for handle mentions
  if (handleRegex.test(normalized)) {
    return { isBlocked: true, reason: 'Sharing social media handles (@) is blocked. Please keep discussion inside Dormiversity.' };
  }

  return { isBlocked: false };
}

const STORAGE_KEY = 'dormiversity_storage_v1';

// Load initial state
export function loadState(): PlatformState {
  if (typeof localStorage === 'undefined') {
    return {
      schools: INITIAL_SCHOOLS,
      users: INITIAL_USERS,
      hostels: INITIAL_HOSTELS,
      bookings: INITIAL_BOOKINGS,
      jobs: INITIAL_INSPECTIONS,
      cohabitants: INITIAL_COHABITANTS,
      chats: INITIAL_CHATS,
      messages: INITIAL_MESSAGES,
      bookmarks: ['hostel_1'],
      activeUserId: 'student_1'
    };
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing saved state, resetting', e);
    }
  }

  const defaultState: PlatformState = {
    schools: INITIAL_SCHOOLS,
    users: INITIAL_USERS,
    hostels: INITIAL_HOSTELS,
    bookings: INITIAL_BOOKINGS,
    jobs: INITIAL_INSPECTIONS,
    cohabitants: INITIAL_COHABITANTS,
    chats: INITIAL_CHATS,
    messages: INITIAL_MESSAGES,
    bookmarks: ['hostel_1'],
    activeUserId: 'student_1' // Default starting user
  };

  saveState(defaultState);
  return defaultState;
}

export function saveState(state: PlatformState) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}
