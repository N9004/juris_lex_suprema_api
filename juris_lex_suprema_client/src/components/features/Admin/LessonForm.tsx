// src/components/features/Admin/LessonForm.tsx
import React, { useState, useEffect } from 'react';
import type { Lesson, Module, LessonCreate, LessonUpdate } from '../../../types/entities';
import { cn } from '../../../utils/cn';

interface LessonFormProps {
  initialData?: Lesson | null;
  modules: Module[];
  onSubmit: (data: LessonCreate | LessonUpdate) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitButtonText: string;
}

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;
const MIN_ORDER = 1;
const MAX_ORDER = 100;

const LessonForm: React.FC<LessonFormProps> = ({
  initialData,
  modules,
  onSubmit,
  onCancel,
  isSubmitting,
  submitButtonText
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [order, setOrder] = useState(initialData?.order || 1);
  const [moduleId, setModuleId] = useState(initialData?.module_id?.toString() || '');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setOrder(initialData.order);
      setModuleId(initialData.module_id.toString());
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setFormError('Название урока обязательно');
      return false;
    }
    if (title.length > MAX_TITLE_LENGTH) {
      setFormError(`Название не должно превышать ${MAX_TITLE_LENGTH} символов`);
      return false;
    }
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setFormError(`Описание не должно превышать ${MAX_DESCRIPTION_LENGTH} символов`);
      return false;
    }
    if (!moduleId) {
      setFormError('Выберите модуль');
      return false;
    }
    if (order < MIN_ORDER || order > MAX_ORDER) {
      setFormError(`Порядок должен быть от ${MIN_ORDER} до ${MAX_ORDER}`);
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = {
      title: title.trim(),
      description: description.trim() || undefined,
      order: order,
      module_id: parseInt(moduleId)
    };

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-md bg-red-50 p-4" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{formError}</h3>
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Название урока
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={cn(
              'block w-full rounded-md shadow-sm',
              'focus:ring-primary focus:border-primary sm:text-sm',
              'border-gray-300'
            )}
            placeholder="Введите название урока"
            maxLength={MAX_TITLE_LENGTH}
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {title.length}/{MAX_TITLE_LENGTH} символов
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Описание
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={cn(
              'block w-full rounded-md shadow-sm',
              'focus:ring-primary focus:border-primary sm:text-sm',
              'border-gray-300'
            )}
            placeholder="Введите описание урока (необязательно)"
            maxLength={MAX_DESCRIPTION_LENGTH}
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {description.length}/{MAX_DESCRIPTION_LENGTH} символов
        </p>
      </div>

      <div>
        <label htmlFor="module" className="block text-sm font-medium text-gray-700">
          Модуль
        </label>
        <div className="mt-1">
          <select
            id="module"
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className={cn(
              'block w-full rounded-md shadow-sm',
              'focus:ring-primary focus:border-primary sm:text-sm',
              'border-gray-300'
            )}
          >
            <option value="">Выберите модуль...</option>
            {modules.map(module => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="order" className="block text-sm font-medium text-gray-700">
          Порядок
        </label>
        <div className="mt-1">
          <input
            type="number"
            id="order"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value))}
            min={MIN_ORDER}
            max={MAX_ORDER}
            className={cn(
              'block w-full rounded-md shadow-sm',
              'focus:ring-primary focus:border-primary sm:text-sm',
              'border-gray-300'
            )}
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Значение от {MIN_ORDER} до {MAX_ORDER}
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            'px-4 py-2 border border-gray-300 rounded-md shadow-sm',
            'text-sm font-medium text-gray-700 bg-white',
            'hover:bg-gray-50 focus:outline-none focus:ring-2',
            'focus:ring-offset-2 focus:ring-primary',
            'transition-colors duration-200'
          )}
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'px-4 py-2 border border-transparent rounded-md shadow-sm',
            'text-sm font-medium text-white bg-primary',
            'hover:bg-primary-dark focus:outline-none focus:ring-2',
            'focus:ring-offset-2 focus:ring-primary',
            'transition-colors duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Сохранение...
            </div>
          ) : (
            submitButtonText
          )}
        </button>
      </div>
    </form>
  );
};

export default LessonForm;