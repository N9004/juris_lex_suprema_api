import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

export const Navigation = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">Lexico</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <Link
                to="/profile"
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium',
                  'text-gray-700 hover:text-primary hover:bg-gray-50'
                )}
              >
                Профиль
              </Link>
            )}
            {user?.is_superuser && (
              <Link
                to="/admin"
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium',
                  'text-gray-700 hover:text-primary hover:bg-gray-50'
                )}
              >
                Панель администратора
              </Link>
            )}
            <button
              onClick={logout}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium',
                'text-gray-700 hover:text-primary hover:bg-gray-50'
              )}
            >
              Выйти
            </button>
            <button
              onClick={toggleTheme}
              className={cn(
                'p-2 rounded-md',
                'text-gray-700 hover:text-primary hover:bg-gray-50'
              )}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}; 