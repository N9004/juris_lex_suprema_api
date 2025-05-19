import { api } from './api';

export interface AdminStatistics {
  active_users: number;
  total_lessons: number;
  completed_lessons_percentage: number;
}

export const adminStatisticsService = {
  async getStatistics(): Promise<AdminStatistics> {
    try {
      const response = await api.get<AdminStatistics>('/admin/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
      throw error;
    }
  }
}; 