import type { AxiosResponse } from 'axios';
import type { Lesson, LessonBlock, Question, Option } from './models';

export type ApiResponse<T> = AxiosResponse<T>;

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiClient {
  get<T>(url: string, config?: any): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: any): Promise<ApiResponse<T>>;
}

export interface CreateLessonRequest {
  title: string;
  description: string;
  module_id: number;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  module_id?: number;
}

export interface CreateLessonBlockRequest {
  order_in_lesson: number;
  block_type: 'THEORY' | 'EXERCISE';
  theory_text?: string;
  question_create_payload?: {
    question_text: string;
    question_type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT' | 'CODE';
    options?: Array<{
      text: string;
      is_correct: boolean;
    }>;
    correct_answer?: string;
  };
}

export interface UpdateLessonBlockRequest extends CreateLessonBlockRequest {} 