import React from 'react';

const colors = [
  { name: 'white', value: 'hsl(0, 0%, 100%)' },
  { name: 'black', value: 'hsl(0, 0%, 0%)' },
  { name: 'blue', value: 'hsl(210, 35%, 75%)' },
  { name: 'green', value: 'hsl(140, 30%, 75%)' },
  { name: 'red', value: 'hsl(0, 35%, 75%)' },
  { name: 'yellow', value: 'hsl(45, 40%, 75%)' },
  { name: 'purple', value: 'hsl(270, 35%, 75%)' },
  { name: 'orange', value: 'hsl(25, 40%, 75%)' },
  { name: 'pink', value: 'hsl(330, 30%, 75%)' },
  { name: 'teal', value: 'hsl(180, 30%, 75%)' },
  { name: 'indigo', value: 'hsl(240, 35%, 75%)' },
  { name: 'gray', value: 'hsl(200, 15%, 75%)' },
  { name: 'dark-blue', value: 'hsl(210, 35%, 25%)' },
  { name: 'dark-green', value: 'hsl(140, 30%, 25%)' },
  { name: 'dark-red', value: 'hsl(0, 35%, 25%)' },
  { name: 'dark-yellow', value: 'hsl(45, 40%, 25%)' },
  { name: 'dark-purple', value: 'hsl(270, 35%, 25%)' },
  { name: 'dark-orange', value: 'hsl(25, 40%, 25%)' },
  { name: 'dark-pink', value: 'hsl(330, 30%, 25%)' },
  { name: 'dark-teal', value: 'hsl(180, 30%, 25%)' },
  { name: 'dark-indigo', value: 'hsl(240, 35%, 25%)' },
  { name: 'dark-gray', value: 'hsl(200, 15%, 25%)' },
];

export interface ColorPaletteProps {
  className?: string;
}

export function ColorPalette({ className = '' }: ColorPaletteProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 ${className}`}>
      {colors.map((color) => (
        <div key={color.name} className="flex flex-col items-center space-y-2">
          <div
            className={`w-20 h-20 rounded-lg border ${color.name === 'white' ? 'border-gray' : 'border-gray'}`}
            style={{ backgroundColor: color.value }}
          />
          <div className="text-center">
            <div className="font-medium text-sm capitalize">{color.name}</div>
            <div className="text-xs text-gray">{color.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}