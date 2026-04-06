'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db, googleProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, doc, getDoc, setDoc, Timestamp, User } from '../lib/firebase';
import { UserProfile } from '../lib/types';
import { toast } from 'sonner';
import { FirebaseError } from 'firebase/app';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  login: () => Promise<void>;
  loginWithRedirect: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      console.error('Login error:', error);
      let message = 'Failed to login. Please try again.';
      const currentDomain = window.location.hostname;
      
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/unauthorized-domain':
            message = `Domain "${currentDomain}" is not authorized. Add it to Firebase Console > Auth > Settings > Authorized Domains.`;
            break;
          case 'auth/popup-blocked':
            message = 'Login popup was blocked by your browser. Please allow popups or try "Sign in with Redirect".';
            break;
          case 'auth/popup-closed-by-user':
            message = 'Login popup was closed before completion.';
            break;
          case 'auth/operation-not-allowed':
            message = 'Google Sign-In is not enabled in your Firebase project (Enable it in Auth > Sign-in method).';
            break;
          case 'auth/internal-error':
            message = 'Internal Firebase error. This often happens if third-party cookies are blocked in your browser.';
            break;
          default:
            message = `Login failed: ${error.code}`;
        }
      }

      toast.error(message, {
        description: 'If you are in the AI Studio preview, try opening the app in a new tab.',
        duration: 10000,
        action: {
          label: 'Try Redirect',
          onClick: () => loginWithRedirect(),
        },
      });
    }
  };

  const loginWithRedirect = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: unknown) {
      console.error('Redirect login error:', error);
      toast.error('Failed to start redirect login.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          console.log('User authenticated:', currentUser.uid);
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            console.log('Creating new user profile...');
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || 'Anonymous User',
              phone: '',
              isAdmin: currentUser.email === 'calekurugat254@gmail.com',
              createdAt: Timestamp.now(),
            };
            await setDoc(doc(db, 'users', currentUser.uid), newProfile);
            setProfile(newProfile);
            toast.success('Welcome to Salama Ride!');
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        toast.error('Error loading user profile. Check your Firestore rules.');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, setProfile, login, loginWithRedirect, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
