import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MobileNavigation } from '@/common/components/mobile/MobileNavigation';

describe('MobileNavigation', () => {
  test('モバイル画面でハンバーガーメニューが表示される', () => {
    Object.defineProperty(window, 'innerWidth', { value: 375 });
    window.dispatchEvent(new Event('resize'));
    
    render(<MobileNavigation />);
    
    expect(screen.getByTestId('hamburger-menu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'メニューを開く' })).toBeInTheDocument();
  });
  
  test('デスクトップ画面でハンバーガーメニューが非表示', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1200 });
    window.dispatchEvent(new Event('resize'));
    
    render(<MobileNavigation />);
    
    expect(screen.queryByTestId('hamburger-menu')).not.toBeInTheDocument();
  });
  
  test('メニュー開閉が正常動作する', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, 'innerWidth', { value: 375 });
    
    render(<MobileNavigation />);
    
    const menuButton = screen.getByRole('button', { name: 'メニューを開く' });
    
    // メニューを開く
    await user.click(menuButton);
    expect(screen.getByTestId('mobile-menu-drawer')).toBeInTheDocument();
    
    // メニューを閉じる
    await user.click(screen.getByRole('button', { name: 'メニューを閉じる' }));
    expect(screen.queryByTestId('mobile-menu-drawer')).not.toBeInTheDocument();
  });
});