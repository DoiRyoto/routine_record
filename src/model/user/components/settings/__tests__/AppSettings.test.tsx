import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppSettings } from '@/model/user/components/settings/AppSettings';

describe('AppSettings', () => {
  test('テーマ切り替えが即座に反映される', async () => {
    const user = userEvent.setup();
    const mockOnThemeChange = jest.fn();
    render(<AppSettings onThemeChange={mockOnThemeChange} />);
    
    await user.click(screen.getByLabelText('ダークモード'));
    
    expect(mockOnThemeChange).toHaveBeenCalledWith('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });
  
  test('言語切り替えが正常動作する', async () => {
    const user = userEvent.setup();
    const mockOnLanguageChange = jest.fn();
    render(<AppSettings onLanguageChange={mockOnLanguageChange} />);
    
    await user.selectOptions(screen.getByLabelText('言語'), 'en');
    
    expect(mockOnLanguageChange).toHaveBeenCalledWith('en');
  });
  
  test('時刻フォーマット設定が保存される', async () => {
    const user = userEvent.setup();
    const mockOnSave = jest.fn();
    render(<AppSettings onSave={mockOnSave} />);
    
    await user.click(screen.getByLabelText('12時間形式'));
    await user.click(screen.getByRole('button', { name: '保存' }));
    
    expect(mockOnSave).toHaveBeenCalledWith({
      timeFormat: '12h'
    });
  });

  test('デフォルト設定への復元が正常動作する', async () => {
    const user = userEvent.setup();
    const mockOnReset = jest.fn();
    render(<AppSettings onReset={mockOnReset} />);
    
    await user.click(screen.getByRole('button', { name: 'デフォルトに戻す' }));
    
    expect(mockOnReset).toHaveBeenCalled();
  });

  test('スタイリングルールに準拠している', () => {
    const { container } = render(<AppSettings />);
    
    const textElements = container.querySelectorAll('[class*="text-text-"]');
    const bgElements = container.querySelectorAll('[class*="bg-bg-"]');
    
    expect(textElements.length).toBeGreaterThan(0);
    expect(bgElements.length).toBeGreaterThan(0);
  });
});