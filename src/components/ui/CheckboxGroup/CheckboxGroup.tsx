'use client';

import React from 'react';
import { Checkbox } from '../Checkbox';

export interface CheckboxOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  options: CheckboxOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  className?: string;
}

export const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  ({ 
    options, 
    value, 
    defaultValue = [], 
    onValueChange, 
    orientation = 'vertical',
    disabled = false,
    className = '',
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleValueChange = (optionValue: string, checked: boolean) => {
      let newValue: string[];
      
      if (checked) {
        newValue = [...currentValue, optionValue];
      } else {
        newValue = currentValue.filter(v => v !== optionValue);
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    const orientationClass = orientation === 'horizontal' 
      ? 'flex flex-row flex-wrap gap-4' 
      : 'flex flex-col gap-3';

    return (
      <div
        ref={ref}
        className={`${orientationClass} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={option.value}
              checked={currentValue.includes(option.value)}
              onCheckedChange={(checked) => 
                handleValueChange(option.value, checked as boolean)
              }
              disabled={disabled || option.disabled}
            />
            <label
              htmlFor={option.value}
              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                disabled || option.disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    );
  }
);
CheckboxGroup.displayName = 'CheckboxGroup';