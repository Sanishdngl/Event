import React from 'react';
import { 
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff
} from "lucide-react";

export const Alert = ({ 
  children, 
  className = "", 
  variant = "default", 
  icon,
  ...props 
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
  };

  const icons = {
    default: AlertCircle,
    destructive: XCircle,
    success: CheckCircle2,
    warning: AlertCircle,
    info: Info,
    wifi: Wifi,
    wifiOff: WifiOff
  };

  const IconComponent = icon || icons[variant];

  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg px-4 py-3 text-sm [&>svg]:h-4 [&>svg]:w-4 ${variants[variant]} ${className}`}
      {...props}
    >
      <div className="flex items-start gap-4">
        {IconComponent && (
          <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

export const AlertTitle = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <h5
      className={`mb-1 font-medium leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
};

export const AlertDescription = ({ 
  children,
  className = "",
  ...props 
}) => {
  return (
    <div
      className={`text-sm [&_p]:leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};