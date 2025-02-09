import React from 'react';
import { ChevronDown } from "lucide-react";

export const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, child =>
        React.cloneElement(child, { isOpen, setIsOpen })
      )}
    </div>
  );
};

export const DropdownMenuTrigger = ({ 
  children, 
  className = "", 
  isOpen, 
  setIsOpen,
  ...props 
}) => {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 ${className}`}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
    </button>
  );
};

export const DropdownMenuContent = ({ 
  children, 
  className = "", 
  isOpen, 
  setIsOpen,
  ...props 
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
      ${className}`}
      role="menu"
      aria-orientation="vertical"
      {...props}
    >
      <div className="py-1" role="none">
        {React.Children.map(children, child =>
          React.cloneElement(child, { setIsOpen })
        )}
      </div>
    </div>
  );
};

export const DropdownMenuItem = ({ 
  children, 
  className = "", 
  onClick,
  setIsOpen,
  ...props 
}) => {
  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (setIsOpen) setIsOpen(false);
  };

  return (
    <button
      className={`text-gray-700 dark:text-gray-200 group flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 ${className}`}
      role="menuitem"
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};