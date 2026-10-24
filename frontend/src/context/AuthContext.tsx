import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";
import { apiService } from "../api/client";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("stationpool_token");
    const savedUser = localStorage.getItem("stationpool_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user:", e);
        localStorage.removeItem("stationpool_token");
        localStorage.removeItem("stationpool_user");
        setToken(null);
        setUser(null);
      }
    } else {
      // Unauthenticated by default - user must sign up or sign in
      setToken(null);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("stationpool_token", newToken);
    localStorage.setItem("stationpool_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("stationpool_token");
    localStorage.removeItem("stationpool_user");
  };

  const refreshUser = async () => {
    try {
      const me = await apiService.getMe();
      setUser(me);
      localStorage.setItem("stationpool_user", JSON.stringify(me));
    } catch (e) {
      console.error("Failed to refresh user:", e);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        refreshUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
