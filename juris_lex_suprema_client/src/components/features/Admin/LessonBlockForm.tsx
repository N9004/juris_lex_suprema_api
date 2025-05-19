import React, { useState } from 'react';
import type { LessonBlock } from '../../../types/entities';
import { LessonBlockType } from '../../../types/entities';
import { cn } from '../../../utils/cn';
import Button from '../../ui/Button';

interface LessonBlockFormProps {
  lessonId: number;
  blockOrder: number;
  initialData?: LessonBlock | null;
  onSubmit: (blockData: {
    order_in_lesson: number;
    block_type: LessonBlockType;
    theory_text?: string;
    question?: {
      text: string;
      question_type: string;
      general_explanation: string;
      correct_answer_text: string;
      options: Array<{
        text: string;
        is_correct: boolean;
      }>;
    };
  }) => Promise<void>;
  onCancel: () => void;
}

const MAX_THEORY_LENGTH = 10000;

const LessonBlockForm: React.FC<LessonBlockFormProps> = ({
  lessonId,
  blockOrder,
  initialData,
  onSubmit,
  onCancel
}) => {
  const [theoryText, setTheoryText] = useState(initialData?.theory_text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theoryText.trim()) {
      setError('Текст теории не может быть пустым');
      return;
    }

    if (theoryText.length > MAX_THEORY_LENGTH) {
      setError(`Текст теории не должен превышать ${MAX_THEORY_LENGTH} символов`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        order_in_lesson: blockOrder,
        block_type: LessonBlockType.THEORY,
        theory_text: theoryText.trim()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении блока');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {initialData ? 'Редактирование блока теории' : 'Новый блок теории'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Порядок блока: {blockOrder}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="theoryText" className="block text-sm font-medium text-gray-700">
            Текст теории
          </label>
          <div className="mt-1">
            <textarea
              id="theoryText"
              value={theoryText}
              onChange={(e) => setTheoryText(e.target.value)}
              rows={10}
              className={cn(
                'block w-full rounded-md shadow-sm',
                'focus:ring-primary focus:border-primary sm:text-sm',
                'border-gray-300'
              )}
              placeholder="Введите текст теории..."
              maxLength={MAX_THEORY_LENGTH}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {theoryText.length}/{MAX_THEORY_LENGTH} символов
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            variant="outline"
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            icon={isSubmitting ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : undefined}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LessonBlockForm; 