import React from 'react';

const DynamicGradientBackground: React.FC = () => {
  return (
    <div
      className="absolute inset-0 -z-10 animate-gradient-animation"
      style={{
        backgroundImage: `linear-gradient(47deg, 
                     rgba(185, 28, 28, 0.20) 0%, 
                     #F4F8F4 30%, 
                     #F4F8F4 70%, 
                     rgba(3, 105, 161, 0.20) 100%)`,
        backgroundSize: '200% 200%',
        backgroundPosition: '0% 50%'
      }}
    />
  );
};

export default DynamicGradientBackground; 