"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  firebaseSignIn,
  firebaseSignUp,
  firebaseSignInAnonymously,
  firebaseSignOut,
  onFirebaseAuthChange,
} from "@/lib/firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase/client";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True when Firebase is configured and the app runs on Firebase auth. */
  firebaseMode: boolean;
  /** The current Firebase user (null in JWT fallback mode). */
  firebaseUser: User | null;
  login: (token: string) => void;
  logout: () => void;
  /** Firebase email/password sign-in (throws on failure). */
  signIn: (email: string, password: string) => Promise<void>;
  /** Firebase account creation. */
  signUp: (email: string, password: string) => Promise<void>;
  /** Firebase anonymous "continue as guest". */
  continueAsGuest: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "foodgaurd-token";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const firebaseMode = useMemo(() => isFirebaseConfigured(), []);

  useEffect(() => {
    if (!firebaseMode) {
      const tokenFromStorage = getStoredToken();
      queueMicrotask(() => {
        setToken(tokenFromStorage);
        setIsLoading(false);
      });
      return;
    }

    const unsubscribe = onFirebaseAuthChange((user) => {
      setFirebaseUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [firebaseMode]);

  const login = useCallback((nextToken: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, nextToken);
    } catch {
      /* storage may be unavailable */
    }
    setToken(nextToken);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage may be unavailable */
    }
    setToken(null);
    if (firebaseMode) {
      void firebaseSignOut();
    }
  }, [firebaseMode]);

  const signIn = useCallback(async (email: string, password: string) => {
    await firebaseSignIn(email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    await firebaseSignUp(email, password);
  }, []);

  const continueAsGuest = useCallback(async () => {
    await firebaseSignInAnonymously();
  }, []);

  const isAuthenticated = firebaseMode
    ? Boolean(firebaseUser)
    : Boolean(token);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      firebaseMode,
      firebaseUser,
      login,
      logout,
      signIn,
      signUp,
      continueAsGuest,
    }),
    [isAuthenticated, isLoading, firebaseMode, firebaseUser, login, logout, signIn, signUp, continueAsGuest],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      isAuthenticated: false,
      isLoading: true,
      firebaseMode: false,
      firebaseUser: null,
      login: () => {},
      logout: () => {},
      signIn: async () => {},
      signUp: async () => {},
      continueAsGuest: async () => {},
    };
  }
  return ctx;
}