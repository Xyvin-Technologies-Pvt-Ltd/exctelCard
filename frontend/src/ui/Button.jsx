import React from "react";
import { cn } from "../utils/cn";

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default:
        "bg-orange-500 text-white hover:bg-orange-600 focus-visible:ring-orange-500",
      destructive:
        "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500",
      outline:
        "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500",
      secondary:
        "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500",
      ghost: "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500",
      link: "text-orange-600 underline-offset-4 hover:underline focus-visible:ring-orange-500",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-8",
      icon: "h-10 w-10",
    };

    const Component = asChild ? "span" : "button";

    return (
      <Component
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Button.displayName = "Button";

export { Button };
