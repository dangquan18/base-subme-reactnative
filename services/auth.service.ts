import { apiClient } from "./api";
import { User } from "@/types";
import { tokenManager } from "@/utils/storage";

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
  };
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "user" | "vendor";
  phone?: string;
  address?: string;
  date_of_birth?: string;
}

interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export const authService = {
  // Sign in (Login)
  async signIn(email: string, password: string): Promise<User> {
    try {
      console.log("🔐 Attempting login with:", email);
      const response = await apiClient.post<any>("/auth/login", {
        email,
        password,
      });
      console.log("✅ Login response received:", response);

      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }

      // Save tokens
      await tokenManager.setToken(response.access_token);
      await tokenManager.setRefreshToken(response.refresh_token);

      // Save user data
      await tokenManager.setUser(response.user);

      return response.user;
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

  // Sign up (Register)
  async signUp(data: RegisterRequest): Promise<void> {
    try {
      console.log("📝 Attempting registration with:", data.email, "role:", data.role);
      const response = await apiClient.post<any>("/auth/register", data);
      console.log("✅ Registration response received:", response);

      // Check if response indicates failure
      if (response.success === false) {
        throw new Error(response.message || "Registration failed");
      }

      // Don't save tokens or user data - let user sign in manually
      console.log("✅ Registration successful. User needs to sign in.");
    } catch (error: any) {
      console.error("❌ Sign up error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<{ success: boolean; data: User }>("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  },

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post<{ success: boolean; message: string }>("/auth/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: { access_token: string; refresh_token: string };
      }>("/auth/refresh", {
        refresh_token: refreshToken,
      });
      return response.data;
    } catch (error) {
      console.error("Refresh token error:", error);
      throw error;
    }
  },

  // Sign out (Logout)
  async signOut(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
      await tokenManager.clearAuth();
    } catch (error) {
      console.error("Sign out error:", error);
      // Clear local data even if API call fails
      await tokenManager.clearAuth();
      throw error;
    }
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.patch<User>("/users/profile", data);
      return response;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },

  // Get user profile
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<User>("/users/profile");
      return response;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  },
};
