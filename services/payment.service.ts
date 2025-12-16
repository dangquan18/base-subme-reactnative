import { apiClient } from "./api";
import { Payment, VNPayResponse } from "@/types";

interface ProcessPaymentRequest {
  subscription_id: number;
  amount: number;
  payment_method: string;
  return_url: string;
}

interface PaymentHistoryParams {
  page?: number;
  limit?: number;
}

interface PaymentHistoryResponse {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
}

export const paymentService = {
  // Process payment (generate VNPay URL)
  async processPayment(data: ProcessPaymentRequest): Promise<VNPayResponse> {
    try {
      const response = await apiClient.post<VNPayResponse>("/payments/process", data);
      return response;
    } catch (error) {
      console.error("Process payment error:", error);
      throw error;
    }
  },

  // Get payment history
  async getPaymentHistory(params?: PaymentHistoryParams): Promise<PaymentHistoryResponse> {
    try {
      const response = await apiClient.get<PaymentHistoryResponse>("/payments/history", { params });
      return response;
    } catch (error) {
      console.error("Get payment history error:", error);
      throw error;
    }
  },

  // Get payment by ID
  async getPaymentById(id: number): Promise<Payment> {
    try {
      const response = await apiClient.get<Payment>(`/payments/${id}`);
      return response;
    } catch (error) {
      console.error("Get payment by ID error:", error);
      throw error;
    }
  },
};
