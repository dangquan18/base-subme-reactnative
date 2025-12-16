import { apiClient } from "./api";
import { Package, Category } from "@/types";

interface GetPackagesParams {
  category?: number;
  vendor?: number;
  min_price?: number;
  max_price?: number;
  duration_unit?: "ngày" | "tuần" | "tháng" | "năm";
  sort?: "price_asc" | "price_desc" | "popular" | "rating";
  page?: number;
  limit?: number;
}

interface PackagesResponse {
  packages: Package[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface SearchPackagesParams {
  keyword: string;
  page?: number;
  limit?: number;
}

export const packageService = {
  // Get all packages with filters
  async getPackages(params?: GetPackagesParams): Promise<PackagesResponse> {
    try {
      const response = await apiClient.get<PackagesResponse>("/packages", {
        params,
      });
      return response;
    } catch (error) {
      console.error("Get packages error:", error);
      throw error;
    }
  },

  // Get package by ID
  async getPackageById(id: number): Promise<Package> {
    try {
      const response = await apiClient.get<Package>(`/packages/${id}`);
      return response;
    } catch (error) {
      console.error("Get package by ID error:", error);
      throw error;
    }
  },

  // Get featured packages
  async getFeaturedPackages(limit?: number): Promise<Package[]> {
    try {
      const response = await apiClient.get<Package[]>("/packages/featured", {
        params: { limit },
      });
      return response;
    } catch (error) {
      console.error("Get featured packages error:", error);
      throw error;
    }
  },

  // Get packages by category
  async getPackagesByCategory(categoryId: number): Promise<Package[]> {
    try {
      const response = await apiClient.get<Package[]>(
        `/packages/category/${categoryId}`
      );
      return response;
    } catch (error) {
      console.error("Get packages by category error:", error);
      throw error;
    }
  },

  // Search packages
  async searchPackages(params: SearchPackagesParams): Promise<PackagesResponse> {
    try {
      const response = await apiClient.get<PackagesResponse>("/packages/search", {
        params,
      });
      return response;
    } catch (error) {
      console.error("Search packages error:", error);
      throw error;
    }
  },

  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<Category[]>("/categories");
      return response;
    } catch (error) {
      console.error("Get categories error:", error);
      throw error;
    }
  },

  // Get category detail with packages
  async getCategoryDetail(id: number): Promise<Category & { plans: Package[] }> {
    try {
      const response = await apiClient.get<Category & { plans: Package[] }>(
        `/categories/${id}`
      );
      return response;
    } catch (error) {
      console.error("Get category detail error:", error);
      throw error;
    }
  },

  // Get user favorites
  async getFavorites(): Promise<Package[]> {
    try {
      const response = await apiClient.get<Package[]>("/users/favorites");
      return response;
    } catch (error) {
      console.error("Get favorites error:", error);
      throw error;
    }
  },

  // Add to favorites
  async addToFavorites(planId: number): Promise<void> {
    try {
      await apiClient.post(`/users/favorites/${planId}`);
    } catch (error) {
      console.error("Add to favorites error:", error);
      throw error;
    }
  },

  // Remove from favorites
  async removeFromFavorites(planId: number): Promise<void> {
    try {
      await apiClient.delete(`/users/favorites/${planId}`);
    } catch (error) {
      console.error("Remove from favorites error:", error);
      throw error;
    }
  },
};
