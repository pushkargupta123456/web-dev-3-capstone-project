import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', className }) => {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
      {
        'bg-green-100 text-green-800 border border-green-200': variant === 'green',
        'bg-red-100 text-red-800 border border-red-200': variant === 'red',
        'bg-yellow-100 text-yellow-800 border border-yellow-200': variant === 'yellow',
        'bg-blue-100 text-blue-800 border border-blue-200': variant === 'blue',
        'bg-gray-100 text-gray-800 border border-gray-200': variant === 'gray',
        'bg-purple-100 text-purple-800 border border-purple-200': variant === 'purple',
      },
      className
    )}>
      {children}
    </span>
  );
};
