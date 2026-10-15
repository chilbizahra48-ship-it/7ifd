import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  deleteUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firebase/errors';
import { localDB } from '../lib/storage/indexedDb';
import { LanguageCode, UserProfile } from '../types';
import { useTheme } from './ThemeContext';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateProfileSettings: (updates: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_PROFILE = (userId: string, email: string = '', displayName: string = ''): UserProfile => ({
  id: userId,
  email: email,
  displayName: displayName || (email ? email.split('@')[0] : 'Learner'),
  interfaceLanguage: 'en',
  targetLanguage: 'es',
  preferredTranslationLanguage: 'en',
  currentLevel: 'A1',
  dailyGoalCards: 20,
  theme: 'light',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  onboardingCompleted: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { setInterfaceLanguage, setTheme } = useTheme();

  // Load guest profile if unauthenticated
  const getGuestProfileId = () => {
    let gid = localStorage.getItem('7ifd_guest_id');
    if (!gid) {
      gid = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('7ifd_guest_id', gid);
    }
    return gid;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      try {
        if (currentUser) {
          const uid = currentUser.uid;
          let userProf = await localDB.getUserProfile(uid);

          // Try fetching from Firestore
          try {
            const userDocRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
              userProf = userSnap.data() as UserProfile;
              await localDB.saveUserProfile(userProf);
            } else if (!userProf) {
              // Create initial profile in Firestore
              userProf = DEFAULT_PROFILE(uid, currentUser.email || '', currentUser.displayName || '');
              await setDoc(userDocRef, userProf);
              await localDB.saveUserProfile(userProf);
            }
          } catch (fireErr) {
            console.warn('Could not fetch cloud profile, using local cached profile:', fireErr);
          }

          if (!userProf) {
            userProf = DEFAULT_PROFILE(uid, currentUser.email || '', currentUser.displayName || '');
            await localDB.saveUserProfile(userProf);
          }

          setProfile(userProf);
          if (userProf.interfaceLanguage) {
            setInterfaceLanguage(userProf.interfaceLanguage);
          }
          if (userProf.theme) {
            setTheme(userProf.theme);
          }
        } else {
          // Guest mode
          const guestId = getGuestProfileId();
          let guestProf = await localDB.getUserProfile(guestId);
          if (!guestProf) {
            guestProf = DEFAULT_PROFILE(guestId, '', 'Guest Learner');
            await localDB.saveUserProfile(guestProf);
          }
          setProfile(guestProf);
          if (guestProf.interfaceLanguage) {
            setInterfaceLanguage(guestProf.interfaceLanguage);
          }
        }
      } catch (err) {
        console.error('Error loading user profile state:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      const newProf = DEFAULT_PROFILE(cred.user.uid, email, displayName);
      try {
        await setDoc(doc(db, 'users', cred.user.uid), newProf);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${cred.user.uid}`);
      }
      await localDB.saveUserProfile(newProf);
      setProfile(newProf);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const updateProfileSettings = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setProfile(updated);
    await localDB.saveUserProfile(updated);

    if (updates.interfaceLanguage) {
      setInterfaceLanguage(updates.interfaceLanguage);
    }
    if (updates.theme) {
      setTheme(updates.theme);
    }

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), updates as any);
      } catch (err) {
        console.warn('Failed to update cloud profile, saved locally:', err);
      }
    }
  };

  const deleteAccount = async () => {
    if (!profile) return;
    const uid = profile.id;

    // Clear local indexedDB data
    await localDB.clearUserData(uid);

    if (user) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (e) {
        console.warn('Could not delete firestore user document:', e);
      }
      await deleteUser(user);
    }

    // Reset to fresh guest
    localStorage.removeItem('7ifd_guest_id');
    const newGuestId = getGuestProfileId();
    const freshGuest = DEFAULT_PROFILE(newGuestId, '', 'Guest Learner');
    await localDB.saveUserProfile(freshGuest);
    setProfile(freshGuest);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOutUser,
        updateProfileSettings,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
