// src/components/layout/AdminLayout.tsx
import React, { ReactNode } from 'react';
import { Link, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Fade } from 'react-awesome-reveal';

// Добавляем пропсы с children
interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-ivory-bg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-button-dark mb-4"></div>
          <p className="font-carabine text-xl">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.is_superuser) {
    console.warn("AdminLayout: Access denied. User not authenticated or not a superuser.");
    return <Navigate to="/" replace />; 
  }

  return (
    <div className="min-h-screen bg-brand-ivory-bg">
      <Fade>
        <header className="bg-white/80 backdrop-blur-md shadow-md border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h2 className="text-2xl font-carabine text-brand-text">Административная панель</h2>
              
              <nav className="flex items-center space-x-1">
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) => 
                    `px-3 py-2 rounded-lg transition-colors font-carabine ${
                      isActive 
                        ? 'bg-brand-button-dark text-white' 
                        : 'text-brand-text hover:bg-gray-100'
                    }`
                  }
                >
                  Главная
                </NavLink>
                
                <NavLink
                  to="/admin/disciplines"
                  className={({ isActive }) => 
                    `px-3 py-2 rounded-lg transition-colors font-carabine ${
                      isActive 
                        ? 'bg-brand-button-dark text-white' 
                        : 'text-brand-text hover:bg-gray-100'
                    }`
                  }
                >
                  Дисциплины
                </NavLink>
                
                <NavLink
                  to="/admin/modules"
                  className={({ isActive }) => 
                    `px-3 py-2 rounded-lg transition-colors font-carabine ${
                      isActive 
                        ? 'bg-brand-button-dark text-white' 
                        : 'text-brand-text hover:bg-gray-100'
                    }`
                  }
                >
                  Модули
                </NavLink>
                
                <NavLink
                  to="/admin/lessons"
                  className={({ isActive }) => 
                    `px-3 py-2 rounded-lg transition-colors font-carabine ${
                      isActive 
                        ? 'bg-brand-button-dark text-white' 
                        : 'text-brand-text hover:bg-gray-100'
                    }`
                  }
                >
                  Уроки
                </NavLink>
                
                <Link
                  to="/"
                  className="ml-4 px-3 py-2 rounded-lg bg-brand-button-dark text-white transition-colors font-carabine hover:opacity-90"
                >
                  На сайт
                </Link>
              </nav>
            </div>
          </div>
        </header>
      </Fade>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-white/70 backdrop-blur-sm border-t border-gray-200/50 py-6 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-carabine text-brand-text/80">
            Juris Lex Suprema &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;