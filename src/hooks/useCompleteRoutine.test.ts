import { renderHook, act } from '@testing-library/react';

import { useCompleteRoutine } from './useCompleteRoutine';

// モックの設定
global.fetch = jest.fn();

describe('useCompleteRoutine', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('ルーチン完了処理が正常に実行される', async () => {
    // このテストは失敗する（useCompleteRoutine フックが未実装のため）
    
    // Given: API レスポンスのモック
    const mockResponse = { success: true, xpGained: 50, newLevel: 6 };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });
    
    // When: フックを使用
    const { result } = renderHook(() => useCompleteRoutine());
    
    let completeResult: any;
    await act(async () => {
      completeResult = await result.current.completeRoutine('routine1');
    });
    
    // Then: 正しいレスポンスが返される（失敗するべき）
    expect(completeResult).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith('/api/execution-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routineId: 'routine1' })
    });
  });

  it('初期状態では処理中でない', () => {
    // このテストは失敗する（useCompleteRoutine フックが未実装のため）
    
    // When: フックを使用
    const { result } = renderHook(() => useCompleteRoutine());
    
    // Then: 初期状態は処理中でない（失敗するべき）
    expect(result.current.isCompleting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('完了処理中は isCompleting が true になる', async () => {
    // このテストは失敗する（isCompleting 状態が未実装のため）
    
    // Given: 遅延するAPI レスポンス
    (fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        }), 100)
      )
    );
    
    const { result } = renderHook(() => useCompleteRoutine());
    
    // When: 完了処理を開始
    act(() => {
      result.current.completeRoutine('routine1');
    });
    
    // Then: 処理中フラグが true になる（失敗するべき）
    expect(result.current.isCompleting).toBe(true);
  });

  it('エラー時に例外をスローする', async () => {
    // このテストは失敗する（エラーハンドリングが未実装のため）
    
    // Given: API エラーのモック
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'ルーチンが見つかりません' })
    });
    
    // When: フックを使用
    const { result } = renderHook(() => useCompleteRoutine());
    
    // Then: エラーがスローされる（失敗するべき）
    await act(async () => {
      await expect(result.current.completeRoutine('invalid-routine'))
        .rejects.toThrow('ルーチンが見つかりません');
    });
  });

  it('ネットワークエラー時に適切なエラーメッセージをスローする', async () => {
    // このテストは失敗する（ネットワークエラーハンドリングが未実装のため）
    
    // Given: ネットワークエラーのモック
    (fetch as jest.Mock).mockRejectedValue(new Error('Network Error'));
    
    // When: フックを使用
    const { result } = renderHook(() => useCompleteRoutine());
    
    // Then: ネットワークエラーがスローされる（失敗するべき）
    await act(async () => {
      await expect(result.current.completeRoutine('routine1'))
        .rejects.toThrow('ネットワークエラーが発生しました');
    });
  });

  it('完了後にコールバック関数が呼ばれる', async () => {
    // このテストは失敗する（onComplete コールバック機能が未実装のため）
    
    // Given: API レスポンスとコールバック
    const mockResponse = { success: true, xpGained: 50 };
    const mockCallback = jest.fn();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });
    
    const { result } = renderHook(() => useCompleteRoutine({ onComplete: mockCallback }));
    
    // When: 完了処理を実行
    await act(async () => {
      await result.current.completeRoutine('routine1');
    });
    
    // Then: コールバックが呼ばれる（失敗するべき）
    expect(mockCallback).toHaveBeenCalledWith(mockResponse);
  });
});