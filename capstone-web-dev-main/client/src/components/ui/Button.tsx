import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', isLoading, icon, className, disabled, ...props
}) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer',
        {
          'bg-[#1e2a5e] text-white hover:bg-[#141b3d] focus:ring-[#1e2a5e] shadow-sm': variant === 'primary',
          'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-300 shadow-sm': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-sm': variant === 'danger',
          'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-[#1e2a5e]': variant === 'outline',
          'text-gray-700 hover:bg-gray-100 focus:ring-gray-300': variant === 'ghost',
          'px-2.5 py-1 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-2.5 text-base': size === 'lg',
        },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};
