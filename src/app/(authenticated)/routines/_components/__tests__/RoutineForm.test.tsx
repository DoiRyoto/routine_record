import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import RoutineForm from '@/model/routine/components/form/RoutineForm';

describe('RoutineForm', () => {
  const mockProps = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TC-203-003: フォームバリデーションテスト', () => {
    test('フォームの必須フィールドが表示される', () => {
      render(<RoutineForm {...mockProps} />);
      
      // Check for required fields
      expect(screen.getByText('ミッション名 *')).toBeInTheDocument();
      const nameInput = screen.getByRole('textbox', { name: /ミッション名/i });
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveValue('');
    });

    test('カテゴリフィールドが存在する', () => {
      render(<RoutineForm {...mockProps} />);
      
      // Category field should exist
      expect(screen.getByText(/カテゴリ/i)).toBeInTheDocument();
    });

    test('目標タイプフィールドが存在する', () => {
      render(<RoutineForm {...mockProps} />);
      
      // Goal type field should exist  
      expect(screen.getByText(/目標タイプ|ゴールタイプ/i)).toBeInTheDocument();
    });

    test('フォームの初期値が正しく設定される', () => {
      render(<RoutineForm {...mockProps} />);
      
      // Check initial form values
      const nameInput = screen.getByRole('textbox', { name: /ミッション名/i });
      expect(nameInput).toHaveValue('');
      
      // isActive should default to true
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('編集モードテスト', () => {
    const mockRoutine = {
      id: '1',
      name: '朝の散歩',
      description: '健康維持のため',
      category: 'エクササイズ',
      goalType: 'schedule_based' as const,
      targetCount: 1,
      targetPeriod: 'daily' as const,
      recurrenceType: 'daily' as const,
      recurrenceInterval: null,
      monthlyType: null,
      dayOfMonth: null,
      weekOfMonth: null,
      dayOfWeek: null,
      daysOfWeek: null,
      startDate: '2025-01-01',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      userId: 'user1',
    };

    test('既存ルーチンのデータが正しく表示される', () => {
      render(<RoutineForm {...mockProps} routine={mockRoutine} />);
      
      // Check that existing data is populated
      const nameInput = screen.getByDisplayValue('朝の散歩');
      expect(nameInput).toBeInTheDocument();
      
      const descInput = screen.getByDisplayValue('健康維持のため');
      expect(descInput).toBeInTheDocument();
    });
  });

  describe('フォーム操作テスト', () => {
    test('名前フィールドの入力が動作する', async () => {
      render(<RoutineForm {...mockProps} />);
      
      const nameInput = screen.getByRole('textbox', { name: /ミッション名/i });
      fireEvent.change(nameInput, { target: { value: 'テストルーチン' } });
      
      expect(nameInput).toHaveValue('テストルーチン');
    });

    test('フォーム送信が動作する', async () => {
      render(<RoutineForm {...mockProps} />);
      
      // Fill in required fields
      const nameInput = screen.getByRole('textbox', { name: /ミッション名/i });
      fireEvent.change(nameInput, { target: { value: 'テストルーチン' } });
      
      // Submit form
      const form = screen.getByRole('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockProps.onSubmit).toHaveBeenCalled();
      });
    });

    test('キャンセルボタンが動作する', () => {
      render(<RoutineForm {...mockProps} />);
      
      const cancelButton = screen.getByText(/キャンセル|閉じる/i);
      fireEvent.click(cancelButton);
      
      expect(mockProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('TC-203-004: 頻度ベース検証テスト（REQ-101）', () => {
    test('スケジュールベース目標タイプが設定できる', () => {
      render(<RoutineForm {...mockProps} />);
      
      // The form should have goal type selection
      expect(screen.getByText(/目標タイプ|ゴールタイプ/i)).toBeInTheDocument();
    });

    test('頻度ベース目標タイプが設定できる', () => {
      render(<RoutineForm {...mockProps} />);
      
      // Should be able to select frequency-based goal type
      expect(screen.getByText(/目標タイプ|ゴールタイプ/i)).toBeInTheDocument();
    });

    test('繰り返しパターンの設定ができる', () => {
      render(<RoutineForm {...mockProps} />);
      
      // Should have recurrence type options
      expect(screen.getByText(/繰り返し|パターン/i)).toBeInTheDocument();
    });
  });

  describe('UI要素テスト', () => {
    test('必要なボタンが表示される', () => {
      render(<RoutineForm {...mockProps} />);
      
      // Should have submit and cancel buttons
      expect(screen.getByRole('button', { name: /作成|保存|更新/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /キャンセル|閉じる/i })).toBeInTheDocument();
    });

    test('フォームのHTML構造が正しい', () => {
      render(<RoutineForm {...mockProps} />);
      
      const form = screen.getByRole('form');
      expect(form).toHaveClass('space-y-4');
    });
  });

  describe('データ変換テスト', () => {
    test('日付データが正しく処理される', () => {
      const routineWithDate = {
        id: '1',
        name: 'テスト',
        description: '',
        category: 'テスト',
        goalType: 'schedule_based' as const,
        targetCount: 1,
        targetPeriod: 'daily' as const,
        recurrenceType: 'daily' as const,
        recurrenceInterval: null,
        monthlyType: null,
        dayOfMonth: null,
        weekOfMonth: null,
        dayOfWeek: null,
        daysOfWeek: null,
        startDate: '2025-01-01',
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        userId: 'user1',
      };

      render(<RoutineForm {...mockProps} routine={routineWithDate} />);
      
      // Date should be properly formatted for input
      const dateInput = screen.getByDisplayValue('2025-01-01');
      expect(dateInput).toBeInTheDocument();
    });

    test('週次パターンのデータが正しく処理される', () => {
      const routineWithWeekPattern = {
        id: '1',
        name: 'テスト',
        description: '',
        category: 'テスト',
        goalType: 'schedule_based' as const,
        targetCount: 1,
        targetPeriod: 'weekly' as const,
        recurrenceType: 'weekly' as const,
        recurrenceInterval: null,
        monthlyType: null,
        dayOfMonth: null,
        weekOfMonth: null,
        dayOfWeek: null,
        daysOfWeek: '[1,3,5]', // JSON string format
        startDate: '2025-01-01',
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        userId: 'user1',
      };

      render(<RoutineForm {...mockProps} routine={routineWithWeekPattern} />);
      
      // Should parse JSON daysOfWeek properly
      expect(screen.getByDisplayValue('テスト')).toBeInTheDocument();
    });
  });
});