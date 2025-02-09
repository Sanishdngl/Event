import React from 'react';
import { Search, X } from "lucide-react";

export const Input = React.forwardRef(({ 
  className = "",
  type = "text",
  variant = "default",
  size = "default",
  icon,
  error,
  clearable = false,
  onClear,
  disabled = false,
  ...props 
}, ref) => {
  const variants = {
    default: "border-gray-200 focus:border-gray-400 dark:border-gray-800 dark:focus:border-gray-600",
    error: "border-red-500 focus:border-red-500 dark:border-red-800 dark:focus:border-red-800",
    success: "border-green-500 focus:border-green-500 dark:border-green-800 dark:focus:border-green-800"
  };

  const sizes = {
    default: "h-9 px-3 py-2",
    sm: "h-8 px-2 py-1 text-sm",
    lg: "h-10 px-4 py-2"
  };

  const IconComponent = icon;
  const currentVariant = error ? "error" : variant;

  const baseStyles = "flex w-full rounded-md border bg-transparent text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-800";

  return (
    <div className="relative">
      {IconComponent && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <IconComponent className="h-4 w-4" />
        </div>
      )}
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        className={`
          ${baseStyles} 
          ${variants[currentVariant]} 
          ${sizes[size]}
          ${IconComponent ? 'pl-9' : ''} 
          ${clearable ? 'pr-9' : ''} 
          ${className}
        `}
        {...props}
      />
      {clearable && props.value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

Input.displayName = "Input";

export const SearchInput = ({ 
  className = "", 
  ...props 
}) => {
  return (
    <Input
      type="search"
      icon={Search}
      placeholder="Search..."
      className={className}
      {...props}
    />
  );
};