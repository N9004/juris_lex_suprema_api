import React, { useState, useEffect } from 'react';
import type { LessonBlock } from '../../../types/entities';
import { LessonBlockType, QuestionType } from '../../../types/entities';
import { cn } from '../../../utils/cn';
import Button from '../../ui/Button';

interface ExerciseBlockFormProps {
  lessonId: number;
  blockOrder: number;
  initialData?: LessonBlock | null;
  onSubmit: (blockData: {
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
  }) => Promise<void>;
  onCancel: () => void;
}

const MAX_QUESTION_LENGTH = 1000;
const MAX_EXPLANATION_LENGTH = 2000;
const MAX_OPTION_LENGTH = 500;

const ExerciseBlockForm: React.FC<ExerciseBlockFormProps> = ({
  lessonId,
  blockOrder,
  initialData,
  onSubmit,
  onCancel
}) => {
  const [questionText, setQuestionText] = useState(initialData?.questions?.[0]?.text || '');
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.SINGLE_CHOICE);
  const [generalExplanation, setGeneralExplanation] = useState(initialData?.questions?.[0]?.general_explanation || '');
  const [correctAnswerText, setCorrectAnswerText] = useState(initialData?.questions?.[0]?.correct_answer_text || '');
  const [options, setOptions] = useState<Array<{ text: string; is_correct: boolean }>>(
    initialData?.questions?.[0]?.options || [{ text: '', is_correct: false }]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    switch (questionType) {
      case QuestionType.TRUE_FALSE:
        setOptions([
          { text: 'Верно', is_correct: false },
          { text: 'Неверно', is_correct: false }
        ]);
        break;
      case QuestionType.FILL_IN_BLANK:
        setOptions([]);
        break;
      case QuestionType.SINGLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE:
        if (options.length === 0) {
          setOptions([{ text: '', is_correct: false }]);
        }
        break;
    }
  }, [questionType]);

  const handleAddOption = () => {
    setOptions([...options, { text: '', is_correct: false }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: 'text' | 'is_correct', value: string | boolean) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    
    if (field === 'is_correct' && value === true && questionType === QuestionType.SINGLE_CHOICE) {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.is_correct = false;
      });
    }
    
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionText.trim()) {
      setError('Текст вопроса не может быть пустым');
      return;
    }

    if (questionText.length > MAX_QUESTION_LENGTH) {
      setError(`Текст вопроса не должен превышать ${MAX_QUESTION_LENGTH} символов`);
      return;
    }

    if (generalExplanation.length > MAX_EXPLANATION_LENGTH) {
      setError(`Объяснение не должно превышать ${MAX_EXPLANATION_LENGTH} символов`);
      return;
    }

    if (questionType === QuestionType.FILL_IN_BLANK) {
      if (!correctAnswerText.trim()) {
        setError('Для вопроса с пропуском необходимо указать правильный ответ');
        return;
      }
      if (correctAnswerText.length > MAX_OPTION_LENGTH) {
        setError(`Правильный ответ не должен превышать ${MAX_OPTION_LENGTH} символов`);
        return;
      }
    } else {
      if (options.length < 2) {
        setError('Должно быть как минимум 2 варианта ответа');
        return;
      }
      if (!options.some(opt => opt.is_correct)) {
        setError('Должен быть выбран хотя бы один правильный ответ');
        return;
      }
      if (options.some(opt => !opt.text.trim())) {
        setError('Все варианты ответа должны быть заполнены');
        return;
      }
      if (options.some(opt => opt.text.length > MAX_OPTION_LENGTH)) {
        setError(`Варианты ответа не должны превышать ${MAX_OPTION_LENGTH} символов`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const blockData = {
        order_in_lesson: blockOrder,
        block_type: LessonBlockType.EXERCISE,
        questions: [{
          text: questionText.trim(),
          question_type: questionType,
          general_explanation: generalExplanation.trim(),
          correct_answer_text: correctAnswerText.trim(),
          options: options.map(opt => ({
            text: opt.text.trim(),
            is_correct: opt.is_correct
          }))
        }]
      };
      await onSubmit(blockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении блока');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOptionsSection = () => {
    if (questionType === QuestionType.FILL_IN_BLANK) {
      return (
        <div>
          <label htmlFor="correctAnswerText" className="block text-sm font-medium text-gray-700">
            Правильный ответ
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="correctAnswerText"
              value={correctAnswerText}
              onChange={(e) => setCorrectAnswerText(e.target.value)}
              className={cn(
                'block w-full rounded-md shadow-sm',
                'focus:ring-primary focus:border-primary sm:text-sm',
                'border-gray-300'
              )}
              placeholder="Введите правильный ответ..."
              maxLength={MAX_OPTION_LENGTH}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {correctAnswerText.length}/{MAX_OPTION_LENGTH} символов
          </p>
        </div>
      );
    }

    if (questionType === QuestionType.SINGLE_CHOICE || questionType === QuestionType.MULTIPLE_CHOICE) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">Варианты ответов</h4>
            <Button
              type="button"
              onClick={handleAddOption}
              variant="text"
              size="sm"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Добавить вариант
            </Button>
          </div>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start space-x-3 p-3 rounded-md',
                  'border border-gray-200 bg-white'
                )}
              >
                <div className="flex-1">
                  <textarea
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    placeholder="Введите вариант ответа"
                    className={cn(
                      'block w-full rounded-md shadow-sm',
                      'focus:ring-primary focus:border-primary sm:text-sm',
                      'border-gray-300'
                    )}
                    rows={2}
                    maxLength={MAX_OPTION_LENGTH}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {option.text.length}/{MAX_OPTION_LENGTH} символов
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="inline-flex items-center">
                    <input
                      type={questionType === QuestionType.SINGLE_CHOICE ? 'radio' : 'checkbox'}
                      checked={option.is_correct}
                      onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                      name="correct-answer"
                      className={cn(
                        'rounded border-gray-300',
                        'text-primary focus:ring-primary',
                        'transition-colors duration-200'
                      )}
                    />
                    <span className="ml-2 text-sm text-gray-600">Правильный</span>
                  </label>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className={cn(
                        'text-gray-400 hover:text-red-500',
                        'transition-colors duration-200'
                      )}
                      title="Удалить вариант"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (questionType === QuestionType.TRUE_FALSE) {
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Выберите правильный ответ:</h4>
          <div className="grid grid-cols-2 gap-4">
            {options.map((option, index) => (
              <label
                key={index}
                className={cn(
                  'relative flex items-center p-4 rounded-md',
                  'border border-gray-200 bg-white',
                  'cursor-pointer hover:bg-gray-50',
                  'transition-colors duration-200'
                )}
              >
                <input
                  type="radio"
                  name="true-false"
                  checked={option.is_correct}
                  onChange={() => handleOptionChange(index, 'is_correct', true)}
                  className="sr-only"
                />
                <span className={cn(
                  'flex-1 text-sm font-medium',
                  option.is_correct ? 'text-primary' : 'text-gray-900'
                )}>
                  {option.text}
                </span>
                {option.is_correct && (
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </label>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {initialData ? 'Редактирование блока упражнения' : 'Новый блок упражнения'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Порядок блока: {blockOrder}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="questionType" className="block text-sm font-medium text-gray-700">
            Тип вопроса
          </label>
          <div className="mt-1">
            <select
              id="questionType"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as QuestionType)}
              className={cn(
                'block w-full rounded-md shadow-sm',
                'focus:ring-primary focus:border-primary sm:text-sm',
                'border-gray-300'
              )}
            >
              <option value={QuestionType.SINGLE_CHOICE}>Один правильный ответ</option>
              <option value={QuestionType.MULTIPLE_CHOICE}>Несколько правильных ответов</option>
              <option value={QuestionType.TRUE_FALSE}>Верно/Неверно</option>
              <option value={QuestionType.FILL_IN_BLANK}>Заполнить пропуск</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="questionText" className="block text-sm font-medium text-gray-700">
            Текст вопроса
          </label>
          <div className="mt-1">
            <textarea
              id="questionText"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className={cn(
                'block w-full rounded-md shadow-sm',
                'focus:ring-primary focus:border-primary sm:text-sm',
                'border-gray-300'
              )}
              rows={3}
              placeholder="Введите текст вопроса..."
              maxLength={MAX_QUESTION_LENGTH}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {questionText.length}/{MAX_QUESTION_LENGTH} символов
          </p>
        </div>

        <div>
          <label htmlFor="generalExplanation" className="block text-sm font-medium text-gray-700">
            Объяснение (необязательно)
          </label>
          <div className="mt-1">
            <textarea
              id="generalExplanation"
              value={generalExplanation}
              onChange={(e) => setGeneralExplanation(e.target.value)}
              className={cn(
                'block w-full rounded-md shadow-sm',
                'focus:ring-primary focus:border-primary sm:text-sm',
                'border-gray-300'
              )}
              rows={3}
              placeholder="Введите объяснение правильного ответа..."
              maxLength={MAX_EXPLANATION_LENGTH}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {generalExplanation.length}/{MAX_EXPLANATION_LENGTH} символов
          </p>
        </div>

        {renderOptionsSection()}

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

export default ExerciseBlockForm; 