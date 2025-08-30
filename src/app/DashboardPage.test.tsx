import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

import DashboardPage from './DashboardPage';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/gamification', () => ({
  ExperiencePoints: ({ xp }: { xp: number }) => <div data-testid="xp-display">{xp} XP</div>,
  LevelProgressBar: ({ level, progress }: { level: number; progress: number }) => (
    <div data-testid="level-progress">
      <span>Level {level}</span>
      <div role="progressbar" aria-valuenow={progress} data-testid="progress-bar" />
    </div>
  ),
  StreakDisplay: ({ streak }: { streak: number }) => <div data-testid="streak-display">{streak}日連続</div>,
  UserAvatar: () => <div data-testid="user-avatar">Avatar</div>,
  StatsCard: ({ children }: { children: React.ReactNode }) => <div data-testid="stats-card">{children}</div>
}));

jest.mock('./_components/Dashboard', () => {
  return function MockDashboard({ userProfile }: { userProfile?: any }) {
    if (!userProfile) return <div data-testid="dashboard-error">Profile not found</div>;
    return (
      <div data-testid="dashboard-content">
        <div data-testid="user-status-card">User Status</div>
        <div data-testid="today-progress-card">Today Progress</div>
        <div data-testid="quick-actions-section">
          <button data-testid="complete-routine-button">朝の運動を完了</button>
        </div>
        <div data-testid="recent-achievements">Recent Achievements</div>
        <div data-testid="game-notifications">Notifications</div>
      </div>
    );
  };
});

// テストデータヘルパー
const createMockUser = (overrides = {}) => ({
  id: 'user123',
  name: 'テストユーザー',
  level: 5,
  totalXp: 2500,
  currentLevelXp: 200,
  nextLevelXp: 500,
  avatarUrl: '/avatar.jpg',
  ...overrides,
});

const createMockRoutines = () => [
  {
    id: 'routine1',
    name: '朝の運動',
    description: '毎朝の運動習慣',
    category: '運動',
    isActive: true,
    completed: false,
    xpReward: 50,
  },
];

const createMockUserSettings = () => ({
  timezone: 'Asia/Tokyo',
  language: 'ja',
  notifications: true,
});

