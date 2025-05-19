// src/App.tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes'; // Исправлено на AppRoutes
import './App.css'; // Main app styles
import AppGradientLayout from './components/ui/AppGradientLayout';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppGradientLayout>
              <AppRoutes />
            </AppGradientLayout>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;