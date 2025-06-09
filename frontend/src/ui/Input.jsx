import React, { forwardRef } from "react";
import { cn } from "../utils/cn";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = "",
      type = "text",
      required = false,
      disabled = false,
      placeholder,
      startIcon,
      endIcon,
      ...props
    },
    ref
  ) => {
    const inputClasses = cn(
      // Base styles
      "w-full px-3 py-2.5 text-sm rounded-lg border transition-all duration-200",
      "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0",

      // States
      error
        ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50"
        : "border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white hover:border-gray-400",

      disabled && "bg-gray-50 text-gray-500 cursor-not-allowed",

      // Icon padding
      startIcon && "pl-10",
      endIcon && "pr-10",

      className
    );

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {startIcon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            className={inputClasses}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${props.name}-error`
                : helperText
                ? `${props.name}-helper`
                : undefined
            }
            {...props}
          />

          {endIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {endIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${props.name}-error`}
            className="text-sm text-red-600 flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${props.name}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
