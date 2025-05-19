// src/pages/LoginPage.tsx
import React from 'react';
import LoginForm from '../components/features/Auth/StyledLoginForm'; // Уточните путь
import { Link } from 'react-router-dom'; // Для ссылки на регистрацию

const LoginPage: React.FC = () => {
  return (
    <div>
      <h2>Страница входа</h2>
      <LoginForm />
      <p>
        Еще нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
      </p>
    </div>
  );
};

export default LoginPage;