import React from 'react';
import { FadeInUp } from './RevealAnimations';

const AnimatedBranding: React.FC = () => {
  return (
    <div className="select-none w-full">
      <FadeInUp duration={1000}>
        <h1 className="text-left w-full overflow-hidden">
          <span 
            className="font-widock text-6xl sm:text-7xl md:text-8xl lg:text-[110px] xl:text-[130px] 
                      text-brand-text tracking-[10px] md:tracking-[14px] block"
          >
            LEXICO
          </span>
        </h1>
      </FadeInUp>
      
      <FadeInUp delay={200} duration={800}>
        <p className="mt-4 md:mt-5 text-xl sm:text-2xl md:text-3xl font-carabine text-brand-text/90 leading-tight text-left">
          ОБРАЗОВАТЕЛЬНАЯ ПЛАТФОРМА
          <br />
          ДЛЯ НАЧИНАЮЩИХ ЮРИСТОВ
        </p>
      </FadeInUp>
    </div>
  );
};

export default AnimatedBranding; 