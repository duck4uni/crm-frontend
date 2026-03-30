import { cn } from "@/lib/utils";
import React from "react";
import { FiChevronDown } from "react-icons/fi";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  variant?: "default" | "subtle";
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, variant = "default", placeholder, ...props }, ref) => {
    const variantStyles = {
      default: "border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent",
      subtle: "border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent",
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full appearance-none px-3 py-2 pr-10 border rounded-lg focus:outline-none bg-white transition-colors",
              "text-sm text-gray-900 cursor-pointer",
              "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60",
              "[&>option:disabled]:text-gray-400",
              variantStyles[variant],
              error && "border-red-500 focus:ring-red-500",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FiChevronDown
              className={cn(
                "w-4 h-4 transition-colors",
                error ? "text-red-500" : "text-gray-400",
                props.disabled && "opacity-50"
              )}
            />
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
