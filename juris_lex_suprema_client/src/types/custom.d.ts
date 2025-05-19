import { LinkProps } from 'react-router-dom';

// Расширение типов для кнопки с Link компонентом
declare module 'react' {
  interface ButtonHTMLAttributes<T> extends React.HTMLAttributes<T> {
    to?: string;
  }
}

// Добавляем поддержку дополнительных пропсов для компонентов
declare namespace JSX {
  interface IntrinsicAttributes {
    // Дополнительные атрибуты, которые могут быть переданы всем компонентам
    [key: string]: any;
  }
} 