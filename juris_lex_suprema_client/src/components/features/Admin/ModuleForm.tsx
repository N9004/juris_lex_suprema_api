// src/components/features/Admin/ModuleForm.tsx
import React, { useState, useEffect } from 'react';
import type { ModuleCreate, ModuleUpdate, Module, Discipline } from '../../../types/entities';
import { cn } from '../../../utils/cn';
import Button from '../../ui/Button';

// Константы для валидации
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MIN_ORDER = 0;
const MAX_ORDER = 999;

interface ModuleFormProps {
  initialData?: Module | null;
  disciplines: Discipline[];
  onSubmit: (data: ModuleCreate | ModuleUpdate) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitButtonText?: string;
}

interface FormState {
  title: string;
  description: string;
  order: number;
  disciplineId: string;
}

const ModuleForm: React.FC<ModuleFormProps> = ({
  initialData,
  disciplines,
  onSubmit,
  onCancel,
  isSubmitting,
  submitButtonText = "Сохранить"
}) => {
  const [formState, setFormState] = useState<FormState>({
    title: '',
    description: '',
    order: 0,
    disciplineId: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormState({
        title: initialData.title || '',
        description: initialData.description || '',
        order: initialData.order || 0,
        disciplineId: initialData.discipline_id?.toString() || ''
      });
    } else {
      setFormState({
        title: '',
        description: '',
        order: 0,
        disciplineId: disciplines.length > 0 ? disciplines[0].id.toString() : ''
      });
    }
  }, [initialData, disciplines]);

  const validateForm = (): boolean => {
    if (!formState.title.trim()) {
      setFormError('Название модуля не может быть пустым.');
      return false;
    }
    if (formState.title.length > MAX_TITLE_LENGTH) {
      setFormError(`Название модуля не может быть длиннее ${MAX_TITLE_LENGTH} символов.`);
      return false;
    }
    if (formState.description.length > MAX_DESCRIPTION_LENGTH) {
      setFormError(`Описание не может быть длиннее ${MAX_DESCRIPTION_LENGTH} символов.`);
      return false;
    }
    if (!formState.disciplineId) {
      setFormError('Необходимо выбрать дисциплину.');
      return false;
    }
    if (formState.order < MIN_ORDER || formState.order > MAX_ORDER) {
      setFormError(`Порядок должен быть между ${MIN_ORDER} и ${MAX_ORDER}.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    const numericDisciplineId = parseInt(formState.disciplineId, 10);
    if (isNaN(numericDisciplineId)) {
      setFormError('Выбран некорректный ID дисциплины.');
      return;
    }

    const dataToSubmit: ModuleCreate | ModuleUpdate = {
      title: formState.title.trim(),
      description: formState.description.trim() || undefined,
      order: formState.order,
      discipline_id: numericDisciplineId,
    };
    
    await onSubmit(dataToSubmit);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6"
      aria-label={initialData ? `Редактировать модуль: ${initialData.title}` : 'Создать новый модуль'}
    >
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {initialData ? `Редактировать модуль: ${initialData.title}` : 'Создать новый модуль'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Заполните информацию о модуле. Все поля, отмеченные звездочкой (*), обязательны для заполнения.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="module-title" className="block text-sm font-medium text-gray-700">
            Название модуля <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="module-title"
              name="title"
              value={formState.title}
              onChange={handleInputChange}
              required
              maxLength={MAX_TITLE_LENGTH}
              aria-required="true"
              className={cn(
                'block w-full rounded-md shadow-sm',
                'focus:ring-primary focus:border-primary sm:text-sm',
                'border-gray-300'
              )}
              placeholder="Введите название модуля"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {formState.title.length}/{MAX_TITLE_LENGTH} символов
          </p>
        </div>

        <div>
          <label htmlFor="module-description" className="block text-sm font-medium text-gray-700">
            Описание
          </label>
          <div className="mt-1">
            <textarea
              id="module-description"
              name="description"
              value={formState.description}
              onChange={handleInputChange}
              rows={3}
              maxLength={MAX_DESCRIPTION_LENGTH}
              className={cn(
                'block w-full rounded-md shadow-sm',
                'focus:ring-primary focus:border-primary sm:text-sm',
                'border-gray-300'
              )}
              placeholder="Введите описание модуля"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {formState.description.length}/{MAX_DESCRIPTION_LENGTH} символов
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="module-order" className="block text-sm font-medium text-gray-700">
              Порядок отображения
            </label>
            <div className="mt-1">
              <input
                type="number"
                id="module-order"
                name="order"
                value={formState.order}
                onChange={handleInputChange}
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
              Число от {MIN_ORDER} до {MAX_ORDER}
            </p>
          </div>

          <div>
            <label htmlFor="module-discipline" className="block text-sm font-medium text-gray-700">
              Дисциплина <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <select
                id="module-discipline"
                name="disciplineId"
                value={formState.disciplineId}
                onChange={handleInputChange}
                required
                aria-required="true"
                className={cn(
                  'block w-full rounded-md shadow-sm',
                  'focus:ring-primary focus:border-primary sm:text-sm',
                  'border-gray-300'
                )}
              >
                <option value="" disabled>Выберите дисциплину</option>
                {disciplines.map(d => (
                  <option key={d.id} value={d.id.toString()}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {formError && (
          <div className="rounded-md bg-red-50 p-4" role="alert">
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
          {isSubmitting ? 'Сохранение...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default ModuleForm;