// src/components/features/Admin/DisciplineForm.tsx
import React, { useState, useEffect } from 'react';
import type { DisciplineCreate, DisciplineUpdate, Discipline } from '../../../types/entities';
import { cn } from '../../../utils/cn';

interface DisciplineFormProps {
  initialData?: Discipline | null;
  onSubmit: (data: DisciplineCreate | DisciplineUpdate) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitButtonText?: string;
}

const DisciplineForm: React.FC<DisciplineFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitButtonText = "Сохранить"
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [initialData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    
    if (!title.trim()) {
      setFormError('Название дисциплины не может быть пустым.');
      return;
    }

    const dataToSubmit: DisciplineCreate | DisciplineUpdate = {
      title: title.trim(),
      description: description.trim() || undefined
    };
    
    await onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {initialData ? `Редактировать дисциплину: ${initialData.title}` : 'Создать новую дисциплину'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Заполните информацию о дисциплине. Все поля, отмеченные звездочкой (*), обязательны для заполнения.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="discipline-title" className="block text-sm font-medium text-gray-700">
            Название дисциплины <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="discipline-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={cn(
                'block w-full rounded-md shadow-sm',
                'focus:ring-primary focus:border-primary sm:text-sm',
                'border-gray-300'
              )}
              placeholder="Введите название дисциплины"
            />
          </div>
        </div>

        <div>
          <label htmlFor="discipline-description" className="block text-sm font-medium text-gray-700">
            Описание
          </label>
          <div className="mt-1">
            <textarea
              id="discipline-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={cn(
                'block w-full rounded-md shadow-sm',
                'focus:ring-primary focus:border-primary sm:text-sm',
                'border-gray-300'
              )}
              placeholder="Введите описание дисциплины"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Краткое описание дисциплины и её основных целей.
          </p>
        </div>

        {formError && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md',
            'text-gray-700 bg-white border border-gray-300',
            'hover:bg-gray-50 focus:outline-none focus:ring-2',
            'focus:ring-offset-2 focus:ring-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md',
            'text-white bg-primary border border-transparent',
            'hover:bg-primary-dark focus:outline-none focus:ring-2',
            'focus:ring-offset-2 focus:ring-primary',
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

export default DisciplineForm;