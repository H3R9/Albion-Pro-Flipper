"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db, handleFirestoreError, OperationType, signInWithGoogle, signOutUser } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

import { userProfileSchema } from "@/lib/validation";

interface UserProfile {
  silver: number;
  premium: boolean;
  inventory: Record<string, number>;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setProfile(userSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              silver: 0,
              premium: false,
              inventory: {},
            };
            await setDoc(userRef, {
              uid: currentUser.uid,
              ...newProfile,
              updatedAt: serverTimestamp(),
            });
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    await signInWithGoogle();
  };

  const updateProfileObj = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const oldProfile = { ...profile };
    try {
        const newProfile = { ...profile, ...updates };
        userProfileSchema.parse(newProfile);
        setProfile(newProfile);
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    } catch(err) {
        setProfile(oldProfile); // reverte estado
        if (err instanceof Error && err.name === 'ZodError') {
            console.error('Invalid profile updates:', err);
            return;
        }
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut: signOutUser, updateProfile: updateProfileObj }}>
      {children}
    </AuthContext.Provider>
  );
}
