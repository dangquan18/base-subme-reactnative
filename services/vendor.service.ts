import { apiClient } from "./api";

interface VendorStats {
  totalRevenue: number;
  newOrders: number;
  activePackages: number;
  averageRating: number;
}

interface VendorPackage {
  id: string;
  name: string;
  price: number;
  status: "active" | "inactive";
  subscribers: number;
}

interface VendorOrder {
  id: string;
  customerName: string;
  packageName: string;
  amount: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  createdAt: string;
}

export const vendorService = {
  // Get vendor dashboard stats
  async getStats(): Promise<VendorStats> {
    try {
      const response = await apiClient.get<VendorStats>("/vendor/stats");
      return response;
    } catch (error) {
      console.error("Get vendor stats error:", error);
      throw error;
    }
  },

  // Get vendor packages
  async getPackages(): Promise<VendorPackage[]> {
    try {
      const response = await apiClient.get<VendorPackage[]>("/vendor/packages");
      return response;
    } catch (error) {
      console.error("Get vendor packages error:", error);
      throw error;
    }
  },

  // Create package
  async createPackage(data: Partial<VendorPackage>): Promise<VendorPackage> {
    try {
      const response = await apiClient.post<VendorPackage>(
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
  async updatePackage(
    id: string,
    data: Partial<VendorPackage>
  ): Promise<VendorPackage> {
    try {
      const response = await apiClient.patch<VendorPackage>(
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
  async deletePackage(id: string): Promise<void> {
    try {
      await apiClient.delete(`/vendor/packages/${id}`);
    } catch (error) {
      console.error("Delete package error:", error);
      throw error;
    }
  },

  // Get vendor orders
  async getOrders(): Promise<VendorOrder[]> {
    try {
      const response = await apiClient.get<VendorOrder[]>("/vendor/orders");
      return response;
    } catch (error) {
      console.error("Get vendor orders error:", error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(
    id: string,
    status: VendorOrder["status"]
  ): Promise<VendorOrder> {
    try {
      const response = await apiClient.patch<VendorOrder>(
        `/vendor/orders/${id}`,
        { status }
      );
      return response;
    } catch (error) {
      console.error("Update order status error:", error);
      throw error;
    }
  },
};
