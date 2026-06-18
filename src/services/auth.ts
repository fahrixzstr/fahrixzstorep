import { auth, googleProvider, githubProvider, appleProvider } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  onAuthStateChanged,
  linkWithPopup,
  unlink,
  deleteUser,
  PhoneAuthProvider,
  signInWithCredential,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types';

export const authService = {
  // Register with email/password
  register: async (email: string, password: string, displayName: string): Promise<User> => {
    if (!auth) throw new Error('Firebase not initialized');
    const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(fbUser, { displayName });
    await createUserDocument(fbUser);
    return mapFirebaseUser(fbUser);
  },

  // Login with email/password
  login: async (email: string, password: string): Promise<User> => {
    if (!auth) throw new Error('Firebase not initialized');
    const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);
    await updateUserLastLogin(fbUser.uid);
    return mapFirebaseUser(fbUser);
  },

  // Login with Google
  loginWithGoogle: async (): Promise<User> => {
    if (!auth) throw new Error('Firebase not initialized');
    const { user: fbUser } = await signInWithPopup(auth, googleProvider);
    await createUserDocument(fbUser);
    await updateUserLastLogin(fbUser.uid);
    return mapFirebaseUser(fbUser);
  },

  // Login with GitHub
  loginWithGithub: async (): Promise<User> => {
    if (!auth) throw new Error('Firebase not initialized');
    const { user: fbUser } = await signInWithPopup(auth, githubProvider);
    await createUserDocument(fbUser);
    await updateUserLastLogin(fbUser.uid);
    return mapFirebaseUser(fbUser);
  },

  // Login with Apple
  loginWithApple: async (): Promise<User> => {
    if (!auth) throw new Error('Firebase not initialized');
    const { user: fbUser } = await signInWithPopup(auth, appleProvider);
    await createUserDocument(fbUser);
    await updateUserLastLogin(fbUser.uid);
    return mapFirebaseUser(fbUser);
  },

  // Login with Phone (after OTP verification)
  loginWithPhone: async (verificationId: string, otp: string): Promise<User> => {
    if (!auth) throw new Error('Firebase not initialized');
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    const { user: fbUser } = await signInWithCredential(auth, credential);
    await createUserDocument(fbUser);
    await updateUserLastLogin(fbUser.uid);
    return mapFirebaseUser(fbUser);
  },

  // Guest/Anonymous login
  loginAsGuest: async (): Promise<User> => {
    if (!auth) throw new Error('Firebase not initialized');
    const { user: fbUser } = await signInAnonymously(auth);
    await createUserDocument(fbUser);
    return mapFirebaseUser(fbUser);
  },

  // Convert guest to permanent account
  convertGuestAccount: async (email: string, password: string, displayName: string): Promise<User> => {
    if (!auth || !auth.currentUser) throw new Error('No guest user');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    await createUserDocument(credential.user);
    return mapFirebaseUser(credential.user);
  },

  // Link social account to existing account
  linkGoogle: async (): Promise<void> => {
    if (!auth?.currentUser) throw new Error('Not authenticated');
    await linkWithPopup(auth.currentUser, googleProvider);
  },

  linkGithub: async (): Promise<void> => {
    if (!auth?.currentUser) throw new Error('Not authenticated');
    await linkWithPopup(auth.currentUser, githubProvider);
  },

  linkApple: async (): Promise<void> => {
    if (!auth?.currentUser) throw new Error('Not authenticated');
    await linkWithPopup(auth.currentUser, appleProvider);
  },

  // Unlink provider
  unlinkProvider: async (providerId: string): Promise<void> => {
    if (!auth?.currentUser) throw new Error('Not authenticated');
    await unlink(auth.currentUser, providerId);
  },

  // Update profile
  updateUserProfile: async (data: { displayName?: string; photoURL?: string }): Promise<void> => {
    if (!auth?.currentUser) throw new Error('Not authenticated');
    await updateProfile(auth.currentUser, data);
    await updateDoc(doc(db!, 'users', auth.currentUser.uid), {
      displayName: data.displayName || auth.currentUser.displayName,
      photoURL: data.photoURL || auth.currentUser.photoURL,
      updatedAt: serverTimestamp(),
    });
  },

  // Update email
  updateUserEmail: async (email: string): Promise<void> => {
    if (!auth?.currentUser) throw new Error('Not authenticated');
    await updateEmail(auth.currentUser, email);
    await updateDoc(doc(db!, 'users', auth.currentUser.uid), {
      email,
      updatedAt: serverTimestamp(),
    });
  },

  // Update password
  updateUserPassword: async (password: string): Promise<void> => {
    if (!auth?.currentUser) throw new Error('Not authenticated');
    await updatePassword(auth.currentUser, password);
  },

  // Reset password
  resetPassword: async (email: string): Promise<void> => {
    if (!auth) throw new Error('Firebase not initialized');
    await sendPasswordResetEmail(auth, email);
  },

  // Delete account (GDPR)
  deleteAccount: async (): Promise<void> => {
    if (!auth?.currentUser) throw new Error('Not authenticated');
    // TODO: anonymize orders before deleting user
    await deleteUser(auth.currentUser);
  },

  // Logout
  logout: async (): Promise<void> => {
    if (!auth) throw new Error('Firebase not initialized');
    await signOut(auth);
  },

  // Listen to auth state
  onAuthChange: (callback: (user: User | null) => void) => {
    if (!auth) return () => {};
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userData = await getUserDocument(fbUser.uid);
        if (userData) {
          callback({ ...mapFirebaseUser(fbUser), ...userData });
        } else {
          callback(mapFirebaseUser(fbUser));
        }
      } else {
        callback(null);
      }
    });
  },

  // Get current user
  getCurrentUser: (): User | null => {
    if (!auth?.currentUser) return null;
    return mapFirebaseUser(auth.currentUser);
  },

  // Check if user is admin (secret login)
  verifyAdmin: async (uid: string): Promise<boolean> => {
    if (!db) return false;
    const docRef = doc(db, 'admins', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  },
};

// Helper to map Firebase user to app User
function mapFirebaseUser(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    uid: fbUser.uid,
    email: fbUser.email || '',
    displayName: fbUser.displayName || 'User',
    photoURL: fbUser.photoURL || '',
    phoneNumber: fbUser.phoneNumber || '',
    role: 'user',
    emailVerified: fbUser.emailVerified,
    isAnonymous: fbUser.isAnonymous,
    providers: fbUser.providerData.map((p) => p.providerId),
    referralCode: generateReferralCode(),
    createdAt: new Date(fbUser.metadata.creationTime || Date.now()),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    isBlocked: false,
  };
}

function generateReferralCode(): string {
  return 'FZ' + Math.random().toString(36).substring(2, 7).toUpperCase();
}

async function createUserDocument(fbUser: FirebaseUser): Promise<void> {
  if (!db) return;
  const userRef = doc(db, 'users', fbUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: fbUser.uid,
      email: fbUser.email || '',
      displayName: fbUser.displayName || 'User',
      photoURL: fbUser.photoURL || '',
      phoneNumber: fbUser.phoneNumber || '',
      role: 'user',
      providers: fbUser.providerData.map((p) => p.providerId),
      referralCode: generateReferralCode(),
      isBlocked: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  }
}

async function updateUserLastLogin(uid: string): Promise<void> {
  if (!db) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

async function getUserDocument(uid: string): Promise<Partial<User> | null> {
  if (!db) return null;
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as Partial<User>;
  }
  return null;
}

export default authService;