import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { ApiClient, ApiResponse } from '../types/api';

// Используем переменную окружения с резервным значением
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Создаем экземпляр axios с базовым URL
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Увеличиваем таймаут до 30 секунд
});

// Добавляем перехватчик для добавления токена к запросам
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Добавляем перехватчик для обработки ответов
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Создаем API-клиент с типизацией
export const api: ApiClient = {
  async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.get<T>(url, config);
      return response;
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  },

  async post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.post<T>(url, data, config);
      return response;
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  },

  async put<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.put<T>(url, data, config);
      return response;
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  },

  async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.delete<T>(url, config);
      return response;
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  },
}; 