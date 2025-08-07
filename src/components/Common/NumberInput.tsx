'use client';

import { useEffect, useState } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}

export default function NumberInput({
  value,
  onChange,
  min = 1,
  max = 100,
  step = 1,
  label,
  className = '',
}: NumberInputProps) {
  const [displayValue, setDisplayValue] = useState(value.toString());

  useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // 空文字列の場合はminの値にセット
    if (inputValue === '') {
      onChange(min);
      return;
    }

    const numValue = parseInt(inputValue);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
    }
  };

  const handleInputBlur = () => {
    // フォーカスを失った時に正しい値を表示
    setDisplayValue(value.toString());
  };

  const increment = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}
      <div className="flex items-center">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="w-11 h-11 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 
                     hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 
                     dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600
                     flex items-center justify-center transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50
                     dark:disabled:hover:bg-gray-700"
        >
          <svg
            className="w-4 h-4 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="w-20 px-3 py-2.5 border-t border-b border-gray-300 bg-white text-gray-900 
                     text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white
                     dark:focus:ring-blue-400 dark:focus:border-blue-400"
        />

        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="w-11 h-11 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 
                     hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 
                     dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600
                     flex items-center justify-center transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50
                     dark:disabled:hover:bg-gray-700"
        >
          <svg
            className="w-4 h-4 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
