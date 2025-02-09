import React from 'react';

const Textarea = React.forwardRef(({ 
  className = "", 
  ...props 
}, ref) => {
  return (
    <textarea
      className={`
        flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm
        placeholder:text-gray-500 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
        disabled:cursor-not-allowed disabled:opacity-50
        dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 dark:placeholder:text-gray-400
        ${className}
      `}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };