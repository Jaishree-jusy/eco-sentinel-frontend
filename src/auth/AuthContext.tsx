import { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'government' | 'community';

interface User {
  name: string;
  email: string;
  role: UserRole;
  governmentId?: string;
}

interface AuthContextType {
  user: User | null;
  loginGovernment: (governmentId: string, password: string) => boolean;
  loginCommunity: (email: string, password: string) => boolean;
  signupCommunity: (
    name: string,
    email: string,
    password: string
  ) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GOVERNMENT_USERS = [
  {
    governmentId: 'GOV-KA-00125',
    password: 'eco@2026',
    name: 'Field Officer',
    email: 'officer@ecosentinel.gov',
  },
  {
    governmentId: 'GOV-KA-00126',
    password: 'forest@2026',
    name: 'Forest Officer',
    email: 'forest@ecosentinel.gov',
  },
];

interface CommunityAccount {
  name: string;
  email: string;
  password: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('eco_sentinel_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('eco_sentinel_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('eco_sentinel_user');
    }
  }, [user]);

  function loginGovernment(
    governmentId: string,
    password: string
  ): boolean {
    const official = GOVERNMENT_USERS.find(
      (u) =>
        u.governmentId === governmentId &&
        u.password === password
    );

    if (!official) return false;

    setUser({
      name: official.name,
      email: official.email,
      role: 'government',
      governmentId: official.governmentId,
    });

    return true;
  }

  function loginCommunity(
    email: string,
    password: string
  ): boolean {
    const accounts: CommunityAccount[] = JSON.parse(
      localStorage.getItem('eco_sentinel_community_accounts') || '[]'
    );

    const account = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() &&
        a.password === password
    );

    if (!account) return false;

    setUser({
      name: account.name,
      email: account.email,
      role: 'community',
    });

    return true;
  }

  function signupCommunity(
    name: string,
    email: string,
    password: string
  ): boolean {
    const accounts: CommunityAccount[] = JSON.parse(
      localStorage.getItem('eco_sentinel_community_accounts') || '[]'
    );

    if (
      accounts.some(
        (a) => a.email.toLowerCase() === email.toLowerCase()
      )
    ) {
      return false;
    }

    accounts.push({
      name,
      email,
      password,
    });

    localStorage.setItem(
      'eco_sentinel_community_accounts',
      JSON.stringify(accounts)
    );

    setUser({
      name,
      email,
      role: 'community',
    });

    return true;
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loginGovernment,
        loginCommunity,
        signupCommunity,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}