// src/components/ui/StaticGradientBackground.tsx
import React from 'react';

const StaticGradientBackground: React.FC = () => {
  return (
    <div
      className="absolute inset-0 -z-10"
      style={{
        background: `linear-gradient(47deg, 
                     var(--gradient-color-red-edge) 0%, 
                     var(--gradient-color-ivory-center) 35%, 
                     var(--gradient-color-ivory-center) 65%, 
                     var(--gradient-color-blue-edge) 100%)`,
        // backgroundSize и animation здесь не нужны для статического градиента
      }}
    />
  );
};

export default StaticGradientBackground;