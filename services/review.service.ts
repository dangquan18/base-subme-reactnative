import { apiClient } from "./api";
import { Review, ReviewsResponse } from "@/types";

interface GetReviewsParams {
  page?: number;
  limit?: number;
}

interface CreateReviewRequest {
  plan_id: number;
  rating: number;
  comment: string;
}

interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export const reviewService = {
  // Get reviews for a plan
  async getPlanReviews(planId: number, params?: GetReviewsParams): Promise<ReviewsResponse> {
    try {
      const response = await apiClient.get<ReviewsResponse>(`/reviews/plan/${planId}`, { 
        params: {
          limit: params?.limit || 20,
          offset: params?.page ? (params.page - 1) * (params.limit || 20) : 0,
        }
      });
      return response;
    } catch (error) {
      console.error("Get plan reviews error:", error);
      throw error;
    }
  },

  // Create review
  async createReview(data: CreateReviewRequest): Promise<{ success: boolean; review: Review }> {
    try {
      const response = await apiClient.post<{ success: boolean; review: Review }>("/reviews", data);
      return response;
    } catch (error) {
      console.error("Create review error:", error);
      throw error;
    }
  },

  // Update review
  async updateReview(id: number, data: UpdateReviewRequest): Promise<{ success: boolean; review: Review }> {
    try {
      const response = await apiClient.patch<{ success: boolean; review: Review }>(`/reviews/${id}`, data);
      return response;
    } catch (error) {
      console.error("Update review error:", error);
      throw error;
    }
  },

  // Delete review
  async deleteReview(id: number): Promise<void> {
    try {
      await apiClient.delete(`/reviews/${id}`);
    } catch (error) {
      console.error("Delete review error:", error);
      throw error;
    }
  },
};
