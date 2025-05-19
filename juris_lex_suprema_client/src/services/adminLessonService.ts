// src/services/adminLessonService.ts
import type { 
    Lesson, 
    LessonBlock,
    Question,
    QuestionOption,
    QuestionOptionCreate,
    QuestionOptionUpdate
} from '../types/entities';
import { LessonBlockType } from '../types/entities';
import { api } from './api';

class AdminLessonService {
  async getAllLessons(moduleId?: number): Promise<Lesson[]> {
    const url = moduleId ? `/admin/lessons/?m_id=${moduleId}` : '/admin/lessons/';
    const response = await api.get<Lesson[]>(url);
    return response.data;
  }

  async getLesson(lessonId: number): Promise<Lesson> {
    const response = await api.get<Lesson>(`/admin/lessons/${lessonId}`);
    return response.data;
  }

  async createLesson(lessonData: {
    title: string;
    order?: number;
    module_id: number;
  }): Promise<Lesson> {
    const response = await api.post<Lesson>('/admin/lessons/', lessonData);
    return response.data;
  }

  async updateLesson(id: number, lessonData: {
    title?: string;
    order?: number;
    module_id?: number;
  }): Promise<Lesson> {
    const response = await api.put<Lesson>(`/admin/lessons/${id}`, lessonData);
    return response.data;
  }

  async deleteLesson(id: number): Promise<void> {
    await api.delete(`/admin/lessons/${id}`);
  }

  async createLessonBlock(lessonId: number, blockData: {
    order_in_lesson: number;
    block_type: LessonBlockType;
    theory_text?: string;
    questions?: Array<{
      text: string;
      question_type: string;
      general_explanation: string;
      correct_answer_text: string;
      options: Array<{
        text: string;
        is_correct: boolean;
      }>;
    }>;
  }): Promise<LessonBlock> {
    console.log('Creating block with data:', blockData);
    // Преобразуем данные в формат, ожидаемый бэкендом
    const requestData = {
      order_in_lesson: blockData.order_in_lesson,
      block_type: blockData.block_type,
      ...(blockData.block_type === LessonBlockType.THEORY ? {
        theory_text: blockData.theory_text || null,
        questions: null
      } : {
        theory_text: null,
        questions: blockData.questions || []
      })
    };

    console.log('Sending block data to backend:', requestData);
    const response = await api.post<LessonBlock>(`/admin/lessons/${lessonId}/blocks/`, requestData);
    console.log('Received response from backend:', response.data);
    return response.data;
  }

  async updateLessonBlock(lessonId: number, blockId: number, blockData: {
    order_in_lesson: number;
    block_type: LessonBlockType;
    theory_text?: string;
    questions?: Array<{
      text: string;
      question_type: string;
      general_explanation: string;
      correct_answer_text: string;
      options: Array<{
        text: string;
        is_correct: boolean;
      }>;
    }>;
  }): Promise<LessonBlock> {
    console.log('Updating block with data:', blockData);
    // Преобразуем данные в формат, ожидаемый бэкендом
    const requestData = {
      order_in_lesson: blockData.order_in_lesson,
      block_type: blockData.block_type,
      ...(blockData.block_type === LessonBlockType.THEORY ? {
        theory_text: blockData.theory_text || null,
        questions: null
      } : {
        theory_text: null,
        questions: blockData.questions || []
      })
    };

    console.log('Sending update data to backend:', requestData);
    const response = await api.put<LessonBlock>(`/admin/blocks/${blockId}`, requestData);
    console.log('Received response from backend:', response.data);
    return response.data;
  }

  async deleteLessonBlock(lessonId: number, blockId: number): Promise<void> {
    await api.delete(`/admin/blocks/${blockId}`);
  }

  // === Question Option Admin CRUD ===
  async createQuestionOption(questionId: number, data: QuestionOptionCreate): Promise<QuestionOption> {
    const response = await api.post<QuestionOption>(`/admin/questions/${questionId}/options/`, data);
    return response.data;
  }

  async updateQuestionOption(optionId: number, data: QuestionOptionUpdate): Promise<QuestionOption> {
    const response = await api.put<QuestionOption>(`/admin/options/${optionId}`, data);
    return response.data;
  }

  async deleteQuestionOption(optionId: number): Promise<void> {
    await api.delete(`/admin/options/${optionId}`);
  }
}

export const adminLessonService = new AdminLessonService();