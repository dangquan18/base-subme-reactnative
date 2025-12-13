import { apiClient } from "./api";
import { Payment, PaymentMethod } from "@/types";

interface CreatePaymentRequest {
  subscriptionId: string;
  paymentMethodId: string;
  amount: number;
}

interface ProcessPaymentResponse {
  payment: Payment;
  paymentUrl?: string; // For MoMo/VNPay redirect
}

export const paymentService = {
  // Get payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await apiClient.get<PaymentMethod[]>(
        "/payments/methods"
      );
      return response;
    } catch (error) {
      console.error("Get payment methods error:", error);
      throw error;
    }
  },

  // Add payment method
  async addPaymentMethod(data: Partial<PaymentMethod>): Promise<PaymentMethod> {
    try {
      const response = await apiClient.post<PaymentMethod>(
        "/payments/methods",
        data
      );
      return response;
    } catch (error) {
      console.error("Add payment method error:", error);
      throw error;
    }
  },

  // Remove payment method
  async removePaymentMethod(id: string): Promise<void> {
    try {
      await apiClient.delete(`/payments/methods/${id}`);
    } catch (error) {
      console.error("Remove payment method error:", error);
      throw error;
    }
  },

  // Set default payment method
  async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    try {
      const response = await apiClient.post<PaymentMethod>(
        `/payments/methods/${id}/default`
      );
      return response;
    } catch (error) {
      console.error("Set default payment method error:", error);
      throw error;
    }
  },

  // Create payment
  async createPayment(
    data: CreatePaymentRequest
  ): Promise<ProcessPaymentResponse> {
    try {
      const response = await apiClient.post<ProcessPaymentResponse>(
        "/payments",
        data
      );
      return response;
    } catch (error) {
      console.error("Create payment error:", error);
      throw error;
    }
  },

  // Get payment history
  async getPaymentHistory(): Promise<Payment[]> {
    try {
      const response = await apiClient.get<Payment[]>("/payments/history");
      return response;
    } catch (error) {
      console.error("Get payment history error:", error);
      throw error;
    }
  },

  // Get payment by ID
  async getPaymentById(id: string): Promise<Payment> {
    try {
      const response = await apiClient.get<Payment>(`/payments/${id}`);
      return response;
    } catch (error) {
      console.error("Get payment by ID error:", error);
      throw error;
    }
  },

  // Verify payment (callback from MoMo/VNPay)
  async verifyPayment(paymentId: string, data: any): Promise<Payment> {
    try {
      const response = await apiClient.post<Payment>(
        `/payments/${paymentId}/verify`,
        data
      );
      return response;
    } catch (error) {
      console.error("Verify payment error:", error);
      throw error;
    }
  },
};
