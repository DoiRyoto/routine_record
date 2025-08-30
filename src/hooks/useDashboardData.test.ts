import { renderHook, waitFor, act } from '@testing-library/react';

import { useDashboardData } from './useDashboardData';

// モックの設定
global.fetch = jest.fn();

// モックデータ
const mockApiResponses = {
  userProfile: { 
    id: 'user123',
    name: 'テストユーザー',
    level: 5, 
    totalXp: 2500,
    currentLevelXp: 200,
    nextLevelXp: 500,
  },
  todayRoutines: [
    { id: '1', name: '運動', completed: false, xpReward: 50 }
  ],
  statistics: { 
    completionRate: 75, 
    currentStreak: 5,
    todayXp: 100,
    completedRoutines: 3,
    totalRoutines: 5,
  },
  notifications: [
    { id: '1', message: 'レベルアップ！', type: 'levelup' }
  ],
  achievements: {
    recentBadges: [
      { id: 'badge1', name: '3日連続達成', iconUrl: '/badge1.png' }
    ],
    activeMissions: [
      { id: 'mission1', title: '週5回運動', progress: 3, target: 5 }
    ]
  }
};

describe('useDashboardData', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('ダッシュボードデータを正しくフェッチする', async () => {
    // このテストは失敗する（useDashboardData フックが未実装のため）
    
    // Given: API レスポンスのモック
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockApiResponses.userProfile })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockApiResponses.todayRoutines })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockApiResponses.statistics })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockApiResponses.notifications })
      });
    
    // When: フックを使用
    const { result } = renderHook(() => useDashboardData());
    
    // Then: 正しいデータが返される（失敗するべき）
    await waitFor(() => {
      expect(result.current.data).toEqual({
        user: mockApiResponses.userProfile,
        todayRoutines: mockApiResponses.todayRoutines,
        statistics: mockApiResponses.statistics,
        notifications: mockApiResponses.notifications,
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('初期状態ではローディング中である', () => {
    // このテストは失敗する（useDashboardData フックが未実装のため）
    
    // When: フックを使用
    const { result } = renderHook(() => useDashboardData());
    
    // Then: 初期状態はローディング中（失敗するべき）
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('API エラー時にエラー状態を返す', async () => {
    // このテストは失敗する（useDashboardData フックが未実装のため）
    
    // Given: API エラーのモック
    (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    // When: フックを使用
    const { result } = renderHook(() => useDashboardData());
    
    // Then: エラー状態が返される（失敗するべき）
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeNull();
    });
  });

  it('ルーチン完了後にデータを再フェッチする', async () => {
    // このテストは失敗する（completeRoutine 機能が未実装のため）
    
    // Given: 初期データ
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockApiResponses })
    });
    
    const { result } = renderHook(() => useDashboardData());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // When: ルーチン完了を実行
    act(() => {
      result.current.completeRoutine('routine1'); // この機能は未実装
    });
    
    // Then: データが再フェッチされる（失敗するべき）
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeTruthy();
    });
  });

  it('リトライ機能が正常に動作する', async () => {
    // このテストは失敗する（retry 機能が未実装のため）
    
    // Given: 初期エラー状態
    (fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockApiResponses })
      });
    
    const { result } = renderHook(() => useDashboardData());
    
    await waitFor(() => expect(result.current.error).toBeTruthy());
    
    // When: リトライを実行
    act(() => {
      result.current.retry(); // この機能は未実装
    });
    
    // Then: データが正常に取得される（失敗するべき）
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeTruthy();
    });
  });
});