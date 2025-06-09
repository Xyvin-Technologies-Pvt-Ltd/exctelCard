import React from "react";
import { cn } from "../utils/cn";

const Card = ({
  children,
  className = "",
  variant = "default",
  padding = "md",
  hoverable = false,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "elevated":
        return "bg-white shadow-lg border border-gray-100";
      case "outline":
        return "bg-white border-2 border-gray-200 shadow-none";
      case "ghost":
        return "bg-transparent border-none shadow-none";
      default:
        return "bg-white shadow-md border border-gray-100";
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case "none":
        return "p-0";
      case "sm":
        return "p-4";
      case "md":
        return "p-6";
      case "lg":
        return "p-8";
      default:
        return "p-6";
    }
  };

  const cardClasses = cn(
    // Base styles
    "rounded-xl transition-all duration-200 ease-in-out",

    // Variant styles
    getVariantClasses(),

    // Padding
    getPaddingClasses(),

    // Hover effect
    hoverable && "hover:shadow-lg hover:-translate-y-1 cursor-pointer",

    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

// Card sub-components for better composition
const CardHeader = ({ children, className = "" }) => (
  <div className={cn("mb-4 pb-4 border-b border-gray-100", className)}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={cn("text-lg font-semibold text-gray-900", className)}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = "" }) => (
  <p className={cn("text-sm text-gray-600 mt-1", className)}>{children}</p>
);

const CardContent = ({ children, className = "" }) => (
  <div className={cn("", className)}>{children}</div>
);

const CardFooter = ({ children, className = "" }) => (
  <div
    className={cn(
      "mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2",
      className
    )}
  >
    {children}
  </div>
);

// Export all components
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
