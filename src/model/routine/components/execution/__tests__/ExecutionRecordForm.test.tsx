import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ExecutionRecordForm } from '../ExecutionRecordForm';

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

describe('ExecutionRecordForm - Validation', () => {
  const user = userEvent.setup();

  test('should require routine selection', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ExecutionRecordForm 
        onSubmit={mockOnSubmit}
        routines={mockRoutines}
      />
    );
    
    const submitButton = screen.getByRole('button', { name: /保存|送信/i });
    await user.click(submitButton);
    
    expect(screen.getByText('ルーチンを選択してください')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should require valid execution date', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ExecutionRecordForm 
        onSubmit={mockOnSubmit}
        routines={mockRoutines}
      />
    );
    
    const dateInput = screen.getByLabelText(/実行日時/i);
    await user.clear(dateInput);
    await user.type(dateInput, 'invalid-date');
    
    const submitButton = screen.getByRole('button', { name: /保存|送信/i });
    await user.click(submitButton);
    
    expect(screen.getByText('有効な日時を入力してください')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should validate duration range (0-1440 minutes)', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ExecutionRecordForm 
        onSubmit={mockOnSubmit}
        routines={mockRoutines}
      />
    );
    
    const routineSelect = screen.getByLabelText(/ルーチン選択/i);
    await user.selectOptions(routineSelect, mockRoutines[0].id);
    
    const durationInput = screen.getByLabelText(/実行時間/i);
    const submitButton = screen.getByRole('button', { name: /保存|送信/i });
    
    // Test negative duration
    await user.clear(durationInput);
    await user.type(durationInput, '-10');
    await user.click(submitButton);
    
    expect(screen.getByText('実行時間は0分以上で入力してください')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
    
    // Clear error and test over 1440 minutes  
    await user.clear(durationInput);
    await user.type(durationInput, '1500');
    await user.click(submitButton);
    
    expect(screen.getByText('実行時間は1440分以内で入力してください')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should validate memo length (max 500 characters)', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ExecutionRecordForm 
        onSubmit={mockOnSubmit}
        routines={mockRoutines}
      />
    );
    
    const routineSelect = screen.getByLabelText(/ルーチン選択/i);
    await user.selectOptions(routineSelect, mockRoutines[0].id);
    
    const memoInput = screen.getByLabelText(/メモ/i);
    const longText = 'a'.repeat(501);
    await user.clear(memoInput);
    await user.type(memoInput, longText);
    
    expect(screen.getByText('メモは500文字以内で入力してください')).toBeInTheDocument();
  });
});

describe('ExecutionRecordForm - Submission', () => {
  const user = userEvent.setup();

  test('should submit valid form data', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <ExecutionRecordForm 
        onSubmit={mockOnSubmit}
        routines={mockRoutines}
      />
    );
    
    // Fill form with valid data
    const routineSelect = screen.getByLabelText(/ルーチン選択/i);
    await user.selectOptions(routineSelect, mockRoutines[0].id);
    
    const dateInput = screen.getByLabelText(/実行日時/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2024-12-01T10:00');
    
    const durationInput = screen.getByLabelText(/実行時間/i);
    await user.type(durationInput, '30');
    
    const memoInput = screen.getByLabelText(/メモ/i);
    await user.type(memoInput, 'テストメモ');
    
    const completedCheckbox = screen.getByLabelText(/完了/i);
    await user.click(completedCheckbox);
    
    const submitButton = screen.getByRole('button', { name: /保存|送信/i });
    await user.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      routineId: mockRoutines[0].id,
      executedAt: new Date('2024-12-01T10:00'),
      value: 30,
      notes: 'テストメモ',
      isCompleted: true,
    });
  });

  test('should disable submit button during submission', async () => {
    const mockOnSubmit = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );
    
    render(
      <ExecutionRecordForm 
        onSubmit={mockOnSubmit}
        routines={mockRoutines}
      />
    );
    
    // Fill required fields
    const routineSelect = screen.getByLabelText(/ルーチン選択/i);
    await user.selectOptions(routineSelect, mockRoutines[0].id);
    
    const submitButton = screen.getByRole('button', { name: /保存|送信/i });
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/送信中|保存中/i)).toBeInTheDocument();
  });
});