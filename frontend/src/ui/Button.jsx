import React from "react";

const Button = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  onClick,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-primary-500 hover:bg-primary-600 text-white border-transparent focus:ring-primary-500";
      case "secondary":
        return "bg-secondary-500 hover:bg-secondary-600 text-white border-transparent focus:ring-secondary-500";
      case "success":
        return "bg-green-500 hover:bg-green-600 text-white border-transparent focus:ring-green-500";
      case "danger":
        return "bg-red-500 hover:bg-red-600 text-white border-transparent focus:ring-red-500";
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600 text-white border-transparent focus:ring-yellow-500";
      case "info":
        return "bg-blue-500 hover:bg-blue-600 text-white border-transparent focus:ring-blue-500";
      case "light":
        return "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200 focus:ring-gray-300";
      case "dark":
        return "bg-gray-800 hover:bg-gray-900 text-white border-transparent focus:ring-gray-600";
      case "outline":
        return "bg-white hover:bg-gray-50 text-primary-500 border-primary-300 hover:border-primary-400 focus:ring-primary-500";
      case "link":
        return "bg-transparent hover:bg-gray-50 text-primary-500 border-transparent hover:underline focus:ring-transparent p-0";
      default:
        return "bg-primary-500 hover:bg-primary-600 text-white border-transparent focus:ring-primary-500";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "px-2.5 py-1.5 text-xs";
      case "sm":
        return "px-3 py-2 text-sm";
      case "md":
        return "px-4 py-2 text-sm";
      case "lg":
        return "px-5 py-2.5 text-base";
      case "xl":
        return "px-6 py-3 text-base";
      default:
        return "px-4 py-2 text-sm";
    }
  };

  const baseClasses =
    "inline-flex justify-center items-center border rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";

  const classes = `${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