describe('DashboardPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    it('認証済みユーザーでダッシュボードが正常に表示される', () => {
      // Given: 認証済みユーザーとモックデータ
      const mockUser = createMockUser();
      const mockRoutines = createMockRoutines();
      const mockUserSettings = createMockUserSettings();
      
      // When: ダッシュボードページをレンダリング
      render(
        <DashboardPage 
          initialRoutines={mockRoutines}
          initialExecutionRecords={[]}
          userSettings={mockUserSettings}
          userProfile={mockUser}
        />
      );
      
      // Then: 基本要素が表示される
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
      expect(screen.getByTestId('user-status-card')).toBeInTheDocument();
      expect(screen.getByTestId('today-progress-card')).toBeInTheDocument();
      expect(screen.getByTestId('quick-actions-section')).toBeInTheDocument();
    });

    it('ユーザープロフィールがない場合にエラーメッセージが表示される', () => {
      // Given: プロフィールなしの状態
      const mockRoutines = createMockRoutines();
      const mockUserSettings = createMockUserSettings();
      
      // When: ダッシュボードページをレンダリング（userProfile=undefined）
      render(
        <DashboardPage 
          initialRoutines={mockRoutines}
          initialExecutionRecords={[]}
          userSettings={mockUserSettings}
          userProfile={undefined}
        />
      );
      
      // Then: エラーメッセージが表示される
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      expect(screen.getByText('ユーザープロフィールを読み込めませんでした')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '再読み込み' })).toBeInTheDocument();
    });

    it('ローディング中はスケルトンUIが表示される', () => {
      // このテストは現在の実装では失敗する（スケルトンUIが未実装のため）
      const mockUser = createMockUser();
      
      // Given: ローディング状態（現在の実装には存在しない）
      render(
        <DashboardPage 
          initialRoutines={[]}
          initialExecutionRecords={[]}
          userSettings={createMockUserSettings()}
          userProfile={mockUser}
          isLoading={true} // この props は実装されていない
        />
      );
      
      // Then: スケルトンUIが表示される（失敗するべき）
      expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
    });
  });

  describe('データ表示', () => {
    it('ユーザーステータスカードが正しく表示される', () => {
      // このテストは現在の実装では失敗する（詳細なユーザー情報表示が未実装のため）
      const mockUser = createMockUser({
        name: 'テストユーザー',
        level: 8,
        totalXp: 4200,
      });
      
      render(
        <DashboardPage 
          initialRoutines={[]}
          initialExecutionRecords={[]}
          userSettings={createMockUserSettings()}
          userProfile={mockUser}
        />
      );
      
      // Then: ユーザー情報が正しく表示される（失敗するべき）
      expect(screen.getByText('レベル 8')).toBeInTheDocument();
      expect(screen.getByText('4,200 XP')).toBeInTheDocument();
      expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    });

    it('本日の進捗が正しく表示される', () => {
      // このテストは現在の実装では失敗する（進捗情報の詳細表示が未実装のため）
      const mockUser = createMockUser();
      
      render(
        <DashboardPage 
          initialRoutines={createMockRoutines()}
          initialExecutionRecords={[]}
          userSettings={createMockUserSettings()}
          userProfile={mockUser}
        />
      );
      
      // Then: 進捗情報が正しく表示される（失敗するべき）
      expect(screen.getByText('3 / 5 完了')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('150 XP 獲得')).toBeInTheDocument();
      expect(screen.getByText('7日連続')).toBeInTheDocument();
    });

    it('最近の実績（バッジ・ミッション）が表示される', () => {
      // このテストは現在の実装では失敗する（実績表示が未実装のため）
      const mockUser = createMockUser();
      
      render(
        <DashboardPage 
          initialRoutines={[]}
          initialExecutionRecords={[]}
          userSettings={createMockUserSettings()}
          userProfile={mockUser}
        />
      );
      
      // Then: 実績が表示される（失敗するべき）
      expect(screen.getByText('3日連続達成')).toBeInTheDocument();
      expect(screen.getByText('早起き習慣')).toBeInTheDocument();
      expect(screen.getByText('週5回運動')).toBeInTheDocument();
    });
  });

  describe('インタラクション', () => {
    it('ルーチン完了ボタンをクリックしてXP獲得ができる', async () => {
      // このテストは現在の実装では失敗する（XP獲得通知が未実装のため）
      const user = userEvent.setup();
      const mockUser = createMockUser();
      
      render(
        <DashboardPage 
          initialRoutines={createMockRoutines()}
          initialExecutionRecords={[]}
          userSettings={createMockUserSettings()}
          userProfile={mockUser}
        />
      );
      
      // When: ルーチン完了ボタンをクリック
      const completeButton = screen.getByTestId('complete-routine-button');
      await user.click(completeButton);
      
      // Then: XP獲得通知が表示される（失敗するべき）
      await waitFor(() => {
        expect(screen.getByText('50 XP獲得！')).toBeInTheDocument();
      });
    });

    it('新しいルーチン作成リンクが機能する', () => {
      // このテストは現在の実装では失敗する（作成リンクが未実装のため）
      const mockUser = createMockUser();
      
      render(
        <DashboardPage 
          initialRoutines={[]}
          initialExecutionRecords={[]}
          userSettings={createMockUserSettings()}
          userProfile={mockUser}
        />
      );
      
      // Then: 新しいルーチン作成リンクが存在する（失敗するべき）
      const createLink = screen.getByRole('link', { name: '新しいルーチンを作成' });
      expect(createLink).toHaveAttribute('href', '/routines/create');
    });

    it('ナビゲーションリンクが正常に動作する', () => {
      // このテストは現在の実装では失敗する（ナビゲーションが未実装のため）
      const mockUser = createMockUser();
      
      render(
        <DashboardPage 
          initialRoutines={[]}
          initialExecutionRecords={[]}
          userSettings={createMockUserSettings()}
          userProfile={mockUser}
        />
      );
      
      // Then: ナビゲーションリンクが存在し、正しいhrefを持つ（失敗するべき）
      expect(screen.getByRole('link', { name: 'ルーチン管理' })).toHaveAttribute('href', '/routines');
      expect(screen.getByRole('link', { name: '統計' })).toHaveAttribute('href', '/statistics');
      expect(screen.getByRole('link', { name: '設定' })).toHaveAttribute('href', '/settings');
    });
  });

  describe('エラーハンドリング', () => {
    it('API エラー時に適切なエラーメッセージが表示される', () => {
      // このテストは現在の実装では失敗する（APIエラーハンドリングが未実装のため）
      const mockUser = createMockUser();
      
      // APIエラーをシミュレート
      jest.spyOn(console, 'error').mockImplementation(() => {}); // エラーログを抑制
      
      render(
        <DashboardPage 
          initialRoutines={[]}
          initialExecutionRecords={[]}
          userSettings={createMockUserSettings()}
          userProfile={mockUser}
          apiError="サーバーエラーが発生しました" // この props は実装されていない
        />
      );
      
      // Then: エラーメッセージが表示される（失敗するべき）
      expect(screen.getByText('サーバーエラーが発生しました')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '再試行' })).toBeInTheDocument();
    });

    it('ネットワークエラー時にリトライ機能が動作する', async () => {
      // このテストは現在の実装では失敗する（リトライ機能が未実装のため）
      const user = userEvent.setup();
      const mockRetry = jest.fn();
      const mockUser = createMockUser();
      
      render(
        <DashboardPage 
          initialRoutines={[]}
          initialExecutionRecords={[]}
          userSettings={createMockUserSettings()}
          userProfile={mockUser}
          networkError="ネットワークエラー" // この props は実装されていない
          onRetry={mockRetry} // この props は実装されていない
        />
      );
      
      // When: 再試行ボタンをクリック
      const retryButton = screen.getByRole('button', { name: '再試行' });
      await user.click(retryButton);
      
      // Then: 再試行処理が呼ばれる（失敗するべき）
      expect(mockRetry).toHaveBeenCalled();
    });
  });
});