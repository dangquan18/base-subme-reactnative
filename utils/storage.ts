// Utility for local storage management
// Use expo-secure-store for sensitive data in production

const storage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error("Error storing data:", error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error("Error retrieving data:", error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error("Error removing data:", error);
    }
  },

  async clear(): Promise<void> {
    try {
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  },
};

export default storage;

// Token management
export const TOKEN_KEY = "auth_token";
export const USER_KEY = "user_data";

export const tokenManager = {
  async setToken(token: string): Promise<void> {
    await storage.setItem(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return await storage.getItem(TOKEN_KEY);
  },

  async removeToken(): Promise<void> {
    await storage.removeItem(TOKEN_KEY);
  },

  async setUser(user: any): Promise<void> {
    await storage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getUser(): Promise<any | null> {
    const userData = await storage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  async removeUser(): Promise<void> {
    await storage.removeItem(USER_KEY);
  },

  async clearAuth(): Promise<void> {
    await Promise.all([
      storage.removeItem(TOKEN_KEY),
      storage.removeItem(USER_KEY),
    ]);
  },
};

// JWT Decode function
export const decodeJWT = <T = any>(token: string): T => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    throw new Error("Invalid token");
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeJWT<{ exp: number }>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};
