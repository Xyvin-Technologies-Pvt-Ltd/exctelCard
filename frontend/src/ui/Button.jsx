import React from "react";
import { cn } from "../utils/cn";

const Button = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  icon,
  onClick,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-orange-500 hover:bg-orange-600 text-white border-transparent focus:ring-orange-500 shadow-sm";
      case "secondary":
        return "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-orange-500 shadow-sm";
      case "ghost":
        return "bg-transparent hover:bg-gray-100 text-gray-700 border-transparent focus:ring-gray-300";
      case "destructive":
        return "bg-red-500 hover:bg-red-600 text-white border-transparent focus:ring-red-500 shadow-sm";
      case "success":
        return "bg-green-500 hover:bg-green-600 text-white border-transparent focus:ring-green-500 shadow-sm";
      case "outline":
        return "bg-transparent hover:bg-orange-50 text-orange-600 border border-orange-300 hover:border-orange-400 focus:ring-orange-500";
      case "link":
        return "bg-transparent hover:bg-transparent text-orange-600 border-transparent hover:underline focus:ring-transparent p-0 shadow-none";
      default:
        return "bg-orange-500 hover:bg-orange-600 text-white border-transparent focus:ring-orange-500 shadow-sm";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "px-2 py-1 text-xs h-7";
      case "sm":
        return "px-3 py-1.5 text-sm h-8";
      case "md":
        return "px-4 py-2 text-sm h-10";
      case "lg":
        return "px-6 py-2.5 text-base h-11";
      case "xl":
        return "px-8 py-3 text-lg h-12";
      default:
        return "px-4 py-2 text-sm h-10";
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2 
    border rounded-lg font-medium 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed 
    transition-all duration-200 ease-in-out
    relative overflow-hidden
  `;

  const classes = cn(
    baseClasses,
    getVariantClasses(),
    getSizeClasses(),
    className
  );

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && <span className="w-4 h-4">{icon}</span>}
        {children}
      </span>
    </button>
  );
};

export default Button;
