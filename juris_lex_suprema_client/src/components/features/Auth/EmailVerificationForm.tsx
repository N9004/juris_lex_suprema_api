// src/components/features/Auth/EmailVerificationForm.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/authService'; 

const EmailVerificationForm: React.FC = () => {
  const [searchParams] = useSearchParams(); 
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    } else {
      setError('Email не указан в URL. Пожалуйста, вернитесь и попробуйте снова.'); 
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !code) {
      setError('Пожалуйста, введите код верификации.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await authService.verifyEmail({ email, code });
      setSuccessMessage(response.message || 'Email успешно подтвержден! Теперь вы можете войти.');
      setTimeout(() => {
        navigate('/login');
      }, 3000); 
    } catch (err: any) {
      console.error('Email verification error in component:', err);
      setError(err.response?.data?.detail || err.message || 'Ошибка верификации email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email && !error) {
    return <p>Загрузка информации...</p>;
  }

  // Если есть ошибка, но email не был установлен (например, ошибка из useEffect)
  if (error && !email) { 
      return <p style={{ color: 'red' }}>{error}</p>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <h3>Подтверждение Email</h3>
      {email && <p>Код подтверждения был "отправлен" на ваш email: <strong>{email}</strong> (На этапе разработки проверьте консоль бэкенда).</p>}
      
      <div>
        <label htmlFor="verification-code">Код подтверждения:</label>
        <input
          type="text"
          id="verification-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength={6} 
          autoComplete="one-time-code" // Для помощи браузерам с кодами из SMS/Email
        />
      </div>

      {error && !successMessage && <p style={{ color: 'red' }}>{error}</p>} {/* Показываем ошибку, только если нет сообщения об успехе */}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      <button type="submit" disabled={isSubmitting || !email || !!successMessage}> {/* Блокируем кнопку после успеха */}
        {isSubmitting ? 'Проверка...' : 'Подтвердить Email'}
      </button>
    </form>
  );
};

export default EmailVerificationForm;