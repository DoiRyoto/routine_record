'use client';

import React from 'react';

export interface DataListItem {
  label: string;
  value: React.ReactNode;
}

export interface DataListProps extends React.HTMLAttributes<HTMLDivElement> {
  items: DataListItem[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export const DataList = React.forwardRef<HTMLDivElement, DataListProps>(
  ({ items, orientation = 'vertical', size = 'md', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'text-sm gap-2',
      md: 'text-sm gap-3',
      lg: 'text-base gap-4',
    }[size];

    const orientationClasses = {
      horizontal: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      vertical: 'space-y-1',
    }[orientation];

    const itemClasses = orientation === 'horizontal' 
      ? 'flex flex-col'
      : 'flex justify-between items-start';

    return (
      <div
        ref={ref}
        className={`${orientationClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        {items.map((item, index) => (
          <div key={index} className={itemClasses}>
            <dt className="font-medium text-gray-900 mb-1">
              {item.label}
            </dt>
            <dd className="text-gray-600">
              {item.value}
            </dd>
          </div>
        ))}
      </div>
    );
  }
);
DataList.displayName = 'DataList';