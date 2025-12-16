import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { tokenManager, isTokenExpired } = await import("@/utils/storage");
      const token = await tokenManager.getToken();

      if (token) {
        if (isTokenExpired(token)) {
          await tokenManager.clearAuth();
          return;
        }

        const userData = await tokenManager.getUser();
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { authService } = await import("@/services/auth.service");
      const user = await authService.signIn(email, password);
      setUser(user);
      return user.role as "customer" | "vendor";
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone?: string,
    address?: string,
    date_of_birth?: string
  ) => {
    try {
      const { authService } = await import("@/services/auth.service");
      const user = await authService.signUp({
        email,
        password,
        name,
        phone,
        address,
        date_of_birth,
      });
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { authService } = await import("@/services/auth.service");
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error("Failed to sign out:", error);
      // Clear user anyway
      const { tokenManager } = await import("@/utils/storage");
      await tokenManager.clearAuth();
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const { authService } = await import("@/services/auth.service");
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
