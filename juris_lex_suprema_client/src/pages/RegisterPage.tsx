// src/pages/RegisterPage.tsx
import React from 'react';
import RegisterForm from '../components/features/Auth/StyledRegisterForm'; // Уточните путь

const RegisterPage: React.FC = () => {
  return (
    <div>
      <h2>Регистрация</h2>
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;