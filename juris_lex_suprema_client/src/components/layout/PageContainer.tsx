import React, { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  withPadding?: boolean;
}

/**
 * Компонент-контейнер для всех страниц приложения
 * Обеспечивает единый стиль и макет для всех страниц
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  className = '',
  maxWidth = 'xl',
  withPadding = true,
}) => {
  // Максимальная ширина контейнера
  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  // Базовые стили
  const containerClasses = [
    'w-full',
    maxWidthClasses[maxWidth],
    'mx-auto',
    withPadding ? 'px-4 sm:px-6 lg:px-8' : '',
    className,
  ].join(' ');

  return (
    <div className={containerClasses}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h1 className="text-3xl font-carabine mb-2">{title}</h1>}
          {subtitle && <p className="text-gray-600 font-liter">{subtitle}</p>}
        </div>
      )}
      <div>
        {children}
      </div>
    </div>
  );
};

export default PageContainer; 