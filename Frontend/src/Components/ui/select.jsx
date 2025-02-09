import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown } from "lucide-react";

export const Select = ({ children, value, onChange, onValueChange, className = "", ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={selectRef} {...props}>
      {React.Children.map(children, child => {
        if (!child) return null;
        
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
          });
        }
        if (child.type === SelectContent) {
          return isOpen && React.cloneElement(child, {
            children: React.Children.map(child.props.children, contentChild => {
              if (!contentChild) return null;

              if (contentChild.type === SelectGroup) {
                return React.cloneElement(contentChild, {
                  children: React.Children.map(contentChild.props.children, groupChild => {
                    if (!groupChild) return null;

                    if (groupChild.type === SelectItem) {
                      return React.cloneElement(groupChild, {
                        onClick: () => handleSelect(groupChild.props.value),
                        'aria-selected': groupChild.props.value === value,
                      });
                    }
                    return groupChild;
                  }),
                });
              }
              
              if (contentChild.type === SelectItem) {
                return React.cloneElement(contentChild, {
                  onClick: () => handleSelect(contentChild.props.value),
                  'aria-selected': contentChild.props.value === value,
                });
              }
              return contentChild;
            }),
          });
        }
        return child;
      })}
    </div>
  );
};

export const SelectGroup = ({ children, className = "", ...props }) => {
  return (
    <div className={`px-1 py-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const SelectLabel = ({ children, className = "", ...props }) => {
  return (
    <div className={`px-2 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const SelectTrigger = ({ children, className = "", ...props }) => {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:ring-offset-gray-900 ${className}`}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue = ({ children, placeholder, className = "", ...props }) => {
  return (
    <span className={`block truncate ${className}`} {...props}>
      {children || placeholder}
    </span>
  );
};

export const SelectContent = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`absolute top-full mt-1 w-full z-50 min-w-[8rem] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md animate-in fade-in-0 zoom-in-95 dark:border-gray-700 dark:bg-gray-800 ${className}`}
      {...props}
    >
      <div className="p-1">
        {children}
      </div>
    </div>
  );
};

export const SelectItem = ({ children, className = "", value, ...props }) => {
  return (
    <div
      role="option"
      className={`relative flex w-full cursor-pointer select-none items-center rounded-lg py-1.5 px-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700 ${props['aria-selected'] ? 'bg-gray-100 dark:bg-gray-700' : ''} ${className}`}
      {...props}
    >
      <span className="flex flex-1 items-center gap-2">
        {children}
      </span>
      {props['aria-selected'] && (
        <span className="ml-auto pl-3">
          <Check className="h-4 w-4" />
        </span>
      )}
    </div>
  );
};