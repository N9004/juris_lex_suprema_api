import React, { ButtonHTMLAttributes, ElementType, ComponentPropsWithoutRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  rounded?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  as?: ElementType;
  className?: string;
};

type ButtonProps<E extends ElementType = 'button'> = 
  ButtonBaseProps & 
  Omit<ComponentPropsWithoutRef<E>, keyof ButtonBaseProps>;

const Button = <E extends ElementType = 'button'>({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  rounded = false,
  icon,
  iconPosition = 'left',
  as,
  className = '',
  ...props
}: ButtonProps<E>) => {
  const Component = as || 'button';
  
  // Базовые стили для всех кнопок
  const baseStyles = 'inline-flex items-center justify-center transition-all duration-200 font-carabine focus:outline-none';
  
  // Стили для размеров
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Стили для вариантов
  const variantStyles = {
    primary: 'bg-brand-button-dark text-brand-button-text-light hover:opacity-90 active:opacity-80 shadow-md',
    secondary: 'bg-brand-button-text-light text-brand-button-dark border border-brand-button-dark hover:bg-brand-button-dark/5 active:bg-brand-button-dark/10',
    outline: 'border border-brand-button-dark text-brand-button-dark bg-transparent hover:bg-brand-button-dark/5 active:bg-brand-button-dark/10',
    text: 'bg-transparent text-brand-button-dark hover:bg-brand-button-dark/5 active:bg-brand-button-dark/10',
  };
  
  // Стили для ширины
  const widthStyles = fullWidth ? 'w-full' : '';
  
  // Стили для скругления
  const roundedStyles = rounded ? 'rounded-full' : 'rounded-md';
  
  return (
    <Component
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${roundedStyles} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </Component>
  );
};

export default Button; 