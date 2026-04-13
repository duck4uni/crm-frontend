"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children" | "size"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  variant?: "default" | "subtle";
  size?: "sm" | "md";
  placeholder?: string;
}

function normalizeSelectValue(
  value: string | number | readonly string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  openUpward: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      className,
      variant = "default",
      size = "md",
      placeholder,
      value,
      defaultValue,
      onChange,
      disabled,
      id,
      name,
      required,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [internalValue, setInternalValue] = useState(() => {
      if (value !== undefined) {
        return normalizeSelectValue(value);
      }

      return normalizeSelectValue(defaultValue);
    });

    const rootRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [menuPosition, setMenuPosition] = useState<MenuPosition>({
      top: 0,
      left: 0,
      width: 0,
      maxHeight: 240,
      openUpward: false,
    });
    const controlledValue = value !== undefined ? normalizeSelectValue(value) : undefined;
    const currentValue = controlledValue ?? internalValue;

    useEffect(() => {
      setIsMounted(true);
    }, []);

    const updateMenuPosition = React.useCallback(() => {
      if (!triggerRef.current) {
        return;
      }

      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const viewportPadding = 8;
      const menuGap = 6;
      const minimumMenuHeight = 96;
      const preferredMenuHeight = 260;

      // Keep the menu attached under the trigger to avoid detached/far-away popups.
      const spaceBelow = Math.max(0, viewportHeight - rect.bottom - viewportPadding - menuGap);
      const maxHeight = Math.max(
        minimumMenuHeight,
        Math.min(preferredMenuHeight, spaceBelow),
      );

      const top = rect.bottom + menuGap;
      const left = Math.min(rect.left, viewportWidth - rect.width - viewportPadding);

      setMenuPosition({
        top,
        left: Math.max(viewportPadding, left),
        width: rect.width,
        maxHeight,
        openUpward: false,
      });
    }, []);

    useEffect(() => {
      if (controlledValue !== undefined) {
        setInternalValue(controlledValue);
      }
    }, [controlledValue]);

    useEffect(() => {
      const onMouseDown = (event: MouseEvent) => {
        if (!rootRef.current) {
          return;
        }

        if (rootRef.current.contains(event.target as Node)) {
          return;
        }

        if (menuRef.current?.contains(event.target as Node)) {
          return;
        }

        if (!rootRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      const onEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", onMouseDown);
      document.addEventListener("keydown", onEscape);

      return () => {
        document.removeEventListener("mousedown", onMouseDown);
        document.removeEventListener("keydown", onEscape);
      };
    }, []);

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      updateMenuPosition();

      const handleViewportChange = () => {
        updateMenuPosition();
      };

      window.addEventListener("resize", handleViewportChange);
      window.addEventListener("scroll", handleViewportChange, true);

      return () => {
        window.removeEventListener("resize", handleViewportChange);
        window.removeEventListener("scroll", handleViewportChange, true);
      };
    }, [isOpen, updateMenuPosition]);

    const variantStyles = {
      default:
        "border-gray-400 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent",
      subtle:
        "border-gray-400 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent",
    };

    const sizeStyles = {
      sm: "px-2 py-1",
      md: "px-3 py-2",
    };

    const selectedOption = useMemo(
      () => options.find((option) => option.value === currentValue),
      [options, currentValue],
    );

    const displayLabel =
      selectedOption?.label || placeholder || "Chọn một giá trị";

    const emitChange = (nextValue: string) => {
      const syntheticEvent = {
        target: {
          value: nextValue,
          name,
          id,
        },
        currentTarget: {
          value: nextValue,
          name,
          id,
        },
      } as React.ChangeEvent<HTMLSelectElement>;

      onChange?.(syntheticEvent);
    };

    const handleSelectOption = (nextValue: string) => {
      if (disabled) {
        return;
      }

      if (controlledValue === undefined) {
        setInternalValue(nextValue);
      }

      emitChange(nextValue);
      setIsOpen(false);
    };

    return (
      <div ref={rootRef} className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={id}
          name={name}
          value={currentValue}
          onChange={(event) => handleSelectOption(event.target.value)}
          disabled={disabled}
          required={required}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        >
          {!required && <option value="">{placeholder || "Chưa chọn"}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="relative">
          <button
            type="button"
            id={id ? `${id}-trigger` : undefined}
            ref={triggerRef}
            onClick={() => {
              if (disabled) {
                return;
              }

              setIsOpen((prev) => {
                const next = !prev;
                if (next) {
                  requestAnimationFrame(() => updateMenuPosition());
                }
                return next;
              });
            }}
            disabled={disabled}
            className={cn(
              "w-full border rounded-lg bg-white text-left text-sm transition-colors",
              "flex items-center justify-between gap-2",
              "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60",
              sizeStyles[size],
              variantStyles[variant],
              error && "border-red-500 focus-within:ring-red-500",
              className,
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className={cn("truncate", !selectedOption && "text-gray-400")}>{displayLabel}</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200",
                isOpen && "rotate-180",
                error && "text-red-500",
              )}
            />
          </button>
        </div>

        {isMounted &&
          createPortal(
            <div
              ref={menuRef}
              className={cn(
                "fixed z-[120] rounded-lg border border-gray-200 bg-white shadow-lg",
                "transform transition duration-150 ease-out",
                "overflow-y-auto overscroll-contain",
                isOpen
                  ? "opacity-100 scale-100"
                  : cn(
                      "pointer-events-none opacity-0 scale-95",
                      menuPosition.openUpward ? "translate-y-1" : "-translate-y-1",
                    ),
              )}
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                maxHeight: menuPosition.maxHeight,
              }}
              onWheelCapture={(event) => event.stopPropagation()}
            >
              {!required && (
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors",
                    currentValue === "" && "bg-primary-50 text-primary-700",
                  )}
                  onClick={() => handleSelectOption("")}
                >
                  <span className="flex items-center justify-between gap-2">
                    {placeholder || "Chưa chọn"}
                    {currentValue === "" && <Check className="w-4 h-4" />}
                  </span>
                </button>
              )}

              {options.map((option) => {
                const isSelected = option.value === currentValue;

                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm transition-colors",
                      "hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
                      isSelected && "bg-primary-50 text-primary-700",
                    )}
                    onClick={() => handleSelectOption(option.value)}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate">{option.label}</span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </span>
                  </button>
                );
              })}
            </div>,
            document.body,
          )}

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
