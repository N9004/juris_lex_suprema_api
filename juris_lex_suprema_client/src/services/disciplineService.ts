// src/services/disciplineService.ts
import { api } from './api';
import type { 
    Discipline, DisciplineCreate, DisciplineUpdate, 
    Module, ModuleCreate, ModuleUpdate, 
    Lesson // Для getLessonById
} from '../types/entities'; // Убедитесь, что все эти типы экспортируются из entities.ts

const checkAuth = (): void => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
};

class DisciplineService {
  async getAllDisciplines(): Promise<Discipline[]> {
    const response = await api.get<Discipline[]>('/disciplines/');
    return response.data;
  }

  async getDisciplineById(id: number): Promise<Discipline> {
    const response = await api.get<Discipline>(`/disciplines/${id}`);
    return response.data;
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

  // === Публичные методы для получения контента ===
  
  /**
   * Получает список всех модулей (публичный доступ).
   */
  async getAllModules(): Promise<Module[]> {
    try {
      const response = await api.get<Module[]>('/modules');
      return response.data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  }

  /**
   * Получает один модуль по ID (публичный доступ).
   * Бэкенд возвращает модуль с вложенными уроками.
   */
  async getModule(moduleId: number): Promise<Module> {
    try {
      const response = await api.get<Module>(`/modules/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  }

  /**
   * Получает один урок по ID (публичный доступ).
   * Бэкенд возвращает урок с вложенными блоками (теорией и вопросами/опциями).
   */
  async getLessonById(lessonId: number): Promise<Lesson> {
    try {
      const response = await api.get<Lesson>(`/lessons/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    }
  }
  
  // TODO: Можно добавить публичные методы для получения модулей дисциплины или уроков модуля, если это нужно отдельно от полной загрузки родителя.
  // getModulesForDiscipline: async (disciplineId: number, skip: number = 0, limit: number = 100): Promise<Module[]> => { ... }
  // getLessonsForModule: async (moduleId: number, skip: number = 0, limit: number = 100): Promise<Lesson[]> => { ... }


  // === Методы для администрирования Дисциплин ===
  // (Требуют токена суперпользователя, который apiClient должен добавлять автоматически)

  async createDisciplineAdmin(disciplineData: {
    title: string;
    description: string;
    order?: number;
  }): Promise<Discipline> {
    try {
      checkAuth();
      const response = await api.post<Discipline>('/admin/disciplines', disciplineData);
      return response.data;
    } catch (error) {
      console.error('Error creating discipline:', error);
      throw error;
    }
  }

  async updateDisciplineAdmin(disciplineId: number, disciplineData: {
    title?: string;
    description?: string;
    order?: number;
  }): Promise<Discipline> {
    try {
      checkAuth();
      const response = await api.put<Discipline>(`/admin/disciplines/${disciplineId}`, disciplineData);
      return response.data;
    } catch (error) {
      console.error('Error updating discipline:', error);
      throw error;
    }
  }

  async deleteDisciplineAdmin(disciplineId: number): Promise<void> {
    try {
      checkAuth();
      await api.delete(`/admin/disciplines/${disciplineId}`);
    } catch (error) {
      console.error('Error deleting discipline:', error);
      throw error;
    }
  }


  // === Методы для администрирования Модулей ===
  // (Требуют токена суперпользователя)

  /**
   * Получает список ВСЕХ модулей (для админки).
   * Бэкенд должен вернуть модули с информацией о их дисциплине и, возможно, уроках.
   */
  async getAllModulesAdmin(skip: number = 0, limit: number = 100): Promise<Module[]> {
    try {
      checkAuth();
      const response = await api.get<Module[]>(`/admin/modules?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  }

  async getModuleAdmin(moduleId: number): Promise<Module> {
    try {
      checkAuth();
      const response = await api.get<Module>(`/admin/modules/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  }

  async createModuleAdmin(moduleData: {
    title: string;
    description?: string;
    order?: number;
    discipline_id: number;
  }): Promise<Module> {
    const response = await api.post<Module>('/admin/modules/', moduleData);
    return response.data;
  }

  async updateModuleAdmin(moduleId: number, moduleData: {
    title?: string;
    description?: string;
    discipline_id?: number;
    order?: number;
  }): Promise<Module> {
    try {
      checkAuth();
      const response = await api.put<Module>(`/admin/modules/${moduleId}`, moduleData);
      return response.data;
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  }

  async deleteModuleAdmin(moduleId: number): Promise<void> {
    try {
      checkAuth();
      await api.delete(`/admin/modules/${moduleId}`);
    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  }

  // TODO: Позже здесь будут методы для администрирования Уроков, Блоков, Вопросов, Опций
  // createLessonAdmin, updateLessonAdmin, deleteLessonAdmin и т.д.

  async getAllDisciplinesAdmin(skip: number = 0, limit: number = 100): Promise<Discipline[]> {
    try {
      checkAuth();
      const response = await api.get<Discipline[]>(`/admin/disciplines?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching disciplines:', error);
      throw error;
    }
  }

  async getDisciplineAdmin(disciplineId: number): Promise<Discipline> {
    try {
      checkAuth();
      const response = await api.get<Discipline>(`/admin/disciplines/${disciplineId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching discipline:', error);
      throw error;
    }
  }
}

export const disciplineService = new DisciplineService();