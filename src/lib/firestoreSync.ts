import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { PlatformState } from '../state';
import { INITIAL_SCHOOLS, INITIAL_USERS, INITIAL_HOSTELS, INITIAL_BOOKINGS, INITIAL_INSPECTIONS, INITIAL_COHABITANTS, INITIAL_CHATS, INITIAL_MESSAGES } from '../mockData';

const STATE_DOC_REF = doc(db, 'dormiversity', 'app_state');

export const DEFAULT_PLATFORM_STATE: PlatformState = {
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

/**
 * Recursively cleans JavaScript objects for Firestore compliance by stripping undefined values.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        sanitized[key] = sanitizeForFirestore(value);
      }
    }
    return sanitized as any;
  }
  return data;
}

/**
 * Saves current platform state to Firestore
 */
export async function saveStateToFirestore(state: PlatformState): Promise<void> {
  try {
    const cleanState = sanitizeForFirestore(state);
    await setDoc(STATE_DOC_REF, cleanState, { merge: true });
  } catch (error) {
    console.error('Error saving state to Firestore:', error);
  }
}

/**
 * Subscribes to real-time state changes from Firestore
 */
export function subscribeToFirestoreState(
  onUpdate: (state: PlatformState) => void,
  onError?: (err: Error) => void
): () => void {
  const unsubscribe = onSnapshot(
    STATE_DOC_REF,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as PlatformState;
        onUpdate(data);
      } else {
        // Document does not exist yet; seed initial state into Firestore
        console.log('Seeding initial state to Firestore...');
        try {
          const cleanDefault = sanitizeForFirestore(DEFAULT_PLATFORM_STATE);
          await setDoc(STATE_DOC_REF, cleanDefault);
          onUpdate(DEFAULT_PLATFORM_STATE);
        } catch (err) {
          console.error('Error seeding initial Firestore state:', err);
          if (onError) onError(err as Error);
        }
      }
    },
    (error) => {
      console.warn('Firestore subscription error (falling back to offline state):', error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}
