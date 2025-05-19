// src/pages/admin/AdminDashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { adminStatisticsService, AdminStatistics } from '../../services/adminStatisticsService';
import { useToast } from '../../contexts/ToastContext';

interface AdminCardProps {
  title: string;
  description: string;
  icon: string;
  to: string;
  color: string;
}

const AdminCard: React.FC<AdminCardProps> = ({ title, description, icon, to, color }) => (
  <Link 
    to={to}
    className={cn(
      'block p-6 rounded-lg border transition-all duration-200',
      'hover:shadow-lg hover:scale-[1.02]',
      'bg-white border-gray-100',
      'group'
    )}
  >
    <div className="flex items-start space-x-4">
      <div className={cn(
        'p-3 rounded-lg',
        'text-2xl',
        color
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>
    </div>
  </Link>
);

const AdminDashboardPage: React.FC = () => {
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await adminStatisticsService.getStatistics();
        setStatistics(data);
      } catch (error) {
        showToast('Ошибка при загрузке статистики', 'error');
        console.error('Error loading statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [showToast]);

  const adminSections = [
    {
      title: 'Управление Дисциплинами',
      description: 'Создавайте и редактируйте учебные дисциплины, настраивайте их структуру и содержание',
      icon: '📚',
      to: '/admin/disciplines',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Управление Модулями',
      description: 'Организуйте учебный материал по модулям, настраивайте порядок и связи между ними',
      icon: '📑',
      to: '/admin/modules',
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Управление Уроками',
      description: 'Создавайте и редактируйте уроки, добавляйте теоретический материал и практические задания',
      icon: '📝',
      to: '/admin/lessons',
      color: 'bg-blue-50 text-blue-700'
    },
    {
      title: 'Управление Пользователями',
      description: 'Управляйте пользователями, их правами и доступом к платформе',
      icon: '👥',
      to: '/admin/users',
      color: 'bg-orange-50 text-orange-600'
    },
    {
      title: 'Статистика и Аналитика',
      description: 'Отслеживайте прогресс пользователей, анализируйте эффективность обучения',
      icon: '📊',
      to: '/admin/statistics',
      color: 'bg-red-50 text-red-600'
    },
    {
      title: 'Настройки Платформы',
      description: 'Настройте общие параметры платформы, внешний вид и функциональность',
      icon: '⚙️',
      to: '/admin/settings',
      color: 'bg-gray-50 text-gray-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Панель администратора
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Управление контентом и настройками платформы
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Активных пользователей</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? (
                  <span className="animate-pulse bg-gray-200 h-8 w-24 rounded block"></span>
                ) : (
                  statistics?.active_users.toLocaleString() || '0'
                )}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl text-blue-600">👥</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Всего уроков</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? (
                  <span className="animate-pulse bg-gray-200 h-8 w-24 rounded block"></span>
                ) : (
                  statistics?.total_lessons.toLocaleString() || '0'
                )}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <span className="text-2xl text-green-600">📚</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Завершенных уроков</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? (
                  <span className="animate-pulse bg-gray-200 h-8 w-24 rounded block"></span>
                ) : (
                  `${statistics?.completed_lessons_percentage || 0}%`
                )}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl text-blue-600">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <AdminCard
            key={section.to}
            title={section.title}
            description={section.description}
            icon={section.icon}
            to={section.to}
            color={section.color}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Последние действия
        </h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <span className="text-blue-600">📝</span>
              </div>
              <div>
                <p className="font-medium">Создан новый урок</p>
                <p className="text-sm text-gray-500">Теория государства и права - Основные понятия</p>
              </div>
              <div className="ml-auto text-sm text-gray-500">
                2 часа назад
              </div>
            </div>
          </div>
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <span className="text-green-600">👤</span>
              </div>
              <div>
                <p className="font-medium">Новый пользователь</p>
                <p className="text-sm text-gray-500">Иван Петров зарегистрировался</p>
              </div>
              <div className="ml-auto text-sm text-gray-500">
                5 часов назад
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <span className="text-blue-600">📊</span>
              </div>
              <div>
                <p className="font-medium">Обновлена статистика</p>
                <p className="text-sm text-gray-500">Добавлены новые метрики успеваемости</p>
              </div>
              <div className="ml-auto text-sm text-gray-500">
                1 день назад
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;