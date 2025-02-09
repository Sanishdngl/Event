import React from 'react';

const Label = ({ 
  children, 
  className = "", 
  htmlFor,
  required,
  disabled,
  ...props 
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 
        ${disabled ? 'opacity-70 cursor-not-allowed' : ''}
        ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

export { Label };