import { api } from './api';
import type { Module } from '../types/entities';

class ModuleService {
  async getModuleById(id: number): Promise<Module> {
    try {
      const response = await api.get<Module>(`/modules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  }

  async getAllModules(): Promise<Module[]> {
    try {
      const response = await api.get<Module[]>('/modules');
      return response.data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  }

  // Вспомогательная функция для расчета процента прогресса
  calculateProgressPercent(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  // Вспомогательная функция для форматирования прогресса
  formatProgress(completed: number, total: number): string {
    return `${completed} из ${total}`;
  }
}

export const moduleService = new ModuleService(); 