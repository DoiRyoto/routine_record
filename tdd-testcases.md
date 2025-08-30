# TASK-203: ルーチン管理画面実装 - テストケース定義

## テストケース概要
- **対象タスク**: TASK-203 ルーチン管理画面実装
- **テスト対象**: ルーチン一覧表示、CRUD操作、頻度ベース検証、カテゴリ管理統合
- **テストフレームワーク**: Jest, React Testing Library, Playwright (E2E)

## 1. コンポーネントテスト (React Testing Library)

### 1.1 RoutinesPage コンポーネント

#### TC-203-001: 初期表示テスト
```typescript
describe('RoutinesPage - Initial Render', () => {
  test('認証済みユーザーのルーチン一覧を表示する', async () => {
    // Given: モックデータとしてルーチン一覧を準備
    const mockRoutines = [
      { id: 1, name: '朝の散歩', category: 'エクササイズ', frequency: 'daily', isActive: true },
      { id: 2, name: '英語学習', category: '学習', frequency: 'weekly', isActive: false }
    ];
    
    // When: ページをレンダリング
    render(<RoutinesPage />);
    
    // Then: ルーチン一覧が表示される
    expect(screen.getByText('朝の散歩')).toBeInTheDocument();
    expect(screen.getByText('英語学習')).toBeInTheDocument();
    expect(screen.getByText('ルーチン管理')).toBeInTheDocument();
  });

  test('ローディング状態を正しく表示する', () => {
    render(<RoutinesPage />);
    expect(screen.getByTestId('routines-skeleton')).toBeInTheDocument();
  });

  test('空状態を正しく表示する', async () => {
    mockAPI.getRoutines.mockResolvedValue([]);
    render(<RoutinesPage />);
    
    expect(screen.getByText('まだルーチンがありません')).toBeInTheDocument();
    expect(screen.getByText('最初のルーチンを作成')).toBeInTheDocument();
  });
});
```

#### TC-203-002: ルーチン表示テスト
```typescript
describe('RoutineCard Display', () => {
  test('アクティブなルーチンを正しく表示する', () => {
    const activeRoutine = {
      id: 1, name: '朝の散歩', category: 'エクササイズ', 
      frequency: 'daily', isActive: true
    };
    
    render(<RoutineCard routine={activeRoutine} />);
    
    expect(screen.getByTestId('routine-active-badge')).toBeInTheDocument();
    expect(screen.getByText('実行')).toBeInTheDocument();
  });

  test('非アクティブなルーチンを正しく表示する', () => {
    const inactiveRoutine = {
      id: 2, name: '英語学習', category: '学習', 
      frequency: 'weekly', isActive: false
    };
    
    render(<RoutineCard routine={inactiveRoutine} />);
    
    expect(screen.getByTestId('routine-inactive-badge')).toBeInTheDocument();
    expect(screen.queryByText('実行')).not.toBeInTheDocument();
    expect(screen.getByText('復元')).toBeInTheDocument();
  });
});
```

### 1.2 RoutineForm コンポーネント

#### TC-203-003: フォームバリデーションテスト
```typescript
describe('RoutineForm - Validation', () => {
  test('必須フィールドのバリデーションが動作する', async () => {
    render(<RoutineForm />);
    
    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('ルーチン名は必須です')).toBeInTheDocument();
      expect(screen.getByText('カテゴリを選択してください')).toBeInTheDocument();
    });
  });

  test('名前の文字数制限バリデーションが動作する', async () => {
    render(<RoutineForm />);
    
    const nameInput = screen.getByLabelText('ルーチン名');
    fireEvent.change(nameInput, { target: { value: 'あ'.repeat(101) } });
    fireEvent.blur(nameInput);
    
    await waitFor(() => {
      expect(screen.getByText('ルーチン名は100文字以内で入力してください')).toBeInTheDocument();
    });
  });
});
```

## コンポーネント単体テスト

### 1. Dashboard Page テスト

#### 1.1 基本レンダリングテスト

