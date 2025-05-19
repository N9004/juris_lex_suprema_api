import { api } from './api';
import type { 
    Lesson, 
    QuestionAnswerSubmit, 
    QuestionAnswerResponse,
    LessonCompletionResponse 
} from '../types/entities';

class LessonService {
    async getLessonById(id: number): Promise<Lesson> {
        try {
            const response = await api.get<Lesson>(`/lessons/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching lesson:', error);
            throw error;
        }
    }

    async submitQuestionAnswer(questionId: number, answer: QuestionAnswerSubmit): Promise<QuestionAnswerResponse> {
        try {
            const response = await api.post<QuestionAnswerResponse>(
                `/lessons/questions/${questionId}/submit_answer`,
                answer
            );
            return response.data;
        } catch (error) {
            console.error('Error submitting answer:', error);
            throw error;
        }
    }

    async markLessonAsCompleted(lessonId: number): Promise<LessonCompletionResponse> {
        try {
            const response = await api.post<LessonCompletionResponse>(
                `/users/me/progress/lessons/${lessonId}/complete`
            );
            return response.data;
        } catch (error) {
            console.error('Error marking lesson as completed:', error);
            throw error;
        }
    }
}

export const lessonService = new LessonService(); 