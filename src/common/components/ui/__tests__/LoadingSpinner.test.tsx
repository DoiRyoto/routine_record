import { render, screen } from '@testing-library/react';

import { LoadingSpinner } from '@/common/components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  test('基本的なスピナーが表示される', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  test('ローディングメッセージが表示される', () => {
    render(<LoadingSpinner message="データを読み込んでいます..." />);
    
    expect(screen.getByText('データを読み込んでいます...')).toBeInTheDocument();
  });
  
  test('フルスクリーンローディングが表示される', () => {
    render(<LoadingSpinner fullscreen />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('fixed inset-0');
  });
});