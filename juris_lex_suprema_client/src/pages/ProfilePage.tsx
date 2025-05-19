// src/pages/ProfilePage.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { cn } from '../utils/cn';

// Заглушка для компонента аватара (позже можно сделать его более сложным)
const AvatarPlaceholder: React.FC<{ size?: number }> = ({ size = 100 }) => (
  <div 
    className={cn(
      'flex items-center justify-center',
      'bg-gradient-to-br from-primary/20 to-primary/40',
      'text-primary font-semibold',
      'border-2 border-primary/30',
      'transition-transform hover:scale-105'
    )}
    style={{ 
      width: size, 
      height: size, 
      borderRadius: '50%',
      fontSize: size / 3,
    }}
  >
    Ава
  </div>
);

const StatCard: React.FC<{ title: string; value: string | number; icon: string }> = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center space-x-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

// Заглушка для отображения ачивок
const AchievementsPlaceholder: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Мои Достижения</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <span className="text-2xl">🏆</span>
        <div>
          <p className="font-medium">Первый урок ТГП</p>
          <p className="text-sm text-gray-500">Начало пути в юриспруденции</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <span className="text-2xl">🥇</span>
        <div>
          <p className="font-medium">5 дней подряд</p>
          <p className="text-sm text-gray-500">Регулярное обучение</p>
        </div>
      </div>
    </div>
  </div>
);

// Заглушка для списка друзей
const FriendsPlaceholder: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Мои Друзья-Юристы</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-medium">К1</span>
        </div>
        <div>
          <p className="font-medium">Коллега №1</p>
          <p className="text-sm text-gray-500">Уровень 3</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-medium">БП</span>
        </div>
        <div>
          <p className="font-medium">Будущий Прокурор</p>
          <p className="text-sm text-gray-500">Уровень 5</p>
        </div>
      </div>
    </div>
  </div>
);

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Состояние для редактируемого описания
  // Предположим, что 'user.bio' будет полем на бэкенде
  const [bio, setBio] = useState(user?.bio || ''); // user.bio - это то, что придет с бэка
  const [isEditingBio, setIsEditingBio] = useState(false);

  // TODO: В будущем, при получении user с бэкенда, он должен содержать поля:
  // user.xp_points, user.study_streak_days, user.level, user.avatar_url, user.bio

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Ошибка: данные пользователя не найдены.</p>
      </div>
    );
  }

  const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(event.target.value);
  };

  const handleBioSave = async () => {
    // TODO: Реализовать отправку bio на бэкенд для сохранения
    // await userService.updateProfile({ bio }); // Примерный вызов сервиса
    console.log("Сохранение описания:", bio);
    setIsEditingBio(false);
  };
  
  // Заглушки для данных, которых пока нет в модели User
  const xpPoints = user.xp_points || 0; // Предполагаем, что такое поле появится
  const studyStreakDays = user.study_streak_days || 0; // "Дни в праве"
  const studyLevel = user.level || 1; // Уровень изучения

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <AvatarPlaceholder size={120} />
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{user.full_name || user.email}</h1>
              <p className="text-gray-600">Уровень {studyLevel} | {xpPoints} XP</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Уровень" value={studyLevel} icon="📚" />
            <StatCard title="Опыт" value={`${xpPoints} XP`} icon="⭐" />
            <StatCard title="Дней подряд" value={`${studyStreakDays} дней`} icon="🔥" />
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">О себе</h3>
              {!isEditingBio && (
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Редактировать
                </button>
              )}
            </div>
            {isEditingBio ? (
              <div className="space-y-4">
                <textarea 
                  value={bio} 
                  onChange={handleBioChange} 
                  rows={4} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Расскажите немного о себе, ваших интересах в праве..."
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleBioSave}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => { setIsEditingBio(false); setBio(user?.bio || ''); }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">{bio || 'Описание пока не добавлено.'}</p>
            )}
          </div>

          {/* Achievements Section */}
          <AchievementsPlaceholder />

          {/* Friends Section */}
          <FriendsPlaceholder />

          {/* Additional Info Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация об аккаунте</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-gray-500">
                  {user.is_email_verified ? '✓ Подтвержден' : '✗ Не подтвержден'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Дата регистрации</p>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;