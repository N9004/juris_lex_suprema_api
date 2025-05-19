// src/pages/AuthPage.tsx
import React, { useState } from 'react';
import DynamicGradientBackground from '@/components/ui/DynamicGradientBackground';
import AnimatedBranding from '@/components/ui/AnimatedBranding';
import StyledLoginForm from '@/components/features/Auth/StyledLoginForm';
import StyledRegisterForm from '@/components/features/Auth/StyledRegisterForm';
import { FadeInUp } from '@/components/ui/RevealAnimations';

const AuthPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Градиентный фон */}
      <DynamicGradientBackground />

      {/* Контент-контейнер */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen w-full max-w-[1800px] mx-auto">
        
        {/* Левая колонка (Брендинг) */}
        <div className="w-full lg:w-1/2 min-h-[30vh] lg:min-h-screen flex items-center justify-start p-8 lg:p-16">
          <div className="max-w-xl">
            <FadeInUp duration={800}>
              <h1 className="font-widock text-6xl sm:text-7xl md:text-8xl lg:text-[110px] xl:text-[130px] 
                           text-brand-text tracking-[10px] md:tracking-[14px] leading-none">
                LEXICO
              </h1>
              
              <p className="mt-8 text-xl sm:text-2xl md:text-3xl font-carabine text-brand-text/90 leading-tight">
                ОБРАЗОВАТЕЛЬНАЯ ПЛАТФОРМА
                <br />
                ДЛЯ НАЧИНАЮЩИХ ЮРИСТОВ
              </p>
            </FadeInUp>
          </div>
        </div>
        
        {/* Правая колонка (Формы) */}
        <div className="w-full lg:w-1/2 min-h-[70vh] lg:min-h-screen flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md lg:max-w-lg">
            <FadeInUp delay={200} duration={800}>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-10 shadow-xl">
                <h2 className="text-3xl md:text-4xl font-carabine text-brand-text mb-8">
                  {showLogin ? 'АВТОРИЗАЦИЯ' : 'РЕГИСТРАЦИЯ'}
                </h2>
                
                {showLogin ? (
                  <StyledLoginForm onSwitchToRegister={() => setShowLogin(false)} />
                ) : (
                  <StyledRegisterForm onSwitchToLogin={() => setShowLogin(true)} />
                )}
              </div>
            </FadeInUp>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;