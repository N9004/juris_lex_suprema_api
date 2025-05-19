import React, { ReactNode } from 'react';
import CornerNav from './CornerNav';
import DynamicGradientBackground from './DynamicGradientBackground';

interface AppGradientLayoutProps {
  children: ReactNode;
}

const AppGradientLayout: React.FC<AppGradientLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen">
      {/* Градиентный фон */}
      <DynamicGradientBackground />

      {/* Контент приложения */}
      <div className="relative z-10 min-h-screen pb-16">
        {children}
      </div>
      
      {/* Навигация в правом нижнем углу */}
      <CornerNav />
    </div>
  );
};

export default AppGradientLayout; 