import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth, disabled, children, ...props }, ref) => {
    const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantStyles = {
      primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50',
      secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/50',
      outline: 'border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary/50'
    };

    const disabledStyles = 'opacity-50 cursor-not-allowed';
    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          disabled && disabledStyles,
          widthStyles,
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button'; 