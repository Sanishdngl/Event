import * as React from 'react';

const Dialog = ({ children, open, onClose }) => {
  if (!open) return null;
  
  return (
    <div className="animate-in fade-in duration-200">
      {children}
    </div>
  );
};

const DialogContent = ({
  className = "",
  children,
  onClose,
  ...props
}) => {
  const dialogRef = React.useRef(null);

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    const handleClickOutside = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className={`
          relative w-full max-w-lg rounded-xl p-6 shadow-lg 
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
          ring-1 ring-gray-200 dark:ring-gray-700
          animate-in zoom-in-95 duration-300
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

const DialogHeader = ({ className = "", ...props }) => (
  <div 
    className={`mb-4 ${className}`}
    {...props}
  />
);

const DialogTitle = ({ className = "", ...props }) => (
  <h2 
    className={`text-lg font-semibold leading-none tracking-tight dark:text-white ${className}`}
    {...props}
  />
);

const DialogDescription = ({ className = "", ...props }) => (
  <div
    className={`text-sm leading-relaxed opacity-90 dark:text-gray-300 ${className}`}
    {...props}
  />
);

const DialogFooter = ({ className = "", ...props }) => (
  <div 
    className={`mt-6 flex justify-end space-x-4 ${className}`}
    {...props}
  />
);

const DialogClose = ({ className = "", ...props }) => (
  <button
    className={`
      mt-4 inline-flex h-10 items-center justify-center rounded-lg px-4 py-2
      text-sm font-medium tracking-wide
      bg-gray-100 hover:bg-gray-200 
      dark:bg-gray-700 dark:hover:bg-gray-600
      transition-colors duration-200
      ${className}
    `}
    {...props}
  />
);

const DialogAction = ({ className = "", variant = "primary", ...props }) => {
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300"
  };

  return (
    <button
      className={`
        mt-4 inline-flex h-10 items-center justify-center rounded-lg px-4 py-2
        text-sm font-medium tracking-wide
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${variants[variant]}
        ${className}
      `}
      {...props}
    />
  );
};

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogAction
};