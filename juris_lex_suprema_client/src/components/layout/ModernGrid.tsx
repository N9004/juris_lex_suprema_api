import React, { ReactNode } from 'react';

interface ModernGridProps {
  children: ReactNode;
  cols?: number | string;
  gap?: number | string;
  className?: string;
  autoFill?: boolean;
  minWidth?: string;
}

/**
 * Современный компонент для создания CSS Grid макетов
 * Заменяет стандартный flexbox на более современный и гибкий CSS Grid
 */
const ModernGrid: React.FC<ModernGridProps> = ({
  children,
  cols = 'auto-fit',
  gap = 4,
  className = '',
  autoFill = false,
  minWidth = '300px',
}) => {
  // Преобразование числового значения cols в строку для grid-template-columns
  const getColsValue = () => {
    if (typeof cols === 'number') {
      return `repeat(${cols}, minmax(0, 1fr))`;
    }
    
    if (cols === 'auto-fit' || cols === 'auto-fill') {
      const mode = autoFill ? 'auto-fill' : 'auto-fit';
      return `repeat(${mode}, minmax(${minWidth}, 1fr))`;
    }
    
    return cols;
  };

  // Преобразование числового значения gap в строку для gap
  const getGapValue = () => {
    if (typeof gap === 'number') {
      return `${gap * 0.25}rem`; // Преобразуем в rem, используя множитель Tailwind (1 = 0.25rem)
    }
    return gap;
  };

  return (
    <div 
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: getColsValue(),
        gap: getGapValue()
      }}
    >
      {children}
    </div>
  );
};

export default ModernGrid; 