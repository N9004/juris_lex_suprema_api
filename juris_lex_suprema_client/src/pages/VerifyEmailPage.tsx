// src/pages/VerifyEmailPage.tsx
import React from 'react';
import EmailVerificationForm from '../components/features/Auth/EmailVerificationForm';

const VerifyEmailPage: React.FC = () => {
  return (
    <div>
      {/* Можно добавить общий заголовок страницы, если хотите */}
      {/* <h2>Подтверждение адреса электронной почты</h2> */}
      <EmailVerificationForm />
    </div>
  );
};

export default VerifyEmailPage;