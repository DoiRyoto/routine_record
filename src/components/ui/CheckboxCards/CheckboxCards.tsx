'use client';

import React from 'react';
import { Checkbox } from '../Checkbox';

export interface CheckboxCardOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxCardsProps {
  options: CheckboxCardOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  columns?: 1 | 2 | 3 | 4;
  disabled?: boolean;
  className?: string;
}

export const CheckboxCards = React.forwardRef<HTMLDivElement, CheckboxCardsProps>(
  ({ 
    options, 
    value, 
    defaultValue = [], 
    onValueChange, 
    columns = 1,
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

    const gridClass = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    }[columns];

    return (
      <div
        ref={ref}
        className={`grid gap-4 ${gridClass} ${className}`}
        {...props}
      >
        {options.map((option) => {
          const isChecked = currentValue.includes(option.value);
          const isDisabled = disabled || option.disabled;
          
          return (
            <div key={option.value} className="relative">
              <label
                htmlFor={option.value}
                className={`
                  block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                  ${isChecked 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${isDisabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-sm'
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={option.value}
                    checked={isChecked}
                    onCheckedChange={(checked) => 
                      handleValueChange(option.value, checked as boolean)
                    }
                    disabled={isDisabled}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="mt-1 text-sm text-gray-600">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              </label>
            </div>
          );
        })}
      </div>
    );
  }
);
CheckboxCards.displayName = 'CheckboxCards';