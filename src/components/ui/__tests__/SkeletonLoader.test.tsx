import { render, screen } from '@testing-library/react';

import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

describe('SkeletonLoader', () => {
  test('基本的なスケルトンが表示される', () => {
    render(<SkeletonLoader />);
    
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-loader')).toHaveClass('animate-pulse');
  });
  
  test('カスタム幅・高さが適用される', () => {
    render(<SkeletonLoader width="200px" height="100px" />);
    
    const skeleton = screen.getByTestId('skeleton-loader');
    expect(skeleton).toHaveStyle('width: 200px');
    expect(skeleton).toHaveStyle('height: 100px');
  });
  
  test('複数行のスケルトンが表示される', () => {
    render(<SkeletonLoader lines={3} />);
    
    expect(screen.getAllByTestId('skeleton-line')).toHaveLength(3);
  });
});