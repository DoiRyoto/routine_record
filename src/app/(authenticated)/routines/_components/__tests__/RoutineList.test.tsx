import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import RoutineList from '../RoutineList';

const mockRoutines = [
  {
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
  },
  {
    id: '2',
    name: '英語学習',
    description: 'TOEIC対策',
    category: '学習',
    goalType: 'frequency_based' as const,
    targetCount: 3,
    targetPeriod: 'weekly' as const,
    recurrenceType: 'weekly' as const,
    recurrenceInterval: null,
    monthlyType: null,
    dayOfMonth: null,
    weekOfMonth: null,
    dayOfWeek: null,
    daysOfWeek: [1, 3, 5],
    startDate: '2025-01-01',
    isActive: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
    userId: 'user1',
  },
];

const mockUserSettings = {
  id: 'settings1',
  userId: 'user1',
  timezone: 'Asia/Tokyo',
  language: 'ja',
  theme: 'light',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  startDayOfWeek: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('RoutineList', () => {
  const mockProps = {
    routines: mockRoutines,
    userSettings: mockUserSettings,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onAdd: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TC-203-002: ルーチン表示テスト', () => {
    test('ルーチン一覧が正しく表示される', async () => {
      render(<RoutineList {...mockProps} />);
      
      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByText('朝の散歩')).toBeInTheDocument();
        expect(screen.getByText('英語学習')).toBeInTheDocument();
      });
    });

    test('アクティブなルーチンが正しく表示される', async () => {
      render(<RoutineList {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('朝の散歩')).toBeInTheDocument();
        expect(screen.getByText('アクティブ')).toBeInTheDocument();
      });
    });

    test('非アクティブなルーチンが正しく表示される', async () => {
      render(<RoutineList {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('英語学習')).toBeInTheDocument();
        expect(screen.getByText('非アクティブ')).toBeInTheDocument();
      });
    });

    test('ルーチンカテゴリが正しく表示される', async () => {
      render(<RoutineList {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('エクササイズ')).toBeInTheDocument();
        expect(screen.getByText('学習')).toBeInTheDocument();
      });
    });
  });

  describe('TC-203-005: CategoryFilter テスト', () => {
    test('フィルターボタンが正しく表示される', async () => {
      render(<RoutineList {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('すべて (2)')).toBeInTheDocument();
        expect(screen.getByText('アクティブ (1)')).toBeInTheDocument();
        expect(screen.getByText('非アクティブ (1)')).toBeInTheDocument();
        expect(screen.getByText('エクササイズ (1)')).toBeInTheDocument();
        expect(screen.getByText('学習 (1)')).toBeInTheDocument();
      });
    });

    test('アクティブフィルターが動作する', async () => {
      render(<RoutineList {...mockProps} />);
      
      await waitFor(() => {
        const activeFilter = screen.getByText('アクティブ (1)');
        fireEvent.click(activeFilter);
        
        expect(screen.getByText('朝の散歩')).toBeInTheDocument();
        expect(screen.queryByText('英語学習')).not.toBeInTheDocument();
      });
    });

    test('非アクティブフィルターが動作する', async () => {
      render(<RoutineList {...mockProps} />);
      
      await waitFor(() => {
        const inactiveFilter = screen.getByText('非アクティブ (1)');
        fireEvent.click(inactiveFilter);
        
        expect(screen.queryByText('朝の散歩')).not.toBeInTheDocument();
        expect(screen.getByText('英語学習')).toBeInTheDocument();
      });
    });

    test('カテゴリフィルターが動作する', async () => {
      render(<RoutineList {...mockProps} />);
      
      await waitFor(() => {
        const exerciseFilter = screen.getByText('エクササイズ (1)');
        fireEvent.click(exerciseFilter);
        
        expect(screen.getByText('朝の散歩')).toBeInTheDocument();
        expect(screen.queryByText('英語学習')).not.toBeInTheDocument();
      });
    });
  });

  describe('空状態テスト', () => {
    test('ルーチンが空の場合の表示', async () => {
      const emptyProps = { ...mockProps, routines: [] };
      render(<RoutineList {...emptyProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('ミッションがありません')).toBeInTheDocument();
      });
    });
  });

  describe('CRUD操作テスト', () => {
    test('新規作成ボタンが表示される', async () => {
      render(<RoutineList {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('+ 新しいミッション')).toBeInTheDocument();
      });
    });

    test('新規作成ボタンクリックでモーダルが開く', async () => {
      render(<RoutineList {...mockProps} />);
      
      await waitFor(() => {
        const addButton = screen.getByText('+ 新しいミッション');
        fireEvent.click(addButton);
        
        expect(screen.getByText('新しいミッション')).toBeInTheDocument();
      });
    });

    test('編集ボタンクリックで編集モーダルが開く', async () => {
      render(<RoutineList {...mockProps} />);
      
      await waitFor(() => {
        const editButtons = screen.getAllByText('編集');
        fireEvent.click(editButtons[0]);
        
        expect(screen.getByText('ミッション編集')).toBeInTheDocument();
      });
    });

    test('削除ボタンクリックでonDeleteが呼ばれる', async () => {
      render(<RoutineList {...mockProps} />);
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByText('削除');
        fireEvent.click(deleteButtons[0]);
        
        expect(mockProps.onDelete).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Mount State Management', () => {
    test('コンポーネントが正しくマウントされる', async () => {
      // This tests the isMounted state behavior
      render(<RoutineList {...mockProps} />);
      
      // Component should mount and show content immediately in test environment
      await waitFor(() => {
        expect(screen.getByText('ミッション管理')).toBeInTheDocument();
      });
    });
  });

  describe('UI Elements', () => {
    test('ページタイトルが正しく表示される', async () => {
      render(<RoutineList {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('ミッション管理')).toBeInTheDocument();
      });
    });

    test('ルーチンカードのレイアウトが正しい', async () => {
      render(<RoutineList {...mockProps} />);
      
      await waitFor(() => {
        const routineCards = screen.getAllByText('朝の散歩')[0].closest('.p-6');
        expect(routineCards).toHaveClass('p-6', 'rounded-lg', 'border');
      });
    });
  });
});