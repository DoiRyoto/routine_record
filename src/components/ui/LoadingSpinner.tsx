import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullscreen?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message,
  fullscreen = false,
  size = 'medium'
}) => {
  // サイズクラス設定
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6', 
    large: 'w-8 h-8'
  };

  // 基本スピナーコンポーネント
  const spinner = (
    <div className="flex flex-col items-center justify-center p-4">
      <div 
        data-testid="spinner-icon"
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
      />
      {message && (
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );

  // フルスクリーン表示
  if (fullscreen) {
    return (
      <div 
        data-testid="loading-spinner"
        className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50"
        role="status"
        aria-label="読み込み中"
      >
        {spinner}
      </div>
    );
  }

  return (
    <div 
      data-testid="loading-spinner"
      role="status"
      aria-label="読み込み中"
    >
      {spinner}
    </div>
  );
};