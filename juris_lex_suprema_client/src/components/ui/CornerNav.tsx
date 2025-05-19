import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const CornerNav: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Проверяем, находимся ли мы на странице авторизации
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/register';
  
  const isSuperUser = user?.is_superuser;
  
  const handleLogout = () => {
    try {
      logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Если мы на странице авторизации и не аутентифицированы, скрываем навигацию
  if (isAuthPage && !isAuthenticated) return null;
  
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md px-5 py-4 shadow-lg flex flex-col space-y-3 rounded-xl transition-all duration-300 hover:bg-white/70">
        <Link
          to="/"
          className="font-carabine text-base text-brand-text/90 hover:text-brand-button-dark hover:translate-x-1 transition-all duration-200"
        >
          Главная
        </Link>
      
        <Link
          to="/disciplines"
          className="font-carabine text-base text-brand-text/90 hover:text-brand-button-dark hover:translate-x-1 transition-all duration-200"
        >
          Дисциплины
        </Link>
        
        {isAuthenticated && (
          <Link
            to="/profile"
            className="font-carabine text-base text-brand-text/90 hover:text-brand-button-dark hover:translate-x-1 transition-all duration-200"
          >
            Профиль
          </Link>
        )}
        
        {isSuperUser && (
          <Link
            to="/admin"
            className="font-carabine text-base text-indigo-600/90 hover:text-indigo-800 hover:translate-x-1 transition-all duration-200"
          >
            Админ-панель
          </Link>
        )}
        
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="font-carabine text-base text-red-600/90 hover:text-red-800 hover:translate-x-1 transition-all duration-200 text-left"
          >
            Выход
          </button>
        ) : (
          <Link
            to="/auth"
            className="font-carabine text-base text-green-600/90 hover:text-green-800 hover:translate-x-1 transition-all duration-200"
          >
            Вход
          </Link>
        )}
      </div>
    </div>
  );
};

export default CornerNav; 