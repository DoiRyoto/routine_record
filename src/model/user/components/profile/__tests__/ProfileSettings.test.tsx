import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProfileSettings } from '@/model/user/components/profile/ProfileSettings';

describe('ProfileSettings', () => {
  const mockUser = {
    displayName: 'テストユーザー',
    email: 'test@example.com',
    avatarUrl: '/images/avatar.jpg'
  };

  test('現在のプロフィール情報が表示される', () => {
    render(<ProfileSettings user={mockUser} />);
    
    expect(screen.getByDisplayValue('テストユーザー')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'アバター' })).toHaveAttribute('src', expect.stringContaining('/images/avatar.jpg'));
  });
  
  test('表示名変更が正常動作する', async () => {
    const user = userEvent.setup();
    const mockOnSave = jest.fn();
    render(<ProfileSettings user={mockUser} onSave={mockOnSave} />);
    
    const nameInput = screen.getByLabelText('表示名');
    await user.clear(nameInput);
    await user.type(nameInput, '新しい名前');
    await user.click(screen.getByRole('button', { name: '保存' }));
    
    expect(mockOnSave).toHaveBeenCalledWith({
      displayName: '新しい名前'
    });
  });
  
  test('表示名が空の場合エラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    render(<ProfileSettings user={mockUser} />);
    
    const nameInput = screen.getByLabelText('表示名');
    await user.clear(nameInput);
    await user.tab();
    
    expect(screen.getByText('表示名は必須です')).toBeInTheDocument();
  });

  test('data-testid属性が正しく設定されている', () => {
    render(<ProfileSettings user={mockUser} />);
    
    expect(screen.getByTestId('profile-avatar')).toBeInTheDocument();
  });

  test('スタイリングルールに準拠している', () => {
    const { container } = render(<ProfileSettings user={mockUser} />);
    
    const textElements = container.querySelectorAll('[class*="text-text-"]');
    const bgElements = container.querySelectorAll('[class*="bg-bg-"]');
    
    expect(textElements.length).toBeGreaterThan(0);
    expect(bgElements.length).toBeGreaterThan(0);
  });
});