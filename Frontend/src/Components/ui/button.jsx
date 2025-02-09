import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Loader2 } from "lucide-react";

export const Button = ({ 
  children, 
  className = "", 
  variant = "default",
  size = "default",
  isLoading = false,
  disabled = false,
  type = "button",
  ...props 
}) => {
  const { isDarkMode } = useTheme();

  const variants = {
    default: isDarkMode 
      ? 'bg-blue-600 text-white hover:bg-blue-700' 
      : 'bg-blue-500 text-white hover:bg-blue-600',
    outline: isDarkMode
      ? 'border border-gray-600 text-gray-300 hover:bg-gray-700'
      : 'border border-gray-300 text-gray-700 hover:bg-gray-100',
    destructive: isDarkMode
      ? 'bg-red-700 text-white hover:bg-red-800'
      : 'bg-red-500 text-white hover:bg-red-600',
    secondary: isDarkMode
      ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: isDarkMode
      ? 'hover:bg-gray-800 text-gray-100'
      : 'hover:bg-gray-100 text-gray-900',
    link: isDarkMode
      ? 'text-gray-100 underline-offset-4 hover:underline'
      : 'text-gray-900 underline-offset-4 hover:underline'
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9 p-2"
  };

  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50";

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </button>
  );
};

export const ButtonGroup = ({ 
  children,
  className = "",
  orientation = "horizontal",
  ...props 
}) => {
  const orientationStyles = {
    horizontal: "flex space-x-1",
    vertical: "flex flex-col space-y-1"
  };

  return (
    <div 
      className={`${orientationStyles[orientation]} ${className}`}
      role="group"
      {...props}
    >
      {children}
    </div>
  );
};