import { apiClient } from "./api";
import { Package, PackageCategory } from "@/types";

interface GetPackagesParams {
  category?: PackageCategory;
  search?: string;
  limit?: number;
  offset?: number;
}

interface PackagesResponse {
  packages: Package[];
  total: number;
  hasMore: boolean;
}

export const packageService = {
  // Get all packages
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
  async getPackageById(id: string): Promise<Package> {
    try {
      const response = await apiClient.get<Package>(`/packages/${id}`);
      return response;
    } catch (error) {
      console.error("Get package by ID error:", error);
      throw error;
    }
  },

  // Get featured packages
  async getFeaturedPackages(): Promise<Package[]> {
    try {
      const response = await apiClient.get<Package[]>("/packages/featured");
      return response;
    } catch (error) {
      console.error("Get featured packages error:", error);
      throw error;
    }
  },

  // Get packages by category
  async getPackagesByCategory(category: PackageCategory): Promise<Package[]> {
    try {
      const response = await apiClient.get<Package[]>(
        `/packages/category/${category}`
      );
      return response;
    } catch (error) {
      console.error("Get packages by category error:", error);
      throw error;
    }
  },

  // Search packages
  async searchPackages(query: string): Promise<Package[]> {
    try {
      const response = await apiClient.get<Package[]>("/packages/search", {
        params: { q: query },
      });
      return response;
    } catch (error) {
      console.error("Search packages error:", error);
      throw error;
    }
  },
};
