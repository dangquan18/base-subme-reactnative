import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { tokenManager } from "@/utils/storage";

// Base API configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        console.log(
          "🚀 API Request:",
          config.method?.toUpperCase(),
          config.url
        );
        console.log("📦 Data:", config.data);

        // Add auth token if exists
        const token = await tokenManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error("❌ Request Error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log("✅ API Response:", response.status, response.config.url);
        console.log("📥 Response Data:", response.data);
        return response;
      },
      async (error) => {
        // CORS Error
        if (!error.response) {
          console.error("❌ CORS Error or Network Error:", error.message);
          console.error("Đọc file CORS_FIX.md để biết cách fix backend!");
        } else {
          console.error(
            "❌ API Error:",
            error.response?.status,
            error.response?.data
          );
        }

        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          await tokenManager.clearAuth();
          console.log("Unauthorized - redirect to login");
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config
    );
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(
      url,
      data,
      config
    );
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
