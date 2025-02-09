import React, { useState } from 'react';

export const Tabs = ({ 
  className = "", 
  defaultValue,
  value,
  children,
  onValueChange,
  ...props 
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTab = value !== undefined ? value : internalValue;

  const handleTabChange = (newValue) => {
    setInternalValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const modifiedChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return null;
    
    return React.cloneElement(child, {
      activeTab,
      onValueChange: handleTabChange
    });
  });

  return (
    <div 
      className={`w-full ${className}`} 
      {...props}
    >
      {modifiedChildren}
    </div>
  );
};

export const TabsList = ({ 
  className = "", 
  children,
  activeTab,
  onValueChange,
  ...props 
}) => {
  // Map children to add activeTab and onValueChange props
  const modifiedChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return null;
    
    return React.cloneElement(child, {
      activeTab,
      onValueChange
    });
  });

  return (
    <div
      role="tablist"
      className={`inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 dark:bg-gray-800 dark:text-gray-400 ${className}`}
      {...props}
    >
      {modifiedChildren}
    </div>
  );
};

export const TabsTrigger = ({ 
  className = "", 
  value,
  activeTab,
  onValueChange,
  children,
  ...props 
}) => {
  const isActive = value === activeTab;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange?.(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${isActive 
          ? 'bg-white text-gray-950 shadow-sm dark:bg-gray-950 dark:text-gray-50' 
          : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50'}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ 
  className = "", 
  value,
  activeTab,
  children,
  ...props 
}) => {
  if (value !== activeTab) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};