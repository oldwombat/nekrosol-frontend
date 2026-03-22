import React, { createContext, useContext, type ReactNode } from 'react';
import { useHomeAuth } from './home-auth';

// Re-export the hook's return type as the context shape
type AuthContextValue = ReturnType<typeof useHomeAuth>;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useHomeAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
