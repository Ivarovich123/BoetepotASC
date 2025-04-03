'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// Define the correct admin password here
const ADMIN_PASSWORD = 'Mandje123';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>; // Only password needed
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const router = useRouter();

  useEffect(() => {
    // Check local storage for auth status on initial load
    try {
      const storedAuth = localStorage.getItem('boetePotAdminAuth');
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    } finally {
        setLoading(false); // Finished checking auth status
    }
  }, []);

  const login = async (password: string): Promise<boolean> => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem('boetePotAdminAuth', 'true');
      } catch (error) {
        console.error("Could not set auth in localStorage:", error);
        // Proceed even if localStorage fails, but log error
      }
      return true;
    } else {
      // Throw an error for incorrect password
      throw new Error('Ongeldig wachtwoord.');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('boetePotAdminAuth');
    } catch (error) {
      console.error("Could not remove auth from localStorage:", error);
    }
    router.push('/admin/login');
  };

  // Prevent rendering children until auth status is determined
  if (loading) {
    return null; // Or a global loading indicator
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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