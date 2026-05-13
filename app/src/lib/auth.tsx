import React, { createContext, useContext, useEffect } from 'react';
import { ClerkProvider, ClerkLoaded, useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { setTokenGetter } from './api';

const CLERK_PUBLISHABLE_KEY = 'pk_live_Y2xlcmsua3VsbDEuY29tJA';

// Clerk token cache using expo-secure-store
const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
  async clearToken(key: string) {
    return SecureStore.deleteItemAsync(key);
  },
};

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isSignedIn: false,
  signOut: async () => {},
  getToken: async () => null,
});

function AuthBridge({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, signOut, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();

  // Wire Clerk's getToken into the API layer so all requests get the JWT
  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  const user: AuthUser | null = isSignedIn && clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    role: (clerkUser.publicMetadata?.role as string) || 'angler',
  } : null;

  return (
    <AuthContext.Provider value={{
      user,
      loading: !isLoaded,
      isSignedIn: !!isSignedIn,
      signOut: async () => { await signOut(); },
      getToken: async () => { const t = await getToken(); return t; },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <AuthBridge>{children}</AuthBridge>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

export const useAuth = () => useContext(AuthContext);
