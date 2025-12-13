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
      return user.role;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { authService } = await import("@/services/auth.service");
      const user = await authService.signUp({ email, password, name });
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { tokenManager } = await import("@/utils/storage");
      await tokenManager.clearAuth();
      setUser(null);
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const signInWithGoogle = async () => {
    // TODO: Implement Google Sign In
    console.log("Sign in with Google");
  };

  const signInWithApple = async () => {
    // TODO: Implement Apple Sign In
    console.log("Sign in with Apple");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithApple,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
