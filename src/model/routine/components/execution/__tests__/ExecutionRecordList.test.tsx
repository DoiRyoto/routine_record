import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ExecutionRecordList } from '../ExecutionRecordList';

const mockRoutines = [
  {
    id: 'routine-1',
    name: '朝の運動',
    categoryId: 'category-1',
    isActive: true,
  },
  {
    id: 'routine-2', 
    name: '読書',
    categoryId: 'category-2',
    isActive: true,
  },
];

const mockExecutionRecords = [
  {
    id: 'record-1',
    userId: 'user-1',
    routineId: 'routine-1',
    executedAt: new Date('2024-12-01T10:00:00Z'),
    value: 30,
    notes: '今日は調子が良かった',
    isCompleted: true,
    xpEarned: 50,
    createdAt: new Date('2024-12-01T10:00:00Z'),
    updatedAt: new Date('2024-12-01T10:00:00Z'),
  },
  {
    id: 'record-2',
    userId: 'user-1',
    routineId: 'routine-2',
    executedAt: new Date('2024-12-02T20:00:00Z'),
    value: 45,
    notes: '良い本に出会えた',
    isCompleted: true,
    xpEarned: 75,
    createdAt: new Date('2024-12-02T20:00:00Z'),
    updatedAt: new Date('2024-12-02T20:00:00Z'),
  },
];

describe('ExecutionRecordList - Display', () => {
  test('should render execution records list', () => {
    render(
      <ExecutionRecordList 
        records={mockExecutionRecords}
        routines={mockRoutines}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    mockExecutionRecords.forEach(record => {
      const routine = mockRoutines.find(r => r.id === record.routineId);
      expect(screen.getByText(routine?.name || '')).toBeInTheDocument();
    });
  });

  test('should show empty state when no records', () => {
    render(
      <ExecutionRecordList 
        records={[]}
        routines={mockRoutines}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    expect(screen.getByText(/実行記録がありません/i)).toBeInTheDocument();
    expect(screen.getByText(/最初の記録を作成/i)).toBeInTheDocument();
  });

  test('should sort records by execution date (newest first)', () => {
    const unsortedRecords = [
      { ...mockExecutionRecords[0], id: 'record-a', executedAt: new Date('2024-12-01') },
      { ...mockExecutionRecords[1], id: 'record-b', executedAt: new Date('2024-12-03') },
      { ...mockExecutionRecords[1], id: 'record-c', executedAt: new Date('2024-12-02') },
    ];
    
    render(
      <ExecutionRecordList 
        records={unsortedRecords}
        routines={mockRoutines}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    const recordItems = screen.getAllByTestId('execution-record-item');
    expect(recordItems[0]).toHaveTextContent('2024-12-03');
    expect(recordItems[1]).toHaveTextContent('2024-12-02');
    expect(recordItems[2]).toHaveTextContent('2024-12-01');
  });

  test('should display XP earned for each record', () => {
    render(
      <ExecutionRecordList 
        records={mockExecutionRecords}
        routines={mockRoutines}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    expect(screen.getByText('50 XP')).toBeInTheDocument();
    expect(screen.getByText('75 XP')).toBeInTheDocument();
  });
});

describe('ExecutionRecordList - Actions', () => {
  const user = userEvent.setup();

  test('should call onEdit when edit button is clicked', async () => {
    const mockOnEdit = jest.fn();
    render(
      <ExecutionRecordList 
        records={mockExecutionRecords}
        routines={mockRoutines}
        onEdit={mockOnEdit}
        onDelete={jest.fn()}
      />
    );
    
    const editButton = screen.getAllByText(/編集/i)[0];
    await user.click(editButton);
    
    // レコードはソートされているので、最新のレコード（record-2）が最初に来る
    expect(mockOnEdit).toHaveBeenCalledWith(mockExecutionRecords[1]);
  });

  test('should call onDelete when delete button is clicked', async () => {
    const mockOnDelete = jest.fn();
    render(
      <ExecutionRecordList 
        records={mockExecutionRecords}
        routines={mockRoutines}
        onEdit={jest.fn()}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = screen.getAllByText(/削除/i)[0];
    await user.click(deleteButton);
    
    // 削除確認ダイアログが表示されることを確認
    expect(screen.getByText(/削除しますか/i)).toBeInTheDocument();
  });

  test('should show confirmation dialog before delete', async () => {
    const mockOnDelete = jest.fn();
    render(
      <ExecutionRecordList 
        records={mockExecutionRecords}
        routines={mockRoutines}
        onEdit={jest.fn()}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = screen.getAllByText(/削除/i)[0];
    await user.click(deleteButton);
    
    expect(screen.getByText(/削除しますか/i)).toBeInTheDocument();
    
    const confirmButton = screen.getByText(/削除する/i);
    await user.click(confirmButton);
    
    // ソート順により最初に表示されるのは最新レコード（record-2）
    expect(mockOnDelete).toHaveBeenCalledWith(mockExecutionRecords[1].id);
  });
});

describe('ExecutionRecordList - Filters', () => {
  const user = userEvent.setup();

  test('should filter records by routine', async () => {
    render(
      <ExecutionRecordList 
        records={mockExecutionRecords}
        routines={mockRoutines}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    // フィルターを開く
    const filterButton = screen.getByRole('button', { name: /フィルター/i });
    await user.click(filterButton);
    
    // ルーチンフィルターを選択
    const routineFilter = screen.getByLabelText(/ルーチンで絞り込み/i);
    await user.selectOptions(routineFilter, 'routine-1');
    
    const applyButton = screen.getByRole('button', { name: /適用/i });
    await user.click(applyButton);
    
    // routine-1の記録のみ表示される
    expect(screen.getByText('朝の運動')).toBeInTheDocument();
    expect(screen.queryByText('読書')).not.toBeInTheDocument();
  });

  test('should filter records by date range', async () => {
    render(
      <ExecutionRecordList 
        records={mockExecutionRecords}
        routines={mockRoutines}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    // フィルターを開く
    const filterButton = screen.getByRole('button', { name: /フィルター/i });
    await user.click(filterButton);
    
    // 日付範囲を設定
    const startDateInput = screen.getByLabelText(/開始日/i);
    await user.type(startDateInput, '2024-12-01');
    
    const endDateInput = screen.getByLabelText(/終了日/i);
    await user.type(endDateInput, '2024-12-01');
    
    const applyButton = screen.getByRole('button', { name: /適用/i });
    await user.click(applyButton);
    
    // 2024-12-01の記録のみ表示される
    expect(screen.getByText('朝の運動')).toBeInTheDocument();
    expect(screen.queryByText('読書')).not.toBeInTheDocument();
  });
});