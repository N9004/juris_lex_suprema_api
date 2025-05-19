// src/services/progressService.ts
import { api } from './api';
import type { LessonCompletionResponse } from '../types/entities';

export const progressService = {
  /**
   * Отмечает урок как пройденный для текущего аутентифицированного пользователя.
   * @param lessonId ID урока, который нужно отметить как пройденный.
   * @returns Объект LessonCompletionResponse, представляющий запись о прогрессе.
   */
  markLessonAsCompleted: async (lessonId: number): Promise<LessonCompletionResponse> => {
    // apiClient уже должен добавлять Authorization header благодаря интерцептору
    // в apiClient.ts, который берет токен из localStorage.
    const response = await api.post<LessonCompletionResponse>(
      `/users/me/progress/lessons/${lessonId}/complete`
      // Тело запроса не нужно для этого эндпоинта на бэкенде
    );
    return response.data;
  },

  // TODO: В будущем здесь могут быть другие функции, связанные с прогрессом:
  // - getLessonProgressForUser(userId: number, lessonId: number): Promise<LessonCompletionResponse | null>
  // - getAllProgressForUser(userId: number): Promise<LessonCompletionResponse[]>
  // - getModuleProgress(userId: number, moduleId: number): Promise<{ completedLessons: number, totalLessons: number }>
};