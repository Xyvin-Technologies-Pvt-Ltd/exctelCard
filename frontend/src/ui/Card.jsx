import React from "react";

const Card = ({
  children,
  className = "",
  title,
  titleClassName = "",
  bodyClassName = "",
  variant = "default",
  hover = false,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "border-primary-100 bg-primary-50";
      case "secondary":
        return "border-secondary-100 bg-secondary-50";
      case "success":
        return "border-green-100 bg-green-50";
      case "danger":
        return "border-red-100 bg-red-50";
      case "warning":
        return "border-yellow-100 bg-yellow-50";
      case "info":
        return "border-blue-100 bg-blue-50";
      case "light":
        return "border-gray-100 bg-gray-50";
      case "dark":
        return "border-gray-700 bg-gray-800 text-white";
      default:
        return "border-gray-200 bg-white";
    }
  };

  const hoverClasses = hover
    ? "transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
    : "";

  return (
    <div
      className={`rounded-lg border shadow-sm overflow-hidden ${getVariantClasses()} ${hoverClasses} ${className}`}
      {...props}
    >
      {title && (
        <div
          className={`px-4 py-3 border-b border-gray-200 font-medium ${titleClassName}`}
        >
          {title}
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default Card;
