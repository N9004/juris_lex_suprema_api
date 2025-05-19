import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import type { User } from './types/entities';
import ProtectedRoute from './components/common/ProtectedRoute';

// Основные страницы
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthPage from './pages/AuthPage';

// Учебные страницы
import { DisciplinesListPage } from './pages/Learning/DisciplinesListPage';
import { DisciplinePage } from './pages/Learning/DisciplinePage';
import { ModulePage } from './pages/Learning/ModulePage';
import { LessonPage } from './pages/Learning/LessonPage';

// Админ-страницы
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminDisciplinesPage from './pages/admin/AdminDisciplinesPage';
import AdminModulesPage from './pages/admin/AdminModulesPage';
import AdminLessonsPage from './pages/admin/AdminLessonsPage';
import LessonStructureEditorPage from './pages/admin/LessonStructureEditorPage';

export const AppRoutes = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Загрузка аутентификации...</div>;
  }

  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Защищенные маршруты */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Маршруты учебных страниц */}
      <Route
        path="/disciplines"
        element={
          <ProtectedRoute>
            <DisciplinesListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/disciplines/:disciplineId"
        element={
          <ProtectedRoute>
            <DisciplinePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modules/:moduleId"
        element={
          <ProtectedRoute>
            <ModulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lessons/:lessonId"
        element={
          <ProtectedRoute>
            <LessonPage />
          </ProtectedRoute>
        }
      />

      {/* Маршруты админ-панели */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminDashboardPage />} />
                <Route path="/disciplines" element={<AdminDisciplinesPage />} />
                <Route path="/modules" element={<AdminModulesPage />} />
                <Route path="/lessons" element={<AdminLessonsPage />} />
                <Route path="/lesson-structure/:lessonId" element={<LessonStructureEditorPage />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 страница */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}; 