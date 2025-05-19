// --- Типы для Пользователей и Аутентификации ---
export interface UserBase {
  email: string;
  full_name?: string | null;
}

export interface UserCreate extends UserBase {
  password: string;
}

// Если понадобится обновлять пользователя через админку или сам пользователь свой профиль
export interface UserUpdate {
  email?: string | null;
  full_name?: string | null;
  is_active?: boolean | null;
  is_superuser?: boolean | null;
  is_email_verified?: boolean | null;
  xp_points?: number | null;
  // Пароль обычно обновляется через отдельный эндпоинт
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  is_email_verified: boolean;
  xp_points: number;
  created_at: string;
  updated_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials { 
  username: string; // email
  password: string;
}

export interface EmailVerificationPayload {
  email: string;
  code: string;
}

// --- Enum'ы для Учебного Контента ---
export enum LessonBlockType {
  THEORY = "theory",
  EXERCISE = "exercise"
}

export enum QuestionType {
  SINGLE_CHOICE = "single_choice",
  MULTIPLE_CHOICE = "multiple_choice",
  TRUE_FALSE = "true_false",
  FILL_IN_BLANK = "fill_in_blank",
  // CLASSIFY = "classify", 
  // ORDER_ITEMS = "order_items", 
  // FIND_ELEMENTS = "find_elements"
}

// --- Интерфейсы для Учебного Контента ---
export interface QuestionOption {
  id: number;
  text: string;
  is_correct: boolean;
  question_id: number;
}

export interface Question {
  id: number;
  text: string;
  question_type: QuestionType;
  general_explanation: string;
  correct_answer_text: string;
  options: QuestionOption[];
  // score?: number | null;
}

export interface LessonBlock {
  id: number;
  lesson_id: number;
  block_type: LessonBlockType;
  theory_text?: string;
  questions?: Question[];
  order: number;
  created_at: string;
  updated_at?: string;
}

export interface Lesson {
  id: number;
  title: string;
  description?: string;
  order: number;
  module_id: number;
  blocks: LessonBlock[];
  is_completed_by_user: boolean;
  created_at: string;
  updated_at?: string;
  // is_locked?: boolean; // TODO: Для будущей блокировки
}

export interface Module {
  id: number;
  title: string;
  description?: string;
  order: number;
  discipline_id: number;
  lessons: Lesson[];
  progress?: {
    completed_lessons_count: number;
    total_lessons_count: number;
    progress_percent: number;
  };
  created_at: string;
  updated_at?: string;
}

export interface Discipline {
  id: number;
  title: string;
  description?: string;
  modules: Module[];
  progress?: {
    completed_modules_count: number;
    total_modules_count: number;
    progress_percent: number;
  };
  created_at: string;
  updated_at?: string;
  // icon_url?: string; // TODO: Для будущих иконок
}

// Типы для создания и обновления сущностей
export type ModuleCreate = Omit<Module, 'id' | 'lessons'>;
export type ModuleUpdate = Partial<Omit<Module, 'id' | 'lessons'>>;

export type DisciplineCreate = Omit<Discipline, 'id' | 'modules'>;
export type DisciplineUpdate = Partial<Omit<Discipline, 'id' | 'modules'>>;

export type LessonCreate = Omit<Lesson, 'id' | 'blocks'>;
export type LessonUpdate = Partial<Omit<Lesson, 'id' | 'blocks'>>;

export type LessonBlockCreate = Omit<LessonBlock, 'id' | 'questions'>;
export type LessonBlockUpdate = Partial<Omit<LessonBlock, 'id' | 'questions'>>;

export type QuestionCreate = Omit<Question, 'id' | 'options'>;
export type QuestionUpdate = Partial<Omit<Question, 'id' | 'options'>>;

export type QuestionOptionCreate = Omit<QuestionOption, 'id' | 'question_id'>;
export type QuestionOptionUpdate = Partial<Omit<QuestionOption, 'id' | 'question_id'>>;

// Типы для ответов на вопросы
export interface QuestionAnswerSubmit {
    question_id: number;
    user_answer: string | string[] | boolean; // В зависимости от типа вопроса
}

export interface QuestionAnswerResponse {
    is_correct: boolean;
    explanation: string;
    correct_answer_details: any; // Объект с деталями правильного ответа
    xp_awarded: number;
}

// Типы для прогресса
export interface LessonCompletionResponse {
    lesson_id: number;
    xp_earned_for_this_completion: number;
    current_total_user_xp: number;
    is_first_completion: boolean;
}