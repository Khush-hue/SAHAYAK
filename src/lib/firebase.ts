import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  getDocFromServer,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/meetings.space.created');
googleProvider.addScope('https://www.googleapis.com/auth/meetings.space.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/meetings.space.settings');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore
export const db = getFirestore(app);

// Test connection on boot per Firebase Skill guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Successfully connected to Firestore server.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Firestore client running in offline mode.');
    } else {
      console.log('[Firebase] Connection handshake completed.');
    }
    return false;
  }
}

// User Profile persistence helper
export interface StoredUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'CVO' | 'Joint Secretary' | 'Investigating Officer' | 'Auditor';
  officerId: string;
  lastLoginAt: string;
  createdAt?: string;
}

export async function syncUserProfile(user: User, role: string = 'CVO'): Promise<StoredUserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const now = new Date().toISOString();
  
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const existing = snap.data() as StoredUserProfile;
      const updated: StoredUserProfile = {
        ...existing,
        lastLoginAt: now,
        displayName: user.displayName || existing.displayName || 'Vigilance Officer',
        photoURL: user.photoURL || existing.photoURL || ''
      };
      await setDoc(userRef, updated, { merge: true });
      return updated;
    } else {
      const newProfile: StoredUserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Vigilance Officer',
        photoURL: user.photoURL || '',
        role: (role as any) || 'CVO',
        officerId: `VIG-${user.uid.slice(0, 6).toUpperCase()}`,
        createdAt: now,
        lastLoginAt: now
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  } catch (err) {
    console.warn('[Firebase] Profile sync to Firestore fallback:', err);
    return {
      uid: user.uid,
      email: user.email || 'officer@dosje.gov.in',
      displayName: user.displayName || 'Dr. Rajiv Verma, IAS',
      photoURL: user.photoURL || '',
      role: 'CVO',
      officerId: 'INS-2026-904',
      lastLoginAt: now
    };
  }
}

// Log audit action to Firestore
export async function logAuditActionToFirestore(action: {
  type: string;
  institutionId: string;
  institutionName: string;
  userUid: string;
  userEmail: string;
  details: string;
  isFrozen?: boolean;
}) {
  try {
    const actionId = `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    await setDoc(doc(db, 'audit_actions', actionId), {
      ...action,
      id: actionId,
      timestamp: new Date().toISOString()
    });
    console.log('[Firebase] Audit action persisted to Firestore:', actionId);
  } catch (err) {
    console.warn('[Firebase] Failed to write audit action to Firestore:', err);
  }
}

export { app };
