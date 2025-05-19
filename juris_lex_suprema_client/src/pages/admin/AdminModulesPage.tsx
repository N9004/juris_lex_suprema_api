import React, { useState, useEffect } from 'react';
import { disciplineService } from '../../services/disciplineService';
import { authService } from '../../services/authService';
import type { Module, ModuleCreate, ModuleUpdate, Discipline } from '../../types/entities';
import { useToast } from '../../contexts/ToastContext';
import ModuleForm from '../../components/features/Admin/ModuleForm';
import { cn } from '../../utils/cn';
import Button from '../../components/ui/Button';

const AdminModulesPage: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [isLoadingDisciplines, setIsLoadingDisciplines] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingModules(true);
        setIsLoadingDisciplines(true);

        await authService.getCurrentUser();

        const [modulesData, disciplinesData] = await Promise.all([
          disciplineService.getAllModulesAdmin(),
          disciplineService.getAllDisciplinesAdmin()
        ]);

        setModules(modulesData);
        setDisciplines(disciplinesData);
      } catch (err: any) {
        if (err.response?.status === 401) {
          window.location.href = '/login';
        } else {
          showToast(err.response?.data?.detail || 'Ошибка при загрузке данных', 'error');
        }
      } finally {
        setIsLoadingModules(false);
        setIsLoadingDisciplines(false);
      }
    };

    loadData();
  }, [showToast]);

  const handleShowCreateForm = () => {
    setEditingModule(null);
    setShowForm(true);
  };

  const handleShowEditForm = (module: Module) => {
    setEditingModule(module);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingModule(null);
  };

  const handleSubmitForm = async (data: ModuleCreate | ModuleUpdate) => {
    try {
      setIsSubmitting(true);

      if (editingModule) {
        const updatedModule = await disciplineService.updateModuleAdmin(editingModule.id, data as ModuleUpdate);
        setModules(prevModules => 
          prevModules.map(m => m.id === editingModule.id ? updatedModule : m)
        );
        showToast('Модуль успешно обновлен', 'success');
      } else {
        const newModule = await disciplineService.createModuleAdmin(data as ModuleCreate);
        setModules(prevModules => [...prevModules, newModule]);
        showToast('Модуль успешно создан', 'success');
      }

      setShowForm(false);
      setEditingModule(null);
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Ошибка при сохранении модуля', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот модуль? Все связанные уроки также будут удалены.')) {
      return;
    }

    try {
      await disciplineService.deleteModuleAdmin(moduleId);
      setModules(prevModules => prevModules.filter(m => m.id !== moduleId));
      showToast('Модуль успешно удален', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Ошибка при удалении модуля', 'error');
    }
  };

  const getDisciplineTitle = (disciplineId: number) => {
    const discipline = disciplines.find(d => d.id === disciplineId);
    return discipline ? discipline.title : 'Неизвестная дисциплина';
  };

  if (isLoadingModules || isLoadingDisciplines) {
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
          <h1 className="text-3xl font-bold text-gray-900">Управление Модулями</h1>
          <p className="mt-2 text-sm text-gray-600">
            Создавайте и редактируйте учебные модули
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={handleShowCreateForm}
            variant="primary"
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Добавить Модуль
          </Button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <ModuleForm
            initialData={editingModule}
            disciplines={disciplines}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
            submitButtonText={editingModule ? 'Сохранить изменения' : 'Создать модуль'}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {modules.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Нет модулей</h3>
              <p className="mt-1 text-sm text-gray-500">Начните с создания нового модуля.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дисциплина</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Порядок</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {modules.map(module => (
                    <tr key={module.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{module.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{module.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-md truncate">
                          {module.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getDisciplineTitle(module.discipline_id)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {module.order}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={() => handleShowEditForm(module)}
                          variant="text"
                          size="sm"
                          className="mr-4"
                        >
                          Редактировать
                        </Button>
                        <Button
                          onClick={() => handleDeleteModule(module.id)}
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
    </div>
  );
};

export default AdminModulesPage; 