```typescript
describe('Dashboard Page', () => {
  it('認証済みユーザーでダッシュボードが正常に表示される', async () => {
    // Given: 認証済みユーザーとモックデータ
    const mockUser = createMockUser({ id: 'user123', level: 5, totalXp: 2500 });
    const mockDashboardData = createMockDashboardData();
    
    // When: ダッシュボードページをレンダリング
    render(<Dashboard />, { 
      wrapper: ({ children }) => (
        <AuthProvider user={mockUser}>
          <MockApiProvider data={mockDashboardData}>
            {children}
          </MockApiProvider>
        </AuthProvider>
      )
    });
    
    // Then: 基本要素が表示される
    expect(screen.getByRole('heading', { name: 'ダッシュボード' })).toBeInTheDocument();
    expect(screen.getByTestId('user-status-card')).toBeInTheDocument();
    expect(screen.getByTestId('today-progress-card')).toBeInTheDocument();
    expect(screen.getByTestId('quick-actions-section')).toBeInTheDocument();
  });

  it('未認証ユーザーはサインインページにリダイレクトされる', async () => {
    // Given: 未認証状態
    const mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: mockPush
    });
    
    // When: ダッシュボードページにアクセス
    render(<Dashboard />, {
      wrapper: ({ children }) => (
        <AuthProvider user={null}>{children}</AuthProvider>
      )
    });
    
    // Then: サインインページにリダイレクト
    expect(mockPush).toHaveBeenCalledWith('/auth/signin');
  });

  it('ローディング中はスケルトンUIが表示される', async () => {
    // Given: ローディング状態のモック
    jest.spyOn(require('@/hooks/useDashboardData'), 'useDashboardData')
      .mockReturnValue({ data: null, loading: true, error: null });
    
    // When: ダッシュボードページをレンダリング
    render(<Dashboard />);
    
    // Then: スケルトンUIが表示される
    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('user-status-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('progress-skeleton')).toBeInTheDocument();
  });
});
```

#### 1.2 データ表示テスト

```typescript
describe('Dashboard Data Display', () => {
  it('ユーザーステータスカードが正しく表示される', async () => {
    // Given: ユーザーデータ
    const mockUser = {
      id: 'user123',
      name: 'テストユーザー',
      level: 8,
      totalXp: 4200,
      currentLevelXp: 200,
      nextLevelXp: 500
    };
    
    // When: ダッシュボードをレンダリング
    render(<Dashboard />, {
      wrapper: createMockWrapper({ user: mockUser })
    });
    
    // Then: ユーザー情報が正しく表示される
    expect(screen.getByText('レベル 8')).toBeInTheDocument();
    expect(screen.getByText('4,200 XP')).toBeInTheDocument();
    expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    
    // XPプログレスバーの確認
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '66.67'); // 200/300 = 66.67%
  });

  it('本日の進捗が正しく表示される', async () => {
    // Given: 本日の進捗データ
    const mockTodayProgress = {
      completedRoutines: 3,
      totalRoutines: 5,
      todayXp: 150,
      currentStreak: 7,
      completionRate: 60
    };
    
    // When: ダッシュボードをレンダリング
    render(<Dashboard />, {
      wrapper: createMockWrapper({ todayProgress: mockTodayProgress })
    });
    
    // Then: 進捗情報が正しく表示される
    expect(screen.getByText('3 / 5 完了')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('150 XP 獲得')).toBeInTheDocument();
    expect(screen.getByText('7日連続')).toBeInTheDocument();
  });

  it('最近の実績（バッジ・ミッション）が表示される', async () => {
    // Given: 実績データ
    const mockAchievements = {
      recentBadges: [
        { id: 'badge1', name: '3日連続達成', iconUrl: '/badge1.png' },
        { id: 'badge2', name: '早起き習慣', iconUrl: '/badge2.png' }
      ],
      activeMissions: [
        { id: 'mission1', title: '週5回運動', progress: 3, target: 5 },
        { id: 'mission2', title: '毎日読書', progress: 2, target: 7 }
      ]
    };
    
    // When: ダッシュボードをレンダリング
    render(<Dashboard />, {
      wrapper: createMockWrapper({ achievements: mockAchievements })
    });
    
    // Then: 実績が表示される
    expect(screen.getByText('3日連続達成')).toBeInTheDocument();
    expect(screen.getByText('早起き習慣')).toBeInTheDocument();
    expect(screen.getByText('週5回運動')).toBeInTheDocument();
    expect(screen.getByText('3 / 5')).toBeInTheDocument(); // ミッション進捗
  });
});
```

#### 1.3 インタラクション機能テスト

```typescript
describe('Dashboard Interactions', () => {
  it('ルーチン完了ボタンをクリックしてXP獲得ができる', async () => {
    // Given: 未完了のルーチン
    const mockRoutines = [
      { id: 'routine1', name: '朝の運動', completed: false, xpReward: 50 }
    ];
    const mockCompleteRoutine = jest.fn().mockResolvedValue({ success: true, xpGained: 50 });
    
    // When: ダッシュボードをレンダリング
    render(<Dashboard />, {
      wrapper: createMockWrapper({ 
        todayRoutines: mockRoutines,
        completeRoutine: mockCompleteRoutine 
      })
    });
    
    // ルーチン完了ボタンをクリック
    const completeButton = screen.getByRole('button', { name: '朝の運動を完了' });
    await user.click(completeButton);
    
    // Then: 完了処理が呼ばれ、XP獲得通知が表示される
    expect(mockCompleteRoutine).toHaveBeenCalledWith('routine1');
    expect(screen.getByText('50 XP獲得！')).toBeInTheDocument();
  });

  it('新しいルーチン作成リンクが機能する', async () => {
    // Given: ダッシュボードのレンダリング
    const mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push: mockPush });
    
    render(<Dashboard />);
    
    // When: 新しいルーチン作成ボタンをクリック
    const createButton = screen.getByRole('link', { name: '新しいルーチンを作成' });
    await user.click(createButton);
    
    // Then: ルーチン作成ページに遷移
    expect(createButton).toHaveAttribute('href', '/routines/create');
  });

  it('ナビゲーションリンクが正常に動作する', async () => {
    // Given: ダッシュボードのレンダリング
    render(<Dashboard />);
    
    // Then: ナビゲーションリンクが存在し、正しいhrefを持つ
    expect(screen.getByRole('link', { name: 'ルーチン管理' })).toHaveAttribute('href', '/routines');
    expect(screen.getByRole('link', { name: '統計' })).toHaveAttribute('href', '/statistics');
    expect(screen.getByRole('link', { name: '設定' })).toHaveAttribute('href', '/settings');
  });

  it('完了後にリアルタイムで画面が更新される', async () => {
    // Given: ルーチン完了前後のデータ
    const mockCompleteRoutine = jest.fn().mockResolvedValue({ 
      success: true, 
      xpGained: 50,
      newLevel: 6 
    });
    
    const { rerender } = render(<Dashboard />, {
      wrapper: createMockWrapper({ 
        user: { level: 5, totalXp: 2450 },
        completeRoutine: mockCompleteRoutine 
      })
    });
    
    // When: ルーチンを完了
    const completeButton = screen.getByRole('button', { name: '朝の運動を完了' });
    await user.click(completeButton);
    
    // Then: レベル・XP・進捗が更新される
    await waitFor(() => {
      expect(screen.getByText('レベル 6')).toBeInTheDocument();
      expect(screen.getByText('2,500 XP')).toBeInTheDocument();
    });
  });
});
```

### 2. コンポーネント分離テスト

#### 2.1 UserStatusCard テスト

```typescript
describe('UserStatusCard', () => {
  it('ユーザー情報を正しく表示する', () => {
    // Given: ユーザーデータ
    const mockUser = {
      name: 'テストユーザー',
      level: 5,
      totalXp: 2500,
      currentLevelXp: 200,
      nextLevelXp: 500,
      avatarUrl: '/avatar.jpg'
    };
    
    // When: UserStatusCardをレンダリング
    render(<UserStatusCard user={mockUser} />);
    
    // Then: 情報が正しく表示される
    expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    expect(screen.getByText('レベル 5')).toBeInTheDocument();
    expect(screen.getByText('2,500 XP')).toBeInTheDocument();
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '40'); // 200/500 = 40%
  });

  it('レベルアップ時にアニメーションが表示される', async () => {
    // Given: レベルアップフラグ付きのデータ
    const mockUser = { level: 6, isLevelUp: true };
    
    // When: UserStatusCardをレンダリング
    render(<UserStatusCard user={mockUser} />);
    
    // Then: レベルアップアニメーションが表示される
    expect(screen.getByTestId('level-up-animation')).toBeInTheDocument();
    expect(screen.getByText('レベルアップ！')).toBeInTheDocument();
  });
});
```

#### 2.2 TodayProgressCard テスト

