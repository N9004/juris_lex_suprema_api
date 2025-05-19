// src/pages/admin/AdminDisciplinesPage.tsx
import React, { useState, useEffect } from 'react';
import { disciplineService } from '../../services/disciplineService';
import DisciplineForm from '../../components/features/Admin/DisciplineForm';
import type { Discipline, DisciplineCreate, DisciplineUpdate } from '../../types/entities';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../utils/cn';
import { Fade, Slide } from 'react-awesome-reveal';
import Card from '@/components/ui/Card';

const AdminDisciplinesPage: React.FC = () => {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await disciplineService.getAllDisciplines();
        setDisciplines(data);
      } catch (err: any) {
        showToast(err.response?.data?.detail || 'Ошибка при загрузке данных', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [showToast]);

  const handleShowCreateForm = () => {
    setEditingDiscipline(null);
    setShowForm(true);
  };

  const handleShowEditForm = (discipline: Discipline) => {
    setEditingDiscipline(discipline);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingDiscipline(null);
  };

  const handleSubmitForm = async (data: DisciplineCreate | DisciplineUpdate) => {
    try {
      setIsSubmitting(true);

      if (editingDiscipline) {
        const updatedDiscipline = await disciplineService.updateDisciplineAdmin(
          editingDiscipline.id, 
          data as DisciplineUpdate
        );
        setDisciplines(prevDisciplines => 
          prevDisciplines.map(d => d.id === editingDiscipline.id ? updatedDiscipline : d)
        );
        showToast('Дисциплина успешно обновлена', 'success');
      } else {
        const createData = {
          ...data,
          description: data.description || ''
        };
        const newDiscipline = await disciplineService.createDisciplineAdmin(createData as DisciplineCreate);
        setDisciplines(prevDisciplines => [...prevDisciplines, newDiscipline]);
        showToast('Дисциплина успешно создана', 'success');
      }

      setShowForm(false);
      setEditingDiscipline(null);
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Ошибка при сохранении дисциплины', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDiscipline = async (disciplineId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту дисциплину? Все связанные модули и уроки также будут удалены.')) {
      return;
    }

    try {
      await disciplineService.deleteDisciplineAdmin(disciplineId);
      setDisciplines(prevDisciplines => prevDisciplines.filter(d => d.id !== disciplineId));
      showToast('Дисциплина успешно удалена', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Ошибка при удалении дисциплины', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-button-dark mb-4"></div>
          <p className="font-carabine text-xl">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <Fade cascade triggerOnce>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-carabine text-brand-text">Управление Дисциплинами</h1>
            <p className="mt-2 text-sm font-liter text-gray-600">
              Создавайте и редактируйте учебные дисциплины
            </p>
          </div>
          {!showForm && (
            <button
              onClick={handleShowCreateForm}
              className={cn(
                'inline-flex items-center px-4 py-2 border border-transparent',
                'rounded-xl shadow-sm text-sm font-carabine text-white',
                'bg-brand-button-dark hover:opacity-90 focus:outline-none',
                'transition-all duration-200'
              )}
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить Дисциплину
            </button>
          )}
        </div>

        {showForm ? (
          <Slide direction="down" triggerOnce>
            <Card gradient bordered className="p-6">
              <DisciplineForm
                initialData={editingDiscipline}
                onSubmit={handleSubmitForm}
                onCancel={handleCancelForm}
                isSubmitting={isSubmitting}
                submitButtonText={editingDiscipline ? 'Сохранить изменения' : 'Создать дисциплину'}
              />
            </Card>
          </Slide>
        ) : (
          <Card gradient bordered className="overflow-hidden">
            {disciplines.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Нет дисциплин</h3>
                <p className="mt-1 text-sm text-gray-500">Начните с создания новой дисциплины.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200/50">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-carabine text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-carabine text-gray-500 uppercase tracking-wider">Название</th>
                      <th className="px-6 py-3 text-left text-xs font-carabine text-gray-500 uppercase tracking-wider">Описание</th>
                      <th className="px-6 py-3 text-left text-xs font-carabine text-gray-500 uppercase tracking-wider">Модули</th>
                      <th className="px-6 py-3 text-right text-xs font-carabine text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-gray-200/50">
                    {disciplines.map((discipline, index) => (
                      <Fade key={discipline.id} delay={index * 50} triggerOnce>
                        <tr className="hover:bg-gray-50/70 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{discipline.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-carabine text-gray-900">{discipline.title}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-liter text-gray-600 max-w-md truncate">
                              {discipline.description || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {discipline.modules?.length || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleShowEditForm(discipline)}
                              className="text-brand-button-dark hover:opacity-80 mr-4 transition-colors duration-150 font-carabine"
                            >
                              Редактировать
                            </button>
                            <button
                              onClick={() => handleDeleteDiscipline(discipline.id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-150 font-carabine"
                            >
                              Удалить
                            </button>
                          </td>
                        </tr>
                      </Fade>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </Fade>
  );
};

export default AdminDisciplinesPage;