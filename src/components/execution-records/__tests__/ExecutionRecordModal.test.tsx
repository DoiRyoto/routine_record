import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ExecutionRecordModal } from '../ExecutionRecordModal';

// Mock data
const mockRoutines = [
  {
    id: 'routine-1',
    name: '朝の運動',
    categoryId: 'category-1',
    isActive: true,
    goalType: 'schedule_based' as const,
    recurrenceType: 'daily' as const,
  },
  {
    id: 'routine-2', 
    name: '読書',
    categoryId: 'category-2',
    isActive: true,
    goalType: 'frequency_based' as const,
    targetPeriod: 'weekly' as const,
    targetCount: 3,
  },
];

describe('ExecutionRecordModal - Display Control', () => {
  const user = userEvent.setup();

  test('should not render when isOpen is false', () => {
    render(
      <ExecutionRecordModal 
        isOpen={false} 
        onClose={jest.fn()} 
        routines={[]} 
      />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should render when isOpen is true', () => {
    render(
      <ExecutionRecordModal 
        isOpen={true} 
        onClose={jest.fn()} 
        routines={mockRoutines} 
      />
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('実行記録')).toBeInTheDocument();
  });

  test('should close modal when close button is clicked', async () => {
    const mockOnClose = jest.fn();
    render(
      <ExecutionRecordModal 
        isOpen={true} 
        onClose={mockOnClose} 
        routines={mockRoutines} 
      />
    );
    
    const closeButton = screen.getByRole('button', { name: /閉じる|close/i });
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should close modal when Escape key is pressed', async () => {
    const mockOnClose = jest.fn();
    render(
      <ExecutionRecordModal 
        isOpen={true} 
        onClose={mockOnClose} 
        routines={mockRoutines} 
      />
    );
    
    await user.keyboard('{Escape}');
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});

describe('ExecutionRecordModal - Accessibility', () => {
  const user = userEvent.setup();

  test('should trap focus within modal when open', async () => {
    render(
      <ExecutionRecordModal 
        isOpen={true} 
        onClose={jest.fn()} 
        routines={mockRoutines} 
      />
    );
    
    const firstInput = screen.getByLabelText(/ルーチン選択/i);
    const closeButton = screen.getByRole('button', { name: /閉じる/i });
    
    // 最初の要素にフォーカスされることを確認
    expect(firstInput).toHaveFocus();
    
    // Tab で次の要素（閉じるボタン）へ
    await user.tab();
    expect(closeButton).toHaveFocus();
    
    // さらに Tab で最初の要素に戻る
    await user.tab();
    expect(firstInput).toHaveFocus();
  });

  test('should have proper ARIA attributes', () => {
    render(
      <ExecutionRecordModal 
        isOpen={true} 
        onClose={jest.fn()} 
        routines={mockRoutines} 
      />
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});