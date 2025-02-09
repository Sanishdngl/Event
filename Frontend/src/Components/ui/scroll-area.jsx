import React from 'react';

export const ScrollArea = ({ 
  children, 
  className = "",
  ...props 
}) => {
  return (
    <div
      className={`relative overflow-auto ${className}`}
      style={{
        // Customize scrollbar for webkit browsers
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
      }}
      {...props}
    >
      <div className="h-full w-full">
        {children}
      </div>
    </div>
  );
};

export const ScrollBar = ({
  orientation = "vertical",
  className = "",
  ...props
}) => {
  return (
    <div
      className={`flex touch-none select-none transition-colors ${
        orientation === "vertical"
          ? "h-full w-2.5 border-l border-l-transparent p-[1px]"
          : "h-2.5 border-t border-t-transparent p-[1px]"
      } ${className}`}
      {...props}
    />
  );
};

export const ScrollAreaThumb = ({ className = "", ...props }) => {
  return (
    <div
      className={`relative flex-1 rounded-full bg-gray-300 dark:bg-gray-600 ${className}`}
      {...props}
    />
  );
};