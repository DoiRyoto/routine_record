import React from 'react';

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  lines?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  width = '100%', 
  height = '20px', 
  lines = 1 
}) => {
  // 最小実装：テストが通るための基本要素のみ
  if (lines > 1) {
    return (
      <div>
        {Array.from({ length: lines }, (_, i) => (
          <div 
            key={i}
            data-testid="skeleton-line"
            className="animate-pulse bg-gray-200 rounded mb-2"
            style={{ width, height }}
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      data-testid="skeleton-loader"
      className="animate-pulse bg-gray-200 rounded"
      style={{ width, height }}
    />
  );
};