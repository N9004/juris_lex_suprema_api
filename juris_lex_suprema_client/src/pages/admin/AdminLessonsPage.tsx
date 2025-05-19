import React, { useState, useEffect } from 'react';
import type { Lesson, Module, Discipline, LessonCreate, LessonUpdate } from '../../types/entities';
import { adminLessonService } from '../../services/adminLessonService';
import { disciplineService } from '../../services/disciplineService';
import LessonForm from '../../components/features/Admin/LessonForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../utils/cn';
import Button from '../../components/ui/Button';

const AdminLessonsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  // Состояния
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [isLoadingDisciplines, setIsLoadingDisciplines] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [filterModuleId, setFilterModuleId] = useState<string | null>(null);

  // Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated || !user?.is_superuser) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !user?.is_superuser) return;

      try {
        setIsLoadingLessons(true);
        setIsLoadingModules(true);
        setIsLoadingDisciplines(true);
        setError(null);

        // Загружаем модули и дисциплины параллельно
        const [modulesData, disciplinesData] = await Promise.all([
          disciplineService.getAllModulesAdmin(),
          disciplineService.getAllDisciplines()
        ]);

        setModules(modulesData);
        setDisciplines(disciplinesData);

        // Загружаем уроки только если выбран модуль
        if (filterModuleId) {
          const lessonsData = await adminLessonService.getAllLessons(parseInt(filterModuleId));
          setLessons(lessonsData);
        } else {
          setLessons([]); // Очищаем список уроков, если модуль не выбран
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных');
        showToast(err instanceof Error ? err.message : 'Ошибка при загрузке данных', 'error');
        if (err instanceof Error && err.message.includes('401')) {
          navigate('/login');
        }
      } finally {
        setIsLoadingLessons(false);
        setIsLoadingModules(false);
        setIsLoadingDisciplines(false);
      }
    };

    loadData();
  }, [filterModuleId, isAuthenticated, user, navigate, showToast]);

  // Вспомогательные функции для поиска по ID
  const getModuleById = (moduleId: number): Module | undefined => {
    return modules.find(m => m.id === moduleId);
  };

  const getDisciplineById = (disciplineId: number): Discipline | undefined => {
    return disciplines.find(d => d.id === disciplineId);
  };

  // Обработчики форм
  const handleShowCreateForm = () => {
    setEditingLesson(null);
    setShowForm(true);
  };

  const handleShowEditForm = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingLesson(null);
  };

  const handleSubmitForm = async (data: LessonCreate | LessonUpdate) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (editingLesson) {
        // Обновление
        const updatedLesson = await adminLessonService.updateLesson(editingLesson.id, data as LessonUpdate);
        setLessons(prev => prev.map(l => l.id === updatedLesson.id ? updatedLesson : l));
        showToast('Урок успешно обновлен', 'success');
      } else {
        // Создание
        const newLesson = await adminLessonService.createLesson(data as LessonCreate);
        setLessons(prev => [...prev, newLesson]);
        showToast('Урок успешно создан', 'success');
      }

      setShowForm(false);
      setEditingLesson(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении урока');
      showToast(err instanceof Error ? err.message : 'Ошибка при сохранении урока', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот урок? Все связанные материалы также будут удалены.')) return;

    try {
      setError(null);
      await adminLessonService.deleteLesson(lessonId);
      setLessons(prev => prev.filter(l => l.id !== lessonId));
      showToast('Урок успешно удален', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении урока');
      showToast(err instanceof Error ? err.message : 'Ошибка при удалении урока', 'error');
    }
  };

  const handleEditStructure = (lessonId: number) => {
    navigate(`/admin/lesson-structure/${lessonId}`);
  };

  // Рендеринг
  if (isLoadingLessons || isLoadingModules || isLoadingDisciplines) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление Уроками</h1>
          <p className="mt-2 text-sm text-gray-600">
            Создавайте и редактируйте учебные уроки
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="max-w-md">
          <label htmlFor="module-filter" className="block text-sm font-medium text-gray-700">
            Выберите модуль для просмотра уроков
          </label>
          <div className="mt-1">
            <select
              id="module-filter"
              value={filterModuleId || ''}
              onChange={(e) => setFilterModuleId(e.target.value || null)}
              className={cn(
                'block w-full rounded-md shadow-sm',
                'focus:ring-primary focus:border-primary sm:text-sm',
                'border-gray-300'
              )}
            >
              <option value="">Выберите модуль...</option>
              {modules.map(module => (
                <option key={module.id} value={module.id}>
                  {module.title} ({getDisciplineById(module.discipline_id)?.title || 'Неизвестная дисциплина'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <LessonForm
            initialData={editingLesson}
            modules={modules}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
            submitButtonText={editingLesson ? 'Сохранить изменения' : 'Создать урок'}
          />
        </div>
      ) : (
        <>
          {filterModuleId && (
            <div className="mb-6">
              <Button
                onClick={handleShowCreateForm}
                variant="primary"
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Добавить Урок
              </Button>
            </div>
          )}

          {filterModuleId && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {lessons.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Нет уроков</h3>
                  <p className="mt-1 text-sm text-gray-500">Начните с создания нового урока.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Модуль</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Порядок</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lessons.map(lesson => (
                        <tr key={lesson.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lesson.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getModuleById(lesson.module_id)?.title || 'Неизвестный модуль'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {lesson.order}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              onClick={() => handleEditStructure(lesson.id)}
                              variant="text"
                              size="sm"
                              className="mr-4"
                            >
                              Структура
                            </Button>
                            <Button
                              onClick={() => handleShowEditForm(lesson)}
                              variant="text"
                              size="sm"
                              className="mr-4"
                            >
                              Редактировать
                            </Button>
                            <Button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              variant="text"
                              size="sm"
                              className="text-red-600 hover:text-red-900"
                            >
                              Удалить
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminLessonsPage; 