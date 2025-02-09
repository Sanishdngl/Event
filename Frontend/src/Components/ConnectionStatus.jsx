import React from 'react';
import { AlertCircle, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from '../components/ui/alert';
import { useTheme } from '../context/ThemeContext';

const ConnectionStatus = ({ 
  isConnected, 
  reconnectAttempts, 
  maxReconnectAttempts,
  className = ""
}) => {
  const { isDarkMode } = useTheme();
  
  if (isConnected) return null;
  
  const isMaxAttempts = reconnectAttempts >= maxReconnectAttempts;

  const positionClasses = "fixed bottom-4 right-4 max-w-md z-50";
  const transitionClasses = "transition-all duration-300 transform";
  const shadowClasses = isDarkMode ? "shadow-lg shadow-gray-900/20" : "shadow-lg shadow-gray-200/50";
  const borderClasses = isDarkMode ? "border border-gray-700" : "border border-gray-200";

  return (
    <Alert
      variant={isMaxAttempts ? "destructive" : "warning"}
      icon={isMaxAttempts ? AlertCircle : WifiOff}
      className={`
        fixed bottom-4 right-4 max-w-md z-50
        transition-all duration-300 transform
        ${isDarkMode ? "shadow-lg shadow-gray-900/20" : "shadow-lg shadow-gray-200/50"}
        ${isDarkMode ? "border border-gray-700" : "border border-gray-200"}
        ${className}
      `}
    >
       <AlertDescription className={isDarkMode ? "text-gray-200" : "text-gray-700"}>
        {isMaxAttempts ? (
          <div className="flex flex-col gap-1">
            <span className="font-medium">Connection lost</span>
            <span className="text-sm opacity-90">Please refresh the page to reconnect</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="font-medium">Reconnecting...</span>
            <span className="text-sm opacity-90">
              Attempt {reconnectAttempts} of {maxReconnectAttempts}
            </span>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatus;