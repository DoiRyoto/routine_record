# TASK-301: カスタムフック移行・分散 - テストケース定義

## テスト戦略

### 1. 移行テスト
フック移行作業の正当性とパス更新の検証

### 2. 機能テスト  
移行後のフック機能が正常動作することを検証

### 3. 統合テスト
フック間の依存関係と使用箇所での動作検証

### 4. パフォーマンステスト
移行後のフック性能維持確認

## 詳細テストケース

### A. 移行完了性テスト

#### A1. ファイル移行の完了性
```typescript
test('全カスタムフックが適切な場所に移行されている', () => {
  const expectedFiles = [
    'src/common/hooks/useTheme.ts',
    'src/model/routine/hooks/useCompleteRoutine.ts',
    'src/model/routine/hooks/useExecutionRecords.ts',
    'src/app/(authenticated)/dashboard/_hooks/useDashboardData.ts'
  ];
  
  expectedFiles.forEach(filePath => {
    expect(fs.existsSync(filePath)).toBe(true);
  });
});
```

#### A2. テストファイル移行の完了性
```typescript
test('全テストファイルが同構造で移行されている', () => {
  const expectedTestFiles = [
    'src/common/hooks/__tests__/useTheme.test.ts',
    'src/model/routine/hooks/__tests__/useCompleteRoutine.test.ts',
    'src/model/routine/hooks/__tests__/useExecutionRecords.test.ts',
    'src/app/(authenticated)/dashboard/_hooks/__tests__/useDashboardData.test.ts'
  ];
  
  expectedTestFiles.forEach(filePath => {
    expect(fs.existsSync(filePath)).toBe(true);
  });
});
```

### B. useTheme フック（Common層）テスト

#### B1. 基本機能テスト
```typescript
test('テーマ切り替えが正常動作する', () => {
  const { result } = renderHook(() => useTheme());
  
  expect(result.current.theme).toBeDefined();
  expect(typeof result.current.setTheme).toBe('function');
});

test('システム設定の同期が正常動作する', () => {
  const { result } = renderHook(() => useTheme());
  
  act(() => {
    result.current.setTheme('auto');
  });
  
  expect(result.current.theme).toBe('auto');
});
```

#### B2. ローカルストレージ連携テスト
```typescript
test('テーマ設定がローカルストレージに保存される', () => {
  const { result } = renderHook(() => useTheme());
  
  act(() => {
    result.current.setTheme('dark');
  });
  
  expect(localStorage.getItem('theme')).toBe('dark');
});
```

### C. useCompleteRoutine フック（Routine Model層）テスト

#### C1. ルーティン完了処理テスト
```typescript
test('ルーティン完了処理が正常に実行される', async () => {
  const mockResponse = { 
    success: true, 
    xpGained: 50, 
    newLevel: 6,
    streakCount: 3 
  };
  
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockResponse)
  });
  
  const { result } = renderHook(() => useCompleteRoutine());
  
  let completeResult: any;
  await act(async () => {
    completeResult = await result.current.completeRoutine('routine1');
  });
  
  expect(completeResult).toEqual(mockResponse);
  expect(result.current.isLoading).toBe(false);
});
```

#### C2. エラーハンドリングテスト
```typescript
test('API エラー時に適切なエラーハンドリングが行われる', async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));
  
  const { result } = renderHook(() => useCompleteRoutine());
  
  await act(async () => {
    await expect(result.current.completeRoutine('routine1')).rejects.toThrow('Network Error');
  });
  
  expect(result.current.isLoading).toBe(false);
  expect(result.current.error).toBeTruthy();
});
```

### D. useExecutionRecords フック（Routine Model層）テスト

#### D1. 実行記録取得テスト
```typescript
test('実行記録の取得が正常動作する', async () => {
  const mockExecutionRecords = [
    {
      id: 'record-1',
      userId: 'user-1',
      routineId: 'routine-1',
      executedAt: new Date('2024-12-01T10:00:00Z'),
      duration: 30,
      memo: '調子が良かった',
      isCompleted: true
    }
  ];
  
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockExecutionRecords)
  });
  
  const { result } = renderHook(() => useExecutionRecords('user-1'));
  
  await waitFor(() => {
    expect(result.current.executionRecords).toEqual(mockExecutionRecords);
  });
});
```

#### D2. 実行記録作成テスト
```typescript
test('実行記録の作成が正常動作する', async () => {
  const newRecord = {
    userId: 'user-1',
    routineId: 'routine-1',
    executedAt: new Date(),
    duration: 30,
    memo: '新しい記録',
    isCompleted: true
  };
  
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ id: 'new-record', ...newRecord })
  });
  
  const { result } = renderHook(() => useExecutionRecords('user-1'));
  
  await act(async () => {
    await result.current.createExecutionRecord(newRecord);
  });
  
  expect(fetch).toHaveBeenCalledWith('/api/execution-records', expect.objectContaining({
    method: 'POST',
    body: JSON.stringify(newRecord)
  }));
});
```

### E. useDashboardData フック（Dashboard App層）テスト

