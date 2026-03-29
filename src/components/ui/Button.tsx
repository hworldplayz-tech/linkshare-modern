import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'blank';
  size?: 'sm' | 'md' | 'lg';
};

export const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: ButtonProps) => {
  const variants = {
    primary: 'bg-[#00a884] text-white hover:bg-[#008f70]',
    secondary: 'bg-[#128c7e] text-white hover:bg-[#075e54]',
    outline: 'border-2 border-[#00a884] text-[#00a884] hover:bg-[#00a884] hover:text-white',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600',
    blank: '',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg font-semibold',
  };
  return (
    <button 
      className={cn(
        'rounded-full transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
