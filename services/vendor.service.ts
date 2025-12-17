import { Package, Review } from "@/types";
import { apiClient } from "./api";

interface VendorStats {
  total_revenue: number;
  total_packages: number;
  total_subscribers: number;
  active_subscriptions: number;
}

interface VendorOrder {
  id: number;
  status: string;
  start_date: string;
  end_date: string;
  plan: {
    id: number;
    name: string;
    price: number;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface VendorOrdersParams {
  status?: "active" | "expired" | "cancelled";
  page?: number;
  limit?: number;
}

interface VendorOrdersResponse {
  data: VendorOrder[];
  total: number;
  page: number;
  limit: number;
}

interface VendorAnalytics {
  daily_stats: {
    date: string;
    subscriptions: number;
    revenue: number;
  }[];
  total_revenue: number;
  total_subscriptions: number;
}

interface VendorReviewsParams {
  plan_id?: number;
  page?: number;
  limit?: number;
}

interface VendorReviewsResponse {
  data: Review[];
  average_rating: number;
  total: number;
  page: number;
  limit: number;
}

interface VendorInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "pending" | "active" | "approved" | "rejected";
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreatePackageRequest {
  name: string;
  description: string;
  price: number;
  duration_value: number;
  duration_unit: string;
  category_id: number;
  features: string;
  image?: string;
}

export const vendorService = {
  // Get vendor info (including status)
  async getVendorInfo(): Promise<VendorInfo> {
    try {
      const response = await apiClient.get<VendorInfo>("/vendor/info");
      return response;
    } catch (error) {
      console.error("Get vendor info error:", error);
      throw error;
    }
  },

  // Get vendor dashboard stats
  async getStats(): Promise<VendorStats> {
    try {
      const token = await localStorage.getItem("auth_token");

      const response = await apiClient.get<VendorStats>(
        "/vendor/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response;
    } catch (error) {
      console.error("Get vendor stats error:", error);
      throw error;
    }
  },

  // Get vendor packages
  async getPackages(): Promise<Package[]> {
    try {
      const response = await apiClient.get<Package[]>("/vendor/packages");
      return response;
    } catch (error) {
      console.error("Get vendor packages error:", error);
      throw error;
    }
  },

  // Create package
  async createPackage(data: CreatePackageRequest): Promise<{ success: boolean; package: Package }> {
    try {
      const response = await apiClient.post<{ success: boolean; package: Package }>(
        "/vendor/packages",
        data
      );
      return response;
    } catch (error) {
      console.error("Create package error:", error);
      throw error;
    }
  },

  // Update package
  async updatePackage(id: number, data: Partial<CreatePackageRequest>): Promise<{ success: boolean; package: Package }> {
    try {
      const response = await apiClient.patch<{ success: boolean; package: Package }>(
        `/vendor/packages/${id}`,
        data
      );
      return response;
    } catch (error) {
      console.error("Update package error:", error);
      throw error;
    }
  },

  // Delete package
  async deletePackage(id: number): Promise<void> {
    try {
      await apiClient.delete(`/vendor/packages/${id}`);
    } catch (error) {
      console.error("Delete package error:", error);
      throw error;
    }
  },

  // Get vendor orders
  async getOrders(params?: VendorOrdersParams): Promise<VendorOrdersResponse> {
    try {
      const response = await apiClient.get<VendorOrdersResponse>("/vendor/orders", { params });
      return response;
    } catch (error) {
      console.error("Get vendor orders error:", error);
      throw error;
    }
  },

  // Get vendor analytics
  async getAnalytics(start_date?: string, end_date?: string): Promise<VendorAnalytics> {
    try {
      const params = { start_date, end_date };
      const response = await apiClient.get<VendorAnalytics>("/vendor/analytics", { params });
      return response;
    } catch (error) {
      console.error("Get vendor analytics error:", error);
      throw error;
    }
  },

  // Get vendor reviews
  async getReviews(params?: VendorReviewsParams): Promise<VendorReviewsResponse> {
    try {
      const response = await apiClient.get<VendorReviewsResponse>("/vendor/reviews", { params });
      return response;
    } catch (error) {
      console.error("Get vendor reviews error:", error);
      throw error;
    }
  },
};
