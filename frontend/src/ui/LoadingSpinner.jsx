import React from "react";
import { cn } from "../utils/cn";

const LoadingSpinner = ({ 
  size = "md", 
  variant = "primary",
  className = "",
  text = null
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "w-3 h-3 border";
      case "sm":
        return "w-4 h-4 border-2";
      case "md":
        return "w-6 h-6 border-2";
      case "lg":
        return "w-8 h-8 border-2";
      case "xl":
        return "w-12 h-12 border-3";
      default:
        return "w-6 h-6 border-2";
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "border-orange-200 border-t-orange-600";
      case "white":
        return "border-white/30 border-t-white";
      case "gray":
        return "border-gray-200 border-t-gray-600";
      default:
        return "border-orange-200 border-t-orange-600";
    }
  };

  const spinnerClasses = cn(
    "rounded-full animate-spin",
    getSizeClasses(),
    getVariantClasses(),
    className
  );

  if (text) {
    return (
      <div className="flex items-center gap-3">
        <div className={spinnerClasses} />
        <span className="text-sm text-gray-600">{text}</span>
      </div>
    );
  }

  return <div className={spinnerClasses} />;
};

// Loading states for different contexts
export const PageLoading = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
    <LoadingSpinner size="lg" />
    <p className="text-gray-600">{message}</p>
  </div>
);

export const ButtonLoading = ({ size = "sm" }) => (
  <LoadingSpinner size={size} variant="white" />
);

export const InlineLoading = ({ text = "Loading..." }) => (
  <LoadingSpinner size="sm" text={text} />
);

export default LoadingSpinner; 