#### E1. ダッシュボードデータ統合テスト
```typescript
test('ダッシュボードデータの統合取得が正常動作する', async () => {
  const mockDashboardData = {
    user: { id: 'user-1', level: 5, xp: 2500 },
    todayProgress: { completedRoutines: 3, totalRoutines: 5 },
    achievements: [
      { id: 'achievement-1', title: '3日連続達成', unlockedAt: new Date() }
    ],
    notifications: []
  };
  
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockDashboardData)
  });
  
  const { result } = renderHook(() => useDashboardData('user-1'));
  
  await waitFor(() => {
    expect(result.current.dashboardData).toEqual(mockDashboardData);
    expect(result.current.isLoading).toBe(false);
  });
});
```

#### E2. リアルタイム更新テスト
```typescript
test('ダッシュボードデータのリアルタイム更新が正常動作する', async () => {
  const { result } = renderHook(() => useDashboardData('user-1'));
  
  await act(async () => {
    result.current.refreshData();
  });
  
  expect(fetch).toHaveBeenCalledTimes(2); // 初期取得 + refresh
});
```

### F. 移行後の統合テスト

#### F1. Import パス更新確認テスト
```typescript
test('移行されたフックが新しいパスでimportできる', async () => {
  // Dynamic import でテスト
  const useTheme = await import('@/common/hooks/useTheme');
  const useCompleteRoutine = await import('@/model/routine/hooks/useCompleteRoutine');
  const useExecutionRecords = await import('@/model/routine/hooks/useExecutionRecords');
  const useDashboardData = await import('@/app/(authenticated)/dashboard/_hooks/useDashboardData');
  
  expect(useTheme.useTheme).toBeDefined();
  expect(useCompleteRoutine.useCompleteRoutine).toBeDefined();
  expect(useExecutionRecords.useExecutionRecords).toBeDefined();
  expect(useDashboardData.useDashboardData).toBeDefined();
});
```

#### F2. アーキテクチャルール準拠テスト
```typescript
test('依存関係ルールに違反していない', () => {
  // Common層フックがModel/App層に依存していないことを確認
  const useThemeContent = fs.readFileSync('src/common/hooks/useTheme.ts', 'utf8');
  expect(useThemeContent).not.toMatch(/@\/model/);
  expect(useThemeContent).not.toMatch(/@\/app/);
  
  // Model層フックが他のModel層に依存していないことを確認
  const useCompleteRoutineContent = fs.readFileSync('src/model/routine/hooks/useCompleteRoutine.ts', 'utf8');
  expect(useCompleteRoutineContent).not.toMatch(/@\/model\/((?!routine).)+/);
});
```

### G. パフォーマンステスト

#### G1. フック実行性能テスト
```typescript
test('フック実行時間が許容範囲内である', async () => {
  const startTime = performance.now();
  const { result } = renderHook(() => useTheme());
  const endTime = performance.now();
  
  expect(endTime - startTime).toBeLessThan(50); // 50ms以下
});
```

#### G2. メモリリークテスト
```typescript
test('フックがメモリリークを引き起こさない', async () => {
  const { unmount } = renderHook(() => useDashboardData('user-1'));
  
  // メモリ使用量測定
  const memoryBefore = process.memoryUsage().heapUsed;
  unmount();
  
  // ガベージコレクション後の確認
  global.gc && global.gc();
  const memoryAfter = process.memoryUsage().heapUsed;
  
  expect(memoryAfter).toBeLessThanOrEqual(memoryBefore);
});
```

### H. エラーハンドリングテスト

#### H1. ネットワークエラー処理
```typescript
test('ネットワークエラー時に適切なエラー状態になる', async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));
  
  const { result } = renderHook(() => useExecutionRecords('user-1'));
  
  await waitFor(() => {
    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });
});
```

#### H2. 無効なデータ処理
```typescript
test('無効なレスポンスデータを適切に処理する', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(null)
  });
  
  const { result } = renderHook(() => useDashboardData('user-1'));
  
  await waitFor(() => {
    expect(result.current.dashboardData).toBeNull();
    expect(result.current.error).toBeFalsy();
  });
});
```

## テスト実行計画

### フェーズ1: 個別フックテスト
1. `useTheme` 単体テスト実行
2. `useCompleteRoutine` 単体テスト実行  
3. `useExecutionRecords` 単体テスト実行
4. `useDashboardData` 単体テスト実行

### フェーズ2: 統合テスト
1. フック間の相互作用テスト
2. コンポーネント統合テスト
3. アーキテクチャルール検証

### フェーズ3: パフォーマンステスト
1. フック実行時間測定
2. メモリ使用量確認
3. レンダリング最適化確認

## 品質基準

### 成功基準
- 全テストケースが pass する
- テストカバレッジが 90% 以上
- フック実行時間が移行前と同等以下
- メモリリークが発生しない
- アーキテクチャルール違反が0個

### 失敗基準
- テストが失敗する
- パフォーマンスが著しく劣化する
- メモリリークが発生する
- 循環依存が検出される
- アーキテクチャルール違反が存在する