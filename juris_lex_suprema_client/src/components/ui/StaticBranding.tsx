// src/components/ui/StaticBranding.tsx
import React from 'react';

const StaticBranding: React.FC = () => {
  return (
    <div className="select-none">
      <h1
        className="font-widock text-7xl sm:text-8xl md:text-9xl lg:text-[130px] xl:text-[150px] 
                   text-brand-text tracking-[10px] md:tracking-[14px]"
      >
        LEXICO
      </h1>
      <p className="mt-4 md:mt-5 text-xl sm:text-2xl md:text-3xl font-carabine text-brand-text/90 leading-tight">
        ОБРАЗОВАТЕЛЬНАЯ ПЛАТФОРМА
        <br />
        ДЛЯ НАЧИНАЮЩИХ ЮРИСТОВ
      </p>
    </div>
  );
};

export default StaticBranding;