```typescript
describe('TodayProgressCard', () => {
  it('本日の進捗情報を正しく表示する', () => {
    // Given: 進捗データ
    const mockProgress = {
      completedRoutines: 3,
      totalRoutines: 5,
      todayXp: 150,
      currentStreak: 7,
      completionRate: 60
    };
    
    // When: TodayProgressCardをレンダリング
    render(<TodayProgressCard progress={mockProgress} />);
    
    // Then: 進捗情報が正しく表示される
    expect(screen.getByText('3 / 5 完了')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('150 XP 獲得')).toBeInTheDocument();
    expect(screen.getByText('7日連続')).toBeInTheDocument();
  });

  it('進捗率に応じて色が変わる', () => {
    // Given: 異なる進捗率のデータ
    const lowProgress = { completionRate: 30 };
    const highProgress = { completionRate: 80 };
    
    // When: 低い進捗率でレンダリング
    const { rerender } = render(<TodayProgressCard progress={lowProgress} />);
    expect(screen.getByTestId('progress-bar')).toHaveClass('bg-orange-500');
    
    // 高い進捗率で再レンダリング
    rerender(<TodayProgressCard progress={highProgress} />);
    expect(screen.getByTestId('progress-bar')).toHaveClass('bg-green-500');
  });
});
```

## 統合テスト

### 3. カスタムフックテスト

#### 3.1 useDashboardData フックテスト

```typescript
describe('useDashboardData', () => {
  it('ダッシュボードデータを正しくフェッチする', async () => {
    // Given: APIレスポンスのモック
    const mockApiResponses = {
      userProfile: { level: 5, totalXp: 2500 },
      todayRoutines: [{ id: '1', name: '運動', completed: false }],
      statistics: { completionRate: 75, currentStreak: 5 },
      notifications: [{ id: '1', message: 'レベルアップ！' }]
    };
    
    // When: フックを使用
    const { result } = renderHook(() => useDashboardData(), {
      wrapper: createMockApiWrapper(mockApiResponses)
    });
    
    // Then: 正しいデータが返される
    await waitFor(() => {
      expect(result.current.data).toEqual({
        user: mockApiResponses.userProfile,
        todayRoutines: mockApiResponses.todayRoutines,
        statistics: mockApiResponses.statistics,
        notifications: mockApiResponses.notifications
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('APIエラー時にエラー状態を返す', async () => {
    // Given: APIエラーのモック
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('API Error'));
    
    // When: フックを使用
    const { result } = renderHook(() => useDashboardData());
    
    // Then: エラー状態が返される
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeNull();
    });
  });

  it('ルーチン完了後にデータを再フェッチする', async () => {
    // Given: 初期データ
    const { result } = renderHook(() => useDashboardData());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // When: ルーチン完了を実行
    act(() => {
      result.current.completeRoutine('routine1');
    });
    
    // Then: データが再フェッチされる
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeTruthy();
    });
  });
});
```

#### 3.2 useCompleteRoutine フックテスト

```typescript
describe('useCompleteRoutine', () => {
  it('ルーチン完了処理が正常に実行される', async () => {
    // Given: APIレスポンスのモック
    const mockResponse = { success: true, xpGained: 50, newLevel: 6 };
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response);
    
    // When: フックを使用
    const { result } = renderHook(() => useCompleteRoutine());
    
    let completeResult;
    await act(async () => {
      completeResult = await result.current.completeRoutine('routine1');
    });
    
    // Then: 正しいレスポンスが返される
    expect(completeResult).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith('/api/execution-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routineId: 'routine1' })
    });
  });

  it('エラー時に例外をスローする', async () => {
    // Given: APIエラーのモック
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'ルーチンが見つかりません' })
    } as Response);
    
    // When: フックを使用
    const { result } = renderHook(() => useCompleteRoutine());
    
    // Then: エラーがスローされる
    await act(async () => {
      await expect(result.current.completeRoutine('invalid-routine'))
        .rejects.toThrow('ルーチンが見つかりません');
    });
  });
});
```

## E2Eテスト

### 4. ユーザーフローテスト

