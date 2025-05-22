import React from "react";

const Input = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
  register,
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        className={`input ${
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
        }`}
        placeholder={placeholder}
        disabled={disabled}
        {...(register ? register(name) : { value, onChange })}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default Input;
