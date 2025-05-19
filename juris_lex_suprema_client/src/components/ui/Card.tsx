import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string | ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  hover?: boolean;
  bordered?: boolean;
  shadow?: boolean | 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  gradient?: boolean;
}

/**
 * Современный минималистичный карточный компонент
 */
const Card: React.FC<CardProps> = ({
  children,
  title,
  footer,
  className = '',
  contentClassName = '',
  hover = false,
  bordered = false,
  shadow = 'md',
  icon,
  gradient = false,
}) => {
  // Базовые стили
  const baseStyles = 'rounded-xl backdrop-blur-sm overflow-hidden transition-all duration-300';
  
  // Стили для наведения
  const hoverStyles = hover ? 'transform hover:scale-[1.02] hover:shadow-lg hover:translate-y-[-5px]' : '';
  
  // Стили для бордера
  const borderStyles = bordered ? 'border border-gray-200/50' : '';
  
  // Стили для тени
  const shadowStyles = 
    shadow === true ? 'shadow-md' :
    shadow === 'sm' ? 'shadow-sm' :
    shadow === 'md' ? 'shadow-md' :
    shadow === 'lg' ? 'shadow-lg' : '';
    
  // Стили для градиента
  const gradientStyles = gradient 
    ? 'bg-gradient-to-br from-white/90 to-white/70' 
    : 'bg-white/90';
  
  return (
    <div className={`${baseStyles} ${hoverStyles} ${borderStyles} ${shadowStyles} ${gradientStyles} ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100/50 font-carabine text-lg flex items-center">
          {icon && <span className="mr-3">{icon}</span>}
          {title}
        </div>
      )}
      <div className={`p-6 ${contentClassName}`}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-100/50 bg-gray-50/80">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 