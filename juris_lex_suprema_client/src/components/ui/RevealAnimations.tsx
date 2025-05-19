import React, { ReactNode, CSSProperties } from 'react';
import { Fade, Slide, Zoom, Flip, Bounce, Reveal, RevealProps } from 'react-awesome-reveal';
import { keyframes } from '@emotion/react';

// Кастомные анимации
const customFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 30px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const customSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translate3d(-100px, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

// Базовые свойства общие для всех анимаций
type BaseAnimationProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  cascade?: boolean;
  damping?: number;
  className?: string;
  triggerOnce?: boolean;
  style?: CSSProperties;
};

// Компоненты анимаций с заданными параметрами
export const FadeInUp: React.FC<BaseAnimationProps> = ({ 
  children, 
  delay = 0, 
  duration = 1000, 
  cascade = false,
  damping = 0.5,
  className = '',
  triggerOnce = true,
  ...props 
}) => (
  <Fade
    delay={delay}
    duration={duration}
    cascade={cascade}
    damping={damping}
    className={className}
    triggerOnce={triggerOnce}
    {...props}
  >
    {children}
  </Fade>
);

export const SlideInLeft: React.FC<BaseAnimationProps> = ({ 
  children, 
  delay = 0, 
  duration = 1000,
  cascade = false,
  damping = 0.5,
  className = '',
  triggerOnce = true,
  ...props 
}) => (
  <Slide
    direction="left"
    delay={delay}
    duration={duration}
    cascade={cascade}
    damping={damping}
    className={className}
    triggerOnce={triggerOnce}
    {...props}
  >
    {children}
  </Slide>
);

export const SlideInRight: React.FC<BaseAnimationProps> = ({ 
  children, 
  delay = 0, 
  duration = 1000,
  cascade = false,
  damping = 0.5,
  className = '',
  triggerOnce = true,
  ...props 
}) => (
  <Slide
    direction="right"
    delay={delay}
    duration={duration}
    cascade={cascade}
    damping={damping}
    className={className}
    triggerOnce={triggerOnce}
    {...props}
  >
    {children}
  </Slide>
);

export const SlideInUp: React.FC<BaseAnimationProps> = ({ 
  children, 
  delay = 0, 
  duration = 1000,
  cascade = false,
  damping = 0.5,
  className = '',
  triggerOnce = true,
  ...props 
}) => (
  <Slide
    direction="up"
    delay={delay}
    duration={duration}
    cascade={cascade}
    damping={damping}
    className={className}
    triggerOnce={triggerOnce}
    {...props}
  >
    {children}
  </Slide>
);

export const ZoomIn: React.FC<BaseAnimationProps> = ({ 
  children, 
  delay = 0, 
  duration = 1000,
  cascade = false,
  damping = 0.5,
  className = '',
  triggerOnce = true,
  ...props 
}) => (
  <Zoom
    delay={delay}
    duration={duration}
    cascade={cascade}
    damping={damping}
    className={className}
    triggerOnce={triggerOnce}
    {...props}
  >
    {children}
  </Zoom>
);

export const FlipAnimation: React.FC<BaseAnimationProps> = ({ 
  children, 
  delay = 0, 
  duration = 1000,
  cascade = false,
  damping = 0.5,
  className = '',
  triggerOnce = true,
  ...props 
}) => (
  <Flip
    delay={delay}
    duration={duration}
    cascade={cascade}
    damping={damping}
    className={className}
    triggerOnce={triggerOnce}
    {...props}
  >
    {children}
  </Flip>
);

export const BounceIn: React.FC<BaseAnimationProps> = ({ 
  children, 
  delay = 0, 
  duration = 1000,
  cascade = false,
  damping = 0.5,
  className = '',
  triggerOnce = true,
  ...props 
}) => (
  <Bounce
    delay={delay}
    duration={duration}
    cascade={cascade}
    damping={damping}
    className={className}
    triggerOnce={triggerOnce}
    {...props}
  >
    {children}
  </Bounce>
);

export const CustomFadeIn: React.FC<BaseAnimationProps> = ({ 
  children, 
  delay = 0, 
  duration = 1000,
  cascade = false,
  damping = 0.5,
  className = '',
  triggerOnce = true,
  ...props 
}) => (
  <Reveal
    keyframes={customFadeIn}
    delay={delay}
    duration={duration}
    cascade={cascade}
    damping={damping}
    className={className}
    triggerOnce={triggerOnce}
    {...props}
  >
    {children}
  </Reveal>
);

export const CustomSlideIn: React.FC<BaseAnimationProps> = ({ 
  children, 
  delay = 0, 
  duration = 1000,
  cascade = false,
  damping = 0.5,
  className = '',
  triggerOnce = true,
  ...props 
}) => (
  <Reveal
    keyframes={customSlideIn}
    delay={delay}
    duration={duration}
    cascade={cascade}
    damping={damping}
    className={className}
    triggerOnce={triggerOnce}
    {...props}
  >
    {children}
  </Reveal>
); 