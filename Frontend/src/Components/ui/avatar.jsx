import React from 'react';
import { User } from "lucide-react";

export const Avatar = ({ 
  children, 
  className = "", 
  ...props 
}) => {
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const AvatarImage = ({ 
  className = "", 
  src, 
  alt = "", 
  ...props 
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`aspect-square h-full w-full object-cover ${className}`}
      {...props}
    />
  );
};

export const AvatarFallback = ({ 
  className = "", 
  children,
  ...props 
}) => {
  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 ${className}`}
      {...props}
    >
      {children || <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />}
    </div>
  );
};