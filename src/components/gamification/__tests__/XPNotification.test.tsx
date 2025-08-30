import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { XPNotification } from '../XPNotification';

describe('XPNotification - Display and Animation', () => {
  test('should not render when xpAmount is 0', () => {
    render(<XPNotification xpAmount={0} />);
    
    expect(screen.queryByText(/XP/i)).not.toBeInTheDocument();
  });

  test('should render XP component when provided', () => {
    render(<XPNotification xpAmount={100} />);
    
    // XPコンポーネントがレンダリングされることを確認（初期値0でアニメーション開始）
    expect(screen.getByText(/XP/i)).toBeInTheDocument();
  });

  test('should show count-up animation', async () => {
    render(<XPNotification xpAmount={100} />);
    
    // Check initial state (should start from 0)
    expect(screen.getByText('0 XP')).toBeInTheDocument();
    
    // Wait for animation to complete
    await waitFor(() => {
      expect(screen.getByText('100 XP')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('should show particle effects during XP gain', () => {
    render(<XPNotification xpAmount={100} />);
    
    const particles = screen.getByTestId('xp-particles');
    expect(particles).toBeInTheDocument();
    expect(particles).toHaveClass('animate-particles');
  });
});