```typescript
describe('Dashboard E2E Tests', () => {
  it('ユーザーはダッシュボードでルーチンを完了できる', async ({ page }) => {
    // Given: ログイン済みの状態
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // When: ダッシュボードに移動
    await expect(page).toHaveURL('/dashboard');
    
    // ルーチン完了ボタンをクリック
    await page.click('[data-testid="complete-routine-button"]');
    
    // Then: XP獲得通知が表示される
    await expect(page.locator('text=XP獲得！')).toBeVisible();
    
    // 進捗バーが更新される
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
  });

  it('モバイルデバイスでレスポンシブデザインが機能する', async ({ page }) => {
    // Given: モバイルサイズのビューポート
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Then: モバイルレイアウトが表示される
    await expect(page.locator('[data-testid="mobile-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-sidebar"]')).not.toBeVisible();
    
    // ハンバーガーメニューが機能する
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  it('アクセシビリティ機能が動作する', async ({ page }) => {
    // Given: ダッシュボードページ
    await page.goto('/dashboard');
    
    // Then: ARIAラベルが正しく設定されている
    await expect(page.locator('[aria-label="ユーザーステータス"]')).toBeVisible();
    await expect(page.locator('[aria-label="今日の進捗"]')).toBeVisible();
    
    // キーボードナビゲーションが機能する
    await page.keyboard.press('Tab'); // 最初のフォーカサブル要素
    await page.keyboard.press('Enter'); // Enterでアクティベート
  });
});
```

## エラーハンドリングテスト

### 5. エラー状態テスト

```typescript
describe('Dashboard Error Handling', () => {
  it('APIエラー時にエラーメッセージが表示される', async () => {
    // Given: APIエラーのモック
    jest.spyOn(require('@/hooks/useDashboardData'), 'useDashboardData')
      .mockReturnValue({ 
        data: null, 
        loading: false, 
        error: new Error('サーバーエラーが発生しました') 
      });
    
    // When: ダッシュボードをレンダリング
    render(<Dashboard />);
    
    // Then: エラーメッセージが表示される
    expect(screen.getByText('サーバーエラーが発生しました')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '再試行' })).toBeInTheDocument();
  });

  it('ネットワークエラー時にリトライ機能が動作する', async () => {
    // Given: ネットワークエラー後の状態
    const mockRetry = jest.fn();
    jest.spyOn(require('@/hooks/useDashboardData'), 'useDashboardData')
      .mockReturnValue({ 
        data: null, 
        loading: false, 
        error: new Error('ネットワークエラー'),
        retry: mockRetry
      });
    
    render(<Dashboard />);
    
    // When: 再試行ボタンをクリック
    const retryButton = screen.getByRole('button', { name: '再試行' });
    await user.click(retryButton);
    
    // Then: 再試行処理が呼ばれる
    expect(mockRetry).toHaveBeenCalled();
  });

  it('認証エラー時にサインインページにリダイレクトされる', async () => {
    // Given: 認証エラーのモック
    const mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push: mockPush });
    jest.spyOn(require('@/hooks/useDashboardData'), 'useDashboardData')
      .mockReturnValue({ 
        data: null, 
        loading: false, 
        error: new Error('401: Unauthorized') 
      });
    
    // When: ダッシュボードをレンダリング
    render(<Dashboard />);
    
    // Then: サインインページにリダイレクト
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/signin');
    });
  });
});
```

## テストヘルパー関数

```typescript
// テストデータ作成ヘルパー
function createMockUser(overrides?: Partial<User>) {
  return {
    id: 'user123',
    name: 'テストユーザー',
    level: 5,
    totalXp: 2500,
    currentLevelXp: 200,
    nextLevelXp: 500,
    avatarUrl: '/avatar.jpg',
    ...overrides
  };
}

function createMockDashboardData(overrides?: Partial<DashboardData>) {
  return {
    user: createMockUser(),
    todayProgress: {
      completedRoutines: 2,
      totalRoutines: 5,
      todayXp: 100,
      currentStreak: 3,
      completionRate: 40
    },
    recentBadges: [],
    activeMissions: [],
    notifications: [],
    ...overrides
  };
}

function createMockWrapper({ 
  user = createMockUser(), 
  dashboardData = createMockDashboardData(),
  ...props 
}) {
  return ({ children }: { children: React.ReactNode }) => (
    <AuthProvider user={user}>
      <MockApiProvider data={dashboardData} {...props}>
        {children}
      </MockApiProvider>
    </AuthProvider>
  );
}

function createMockApiWrapper(responses: Record<string, any>) {
  return ({ children }: { children: React.ReactNode }) => (
    <MockApiProvider responses={responses}>
      {children}
    </MockApiProvider>
  );
}
```

## 成功基準

- [ ] 全コンポーネントテストが合格（カバレッジ‵80%以上）
- [ ] カスタムフック統合テストが合格
- [ ] E2Eテストが合格（メインユーザーフロー）
- [ ] エラーハンドリングテストが合格
- [ ] アクセシビリティテストが合格
- [ ] レスポンシブテストが合格