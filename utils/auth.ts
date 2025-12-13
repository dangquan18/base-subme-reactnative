// Authentication utilities

import { tokenManager, isTokenExpired } from "./storage";

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await tokenManager.getToken();
    if (!token) return false;

    return !isTokenExpired(token);
  } catch (error) {
    return false;
  }
};

/**
 * Get user role from stored user data
 */
export const getUserRole = async (): Promise<"user" | "vendor" | null> => {
  try {
    const user = await tokenManager.getUser();
    return user?.role || null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if user is vendor
 */
export const isVendor = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === "vendor";
};

/**
 * Check if user is regular user
 */
export const isRegularUser = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === "user";
};

/**
 * Get user ID from stored data
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    const user = await tokenManager.getUser();
    return user?.id || null;
  } catch (error) {
    return null;
  }
};
