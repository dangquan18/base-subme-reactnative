import { apiClient } from "./api";
import { User } from "@/types";
import { tokenManager, decodeJWT } from "@/utils/storage";

interface LoginResponse {
  access_token: string;
}

interface DecodedToken {
  email: string;
  sub: number; // user id
  role: "user" | "vendor" | "admin";
  iat: number;
  exp: number;
}

interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

export const authService = {
  // Sign in (Login)
  async signIn(email: string, password: string): Promise<User> {
    try {
      console.log("🔐 Attempting login with:", email);
      const response = await apiClient.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      console.log("✅ Login response received:", response);

      // Save token
      await tokenManager.setToken(response.access_token);

      // Decode token to get user info
      const decoded = decodeJWT<DecodedToken>(response.access_token);

      // Create user object
      const user: User = {
        id: decoded.sub.toString(),
        email: decoded.email,
        name: "", // Will be fetched from profile
        role: decoded.role,
        createdAt: new Date(),
      };

      // Save user data
      await tokenManager.setUser(user);

      return user;
    } catch (error: any) {
      console.error("❌ Sign in error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  // Sign up
  async signUp(data: SignUpRequest): Promise<User> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/auth/signup",
        data
      );

      // Save token and decode
      await tokenManager.setToken(response.access_token);
      const decoded = decodeJWT<DecodedToken>(response.access_token);

      const user: User = {
        id: decoded.sub.toString(),
        email: decoded.email,
        name: data.name,
        role: decoded.role,
        createdAt: new Date(),
      };

      await tokenManager.setUser(user);
      return user;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      await apiClient.post("/auth/signout");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>("/auth/me");
      return response;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.patch<User>("/auth/profile", data);
      return response;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },

  // Update interests
  async updateInterests(interests: string[]): Promise<User> {
    try {
      const response = await apiClient.patch<User>("/auth/interests", {
        interests,
      });
      return response;
    } catch (error) {
      console.error("Update interests error:", error);
      throw error;
    }
  },
};
