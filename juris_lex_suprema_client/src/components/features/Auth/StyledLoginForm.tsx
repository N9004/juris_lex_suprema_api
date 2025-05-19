// src/components/features/Auth/StyledLoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FadeInUp } from '@/components/ui/RevealAnimations';

const StyledLoginForm: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/'); // После успешного входа перенаправляем на главную
    } catch (error) {
      console.error('Login failed:', error);
      setError('Неверный email или пароль');
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
            placeholder="Пароль"
            required
            autoComplete="current-password"
            className="w-full px-6 py-4 bg-brand-input-bg text-brand-text placeholder-brand-text/60 rounded-xl 
                      border-2 border-transparent focus:border-brand-input-border-focus focus:ring-0 outline-none 
                      transition-colors duration-200 font-carabine text-lg"
          />
        </div>
        <div className="text-left pt-1">
          <button 
            type="button" 
            className="text-brand-text/80 hover:text-brand-text font-carabine text-base transition-colors"
          >
            Забыли пароль?
          </button>
        </div>
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-5 py-4 bg-brand-button-dark text-brand-button-text-light rounded-[50px] 
                      font-carabine text-xl font-medium hover:opacity-90 active:opacity-80 
                      transition-opacity duration-150 shadow-lg"
          >
            {isLoading ? 'ВХОД...' : 'Войти'}
          </button>
        </div>
      </form>
      
      <div className="mt-8 text-center">
        <p className="font-carabine text-xl text-brand-text mb-2">
          Впервые у нас?
        </p>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-carabine text-xl text-brand-button-dark hover:opacity-80 transition-opacity font-medium"
        >
          Регистрация
        </button>
      </div>
    </>
  );
};

export default StyledLoginForm;