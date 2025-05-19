// src/components/features/Auth/StyledRegisterForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';

const StyledRegisterForm: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await authService.register({
        email,
        password,
        full_name: fullName
      });
      
      // Перенаправляем на страницу подтверждения email
      navigate('/verify-email', { state: { email } });
    } catch (error: any) {
      console.error('Registration failed:', error);
      setError(error?.response?.data?.detail || 'Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Полное имя"
            autoComplete="name"
            className="w-full px-6 py-4 bg-brand-input-bg text-brand-text placeholder-brand-text/60 rounded-xl 
                     border-2 border-transparent focus:border-brand-input-border-focus focus:ring-0 outline-none 
                     transition-colors duration-200 font-carabine text-lg"
          />
        </div>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Адрес электронной почты"
            required
            autoComplete="email"
            className="w-full px-6 py-4 bg-brand-input-bg text-brand-text placeholder-brand-text/60 rounded-xl 
                     border-2 border-transparent focus:border-brand-input-border-focus focus:ring-0 outline-none 
                     transition-colors duration-200 font-carabine text-lg"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Придумайте пароль"
            required
            autoComplete="new-password"
            className="w-full px-6 py-4 bg-brand-input-bg text-brand-text placeholder-brand-text/60 rounded-xl 
                     border-2 border-transparent focus:border-brand-input-border-focus focus:ring-0 outline-none 
                     transition-colors duration-200 font-carabine text-lg"
          />
        </div>
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-5 py-4 bg-brand-button-dark text-brand-button-text-light rounded-[50px] 
                     font-carabine text-xl font-medium hover:opacity-90 active:opacity-80 
                     transition-opacity duration-150 shadow-lg"
          >
            {isLoading ? 'СОЗДАНИЕ...' : 'Зарегистрироваться'}
          </button>
        </div>
      </form>
      
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-carabine text-lg text-brand-text/80 hover:text-brand-text transition-colors"
        >
          Уже есть аккаунт? Войти
        </button>
      </div>
    </>
  );
};

export default StyledRegisterForm;