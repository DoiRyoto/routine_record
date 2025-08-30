# ルーチンレコード テスト仕様書（逆生成）

## 分析概要

**分析日時**: 2025年8月28日 JST  
**対象コードベース**: /Users/doi-ryoto/Desktop/Programming/routine_record  
**テストカバレッジ推定**: 70%  
**実装済みテスト数**: 17個  
**生成推奨テスト数**: 89個  
**推定追加工数**: 120時間  

## 現在のテスト実装状況

### テストフレームワーク
- **単体テスト**: Jest + @testing-library/react
- **統合テスト**: Jest + Supertest (Next.js API Routes)
- **E2Eテスト**: Playwright (5ブラウザ対応)
- **コードカバレッジ**: Jest coverage
- **モック**: MSW (Mock Service Worker)
- **UI テスト**: Storybook (38コンポーネント)

### テストカバレッジ詳細

| カテゴリ | 実装済み | 推奨合計 | カバレッジ | 優先度 |
|----------|----------|----------|-----------|--------|
| **API統合テスト** | 0/22 | 22 | 0% | 🔴 高 |
| **単体テスト** | 8/45 | 45 | 18% | 🔴 高 |
| **UIコンポーネントテスト** | 0/36 | 36 | 0% | 🟡 中 |
| **E2Eテスト** | 9/12 | 12 | 75% | 🟢 良 |
| **パフォーマンステスト** | 0/5 | 5 | 0% | 🟡 中 |
| **セキュリティテスト** | 0/8 | 8 | 0% | 🔴 高 |
| **全体** | **17/128** | **128** | **13%** | **要改善** |

### 実装状況詳細

#### ✅ 実装済みテスト
1. **ドメインテスト**: `architecture.test.ts` - Value Objects・エンティティ
2. **UseCaseテスト**: `CreateRoutineUseCase.test.ts` - ビジネスロジック
3. **サービステスト**: `RoutineValidationService.test.ts` - バリデーション
4. **リポジトリテスト**: `DrizzleRoutineRepository.test.ts` - データアクセス
5. **コントローラーテスト**: `RoutineController.test.ts` - API入出力
6. **ミッションテスト**: `missions.test.ts`, `mission-card.test.ts`
7. **プロフィール作成テスト**: `auto-profile-creation.test.ts`
8. **E2Eテスト**: 9個のページ全体テスト (auth, calendar, etc.)

#### ❌ 不足しているテスト (高優先度)
1. **API統合テスト**: 全22エンドポイント (0%)
2. **UI コンポーネントテスト**: 36コンポーネント (0%)
3. **エラーハンドリングテスト**: 統一エラー処理 (0%)
4. **認証・認可テスト**: セキュリティ機能 (0%)
5. **データベーステスト**: 制約・トランザクション (0%)

## 生成されたテストケース

### API統合テストケース

#### 🔐 認証API テスト

```typescript
// POST /api/auth/signin - サインインAPI
describe('POST /api/auth/signin', () => {
  beforeEach(async () => {
    await setupTestUser({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  describe('正常系', () => {
    it('有効な認証情報でサインイン成功', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('サインインが完了しました');
      expect(response.body.user.email).toBe('test@example.com');
      
      // JWTトークンがCookieに設定されることを確認
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/sb-access-token/)
        ])
      );
    });

    it('Supabase Authとの連携確認', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      // ユーザープロフィールが自動作成される
      expect(response.body.user.id).toMatch(/^[0-9a-f-]{36}$/);
    });
  });

  describe('異常系', () => {
    it('存在しないユーザーでエラー', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('メールアドレスまたはパスワードが正しくありません');
    });

    it('無効なパスワードでエラー', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('メールアドレスまたはパスワードが正しくありません');
    });

    it('バリデーションエラー - 必須項目不足', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('メールアドレスとパスワードが必要です');
    });

    it('バリデーションエラー - 無効なメール形式', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('メールアドレスとパスワードが必要です');
    });
  });

  describe('セキュリティテスト', () => {
    it('SQLインジェクション対策', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: "'; DROP TABLE users; --",
          password: 'password'
        });

      expect(response.status).toBe(400);
      // データベースが破損していないことを確認
      expect(async () => await getUserCount()).not.toThrow();
    });

    it('XSS対策', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: '<script>alert("xss")</script>@example.com',
          password: 'password'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).not.toContain('<script>');
    });

    it('レート制限テスト (将来実装)', async () => {
      // 連続ログイン試行の制限テスト
      const promises = Array.from({ length: 10 }, () =>
        request(app)
          .post('/api/auth/signin')
          .send({ email: 'test@example.com', password: 'wrong' })
      );

      const responses = await Promise.all(promises);
      
      // 最初の数回は401、その後は429 (Too Many Requests) が期待される
      const tooManyRequests = responses.filter(r => r.status === 429);
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });
});
```

#### 📋 ルーチンAPI テスト

```typescript
// GET /api/routines - ルーチン一覧取得
describe('GET /api/routines', () => {
  let authUser: any;

  beforeEach(async () => {
    authUser = await createAuthUser();
    await createTestRoutines(authUser.id, 3);
  });

  it('認証済みユーザーのルーチン一覧取得', async () => {
    const response = await request(app)
      .get('/api/routines')
      .set('Cookie', await getAuthCookie(authUser));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(3);
    expect(response.body.data[0]).toMatchObject({
      id: expect.any(String),
      userId: authUser.id,
      name: expect.any(String),
      category: expect.any(String),
      goalType: expect.stringMatching(/^(frequency_based|schedule_based)$/),
      isActive: true
    });
  });

  it('認証なしでエラー', async () => {
    const response = await request(app).get('/api/routines');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('認証が必要です');
  });

  it('他ユーザーのルーチンは取得できない', async () => {
    const otherUser = await createAuthUser();
    await createTestRoutines(otherUser.id, 2);

    const response = await request(app)
      .get('/api/routines')
      .set('Cookie', await getAuthCookie(authUser));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(3); // 自分のルーチンのみ
    expect(response.body.data.every(r => r.userId === authUser.id)).toBe(true);
  });

  it('削除されたルーチンは除外される', async () => {
    // 1つのルーチンを削除
    await request(app)
      .delete(`/api/routines/${authUser.routines[0].id}`)
      .set('Cookie', await getAuthCookie(authUser));

    const response = await request(app)
      .get('/api/routines')
      .set('Cookie', await getAuthCookie(authUser));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2); // 削除されたものは除外
  });
});

// POST /api/routines - ルーチン作成
describe('POST /api/routines', () => {
  let authUser: any;

  beforeEach(async () => {
    authUser = await createAuthUser();
  });

  describe('正常系', () => {
    it('スケジュールベースルーチン作成', async () => {
      const routineData = {
        name: 'Morning Exercise',
        description: 'Daily workout routine',
        category: 'Health',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
        recurrenceInterval: 1
      };

      const response = await request(app)
        .post('/api/routines')
        .set('Cookie', await getAuthCookie(authUser))
        .send(routineData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('ルーチンが作成されました');
      expect(response.body.data).toMatchObject({
        ...routineData,
        userId: authUser.id,
        isActive: true,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    it('頻度ベースルーチン作成', async () => {
      const routineData = {
        name: 'Weekly Reading',
        category: 'Education',
        goalType: 'frequency_based',
        targetCount: 3,
        targetPeriod: 'weekly',
        recurrenceType: 'custom'
      };

      const response = await request(app)
        .post('/api/routines')
        .set('Cookie', await getAuthCookie(authUser))
        .send(routineData);

      expect(response.status).toBe(200);
      expect(response.body.data.targetCount).toBe(3);
      expect(response.body.data.targetPeriod).toBe('weekly');
    });
  });

  describe('異常系', () => {
    it('必須項目不足でエラー', async () => {
      const response = await request(app)
        .post('/api/routines')
        .set('Cookie', await getAuthCookie(authUser))
        .send({
          name: 'Incomplete Routine'
          // category, goalType, recurrenceType が不足
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('必須項目が不足しています');
    });

    it('頻度ベース設定不足でエラー', async () => {
      const response = await request(app)
        .post('/api/routines')
        .set('Cookie', await getAuthCookie(authUser))
        .send({
          name: 'Frequency Routine',
          category: 'Health',
          goalType: 'frequency_based',
          recurrenceType: 'daily'
          // targetCount, targetPeriod が不足
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('頻度ベースミッションには目標回数と期間が必要です');
    });

    it('無効なgoalTypeでエラー', async () => {
      const response = await request(app)
        .post('/api/routines')
        .set('Cookie', await getAuthCookie(authUser))
        .send({
          name: 'Invalid Routine',
          category: 'Health',
          goalType: 'invalid_type',
          recurrenceType: 'daily'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('goalType');
    });
  });

  describe('ビジネスルールテスト', () => {
    it('同一カテゴリ・名前の重複チェック', async () => {
      // 最初のルーチン作成
      const routineData = {
        name: 'Morning Exercise',
        category: 'Health',
        goalType: 'schedule_based',
        recurrenceType: 'daily'
      };

      await request(app)
        .post('/api/routines')
        .set('Cookie', await getAuthCookie(authUser))
        .send(routineData);

      // 同じ名前・カテゴリで再作成試行
      const response = await request(app)
        .post('/api/routines')
        .set('Cookie', await getAuthCookie(authUser))
        .send(routineData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('重複');
    });

    it('ルーチン数上限チェック (将来実装)', async () => {
      // 上限数のルーチンを作成
      for (let i = 0; i < 100; i++) {
        await createTestRoutine(authUser.id, `Routine ${i}`);
      }

      const response = await request(app)
        .post('/api/routines')
        .set('Cookie', await getAuthCookie(authUser))
        .send({
          name: 'Over Limit Routine',
          category: 'Test',
          goalType: 'schedule_based',
          recurrenceType: 'daily'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('上限');
    });
  });
});
```

### 🎮 ゲーミフィケーションAPI テスト

```typescript
// GET /api/missions - ミッション一覧取得
describe('GET /api/missions', () => {
  beforeEach(async () => {
    await seedMissions([
      { type: 'streak', difficulty: 'easy', targetValue: 7 },
      { type: 'count', difficulty: 'medium', targetValue: 20 },
      { type: 'variety', difficulty: 'hard', targetValue: 5 }
    ]);
  });

  it('アクティブミッション一覧取得', async () => {
    const response = await request(app).get('/api/missions');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      type: expect.stringMatching(/^(streak|count|variety|consistency)$/),
      difficulty: expect.stringMatching(/^(easy|medium|hard|extreme)$/),
      xpReward: expect.any(Number),
      isActive: true
    });
  });
});

// GET /api/user-profiles - ユーザープロフィール取得
describe('GET /api/user-profiles', () => {
  let authUser: any;

  beforeEach(async () => {
    authUser = await createAuthUserWithProfile();
  });

  it('ユーザープロフィール情報取得', async () => {
    const response = await request(app)
      .get('/api/user-profiles')
      .set('Cookie', await getAuthCookie(authUser));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      userId: authUser.id,
      level: expect.any(Number),
      totalXP: expect.any(Number),
      currentXP: expect.any(Number),
      nextLevelXP: expect.any(Number),
      streak: expect.any(Number),
      longestStreak: expect.any(Number),
      totalRoutines: expect.any(Number),
      totalExecutions: expect.any(Number)
    });
  });

  it('レベル・XP計算の整合性確認', async () => {
    const response = await request(app)
      .get('/api/user-profiles')
      .set('Cookie', await getAuthCookie(authUser));

    const profile = response.body.data;
    expect(profile.currentXP).toBeLessThan(profile.nextLevelXP);
    expect(profile.totalXP).toBeGreaterThanOrEqual(profile.currentXP);
    expect(profile.level).toBeGreaterThanOrEqual(1);
  });
});
```

### UIコンポーネントテスト

#### 🧩 基本UIコンポーネントテスト

```typescript
// Button コンポーネントテスト
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button コンポーネント', () => {
  it('基本的なレンダリング', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
  });

  it('クリックイベントハンドリング', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled状態', () => {
    render(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('variant プロパティ', () => {
    render(<Button variant="destructive">Delete</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-500'); // destructive variant
  });

  it('size プロパティ', () => {
    render(<Button size="lg">Large Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-11'); // large size
  });
});

// Form コンポーネントテスト
import { Form } from '@/components/ui/Form';

describe('Form コンポーネント', () => {
  it('基本的なフォームレンダリング', () => {
    render(
      <Form onSubmit={jest.fn()}>
        <input name="test" />
        <button type="submit">Submit</button>
      </Form>
    );
    
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('フォーム送信ハンドリング', () => {
    const handleSubmit = jest.fn();
    render(
      <Form onSubmit={handleSubmit}>
        <input name="test" defaultValue="value" />
        <button type="submit">Submit</button>
      </Form>
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleSubmit).toHaveBeenCalled();
  });
});
```

#### 🎯 ゲーミフィケーションコンポーネントテスト

```typescript
// UserAvatar コンポーネントテスト
import { UserAvatar } from '@/components/gamification/UserAvatar';

describe('UserAvatar コンポーネント', () => {
  const mockUserProfile = {
    userId: 'user-1',
    level: 5,
    totalXP: 1250,
    currentXP: 250,
    nextLevelXP: 500
  };

  it('ユーザーアバター表示', () => {
    render(
      <UserAvatar 
        userProfile={mockUserProfile} 
        size="md" 
        showLevel={true} 
      />
    );
    
    expect(screen.getByText('5')).toBeInTheDocument(); // level
    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
  });

  it('サイズバリエーション', () => {
    render(
      <UserAvatar userProfile={mockUserProfile} size="lg" />
    );
    
    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveClass('w-16 h-16'); // large size
  });
});

// LevelProgressBar コンポーネントテスト
import { LevelProgressBar } from '@/components/gamification/LevelProgressBar';

describe('LevelProgressBar コンポーネント', () => {
  it('レベル進捗表示', () => {
    render(
      <LevelProgressBar
        level={3}
        currentXP={150}
        nextLevelXP={300}
        totalXP={750}
        showNumbers={true}
      />
    );
    
    expect(screen.getByText('Level 3')).toBeInTheDocument();
    expect(screen.getByText('150 / 300 XP')).toBeInTheDocument();
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50'); // 150/300 = 50%
  });

  it('プログレスバーの幅計算', () => {
    render(
      <LevelProgressBar
        level={1}
        currentXP={25}
        nextLevelXP={100}
        totalXP={25}
      />
    );
    
    const progressBar = screen.getByTestId('progress-fill');
    expect(progressBar).toHaveStyle('width: 25%');
  });
});

// ExperiencePoints コンポーネントテスト
import { ExperiencePoints } from '@/components/gamification/ExperiencePoints';

describe('ExperiencePoints コンポーネント', () => {
  it('XP値の表示', () => {
    render(
      <ExperiencePoints value={1500} variant="badge" size="md" />
    );
    
    expect(screen.getByText('1,500 XP')).toBeInTheDocument();
  });

  it('バリアント別表示', () => {
    render(
      <ExperiencePoints value={500} variant="inline" />
    );
    
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.queryByText('XP')).not.toBeInTheDocument(); // inline variant
  });
});
```

#### 📱 ページコンポーネントテスト

```typescript
// DashboardPage コンポーネントテスト
import { DashboardPage } from '@/app/DashboardPage';

describe('DashboardPage', () => {
  const mockProps = {
    initialRoutines: [
      { id: '1', name: 'Morning Run', category: 'Health', isActive: true },
      { id: '2', name: 'Read Book', category: 'Education', isActive: true }
    ],
    initialExecutionRecords: [],
    userSettings: { theme: 'light', language: 'ja' },
    userProfile: {
      userId: 'user-1',
      level: 3,
      totalXP: 750,
      currentXP: 50,
      nextLevelXP: 200,
      streak: 5,
      longestStreak: 10
    }
  };

  it('ダッシュボード要素の表示', () => {
    render(<DashboardPage {...mockProps} />);
    
    expect(screen.getByText('おかえりなさい！')).toBeInTheDocument();
    expect(screen.getByTestId('gamification-header')).toBeInTheDocument();
    expect(screen.getByText('Level 3')).toBeInTheDocument();
    expect(screen.getByText('今日も素晴らしい一日にしましょう ✨')).toBeInTheDocument();
  });

  it('ユーザープロフィール未取得時のエラー表示', () => {
    render(
      <DashboardPage 
        {...mockProps} 
        userProfile={undefined} 
      />
    );
    
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText('ユーザープロフィールを読み込めませんでした')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '再読み込み' })).toBeInTheDocument();
  });

  it('ルーチン一覧表示', () => {
    render(<DashboardPage {...mockProps} />);
    
    expect(screen.getByText('Morning Run')).toBeInTheDocument();
    expect(screen.getByText('Read Book')).toBeInTheDocument();
  });
});

// SignInPage コンポーネントテスト
import { SignInPage } from '@/app/auth/signin/SignInPage';

describe('SignInPage', () => {
  it('サインインフォーム表示', () => {
    render(<SignInPage />);
    
    expect(screen.getByRole('heading', { name: /サインイン/ })).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'サインイン' })).toBeInTheDocument();
    expect(screen.getByText('こちらから登録')).toBeInTheDocument();
  });

  it('フォーム送信処理', async () => {
    const user = userEvent.setup();
    render(<SignInPage />);
    
    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.click(screen.getByRole('button', { name: 'サインイン' }));
    
    // フォーム送信後の状態確認
    expect(screen.getByRole('button', { name: 'サインイン' })).toBeDisabled();
  });
});
```

### パフォーマンステスト

```typescript
describe('パフォーマンステスト', () => {
  describe('API応答性能', () => {
    it('ルーチン一覧API - レスポンス時間テスト', async () => {
      const authUser = await createAuthUser();
      await createTestRoutines(authUser.id, 100); // 大量データ
      
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/routines')
        .set('Cookie', await getAuthCookie(authUser));
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000); // 1秒以内
    });

    it('同時接続負荷テスト', async () => {
      const authUser = await createAuthUser();
      
      const promises = Array.from({ length: 50 }, () =>
        request(app)
          .get('/api/routines')
          .set('Cookie', await getAuthCookie(authUser))
      );
      
      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      
      // 全リクエスト成功確認
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // 全体応答時間確認
      expect(endTime - startTime).toBeLessThan(5000); // 5秒以内
    });
  });

  describe('メモリ使用量テスト', () => {
    it('大量ルーチン処理時のメモリリーク検証', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      const authUser = await createAuthUser();
      
      // 1000個のルーチンを作成・取得
      for (let i = 0; i < 1000; i++) {
        await createTestRoutine(authUser.id, `Routine ${i}`);
      }
      
      await request(app)
        .get('/api/routines')
        .set('Cookie', await getAuthCookie(authUser));
      
      // ガベージコレクション実行
      if (global.gc) global.gc();
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // メモリ増加が異常でないことを確認（例: 50MB以内）
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});
```

### セキュリティテスト

```typescript
describe('セキュリティテスト', () => {
  describe('認証・認可', () => {
    it('未認証API アクセス制御', async () => {
      const protectedEndpoints = [
        '/api/routines',
        '/api/execution-records',
        '/api/user-profiles',
        '/api/user-settings'
      ];
      
      for (const endpoint of protectedEndpoints) {
        const response = await request(app).get(endpoint);
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('認証が必要です');
      }
    });

    it('他ユーザーリソースアクセス制御', async () => {
      const user1 = await createAuthUser();
      const user2 = await createAuthUser();
      const user1Routine = await createTestRoutine(user1.id);
      
      // user2がuser1のルーチンにアクセス試行
      const response = await request(app)
        .get(`/api/routines/${user1Routine.id}`)
        .set('Cookie', await getAuthCookie(user2));
      
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('アクセス権限がありません');
    });

    it('無効なJWTトークン拒否', async () => {
      const response = await request(app)
        .get('/api/routines')
        .set('Cookie', 'sb-access-token=invalid.jwt.token');
      
      expect(response.status).toBe(401);
    });
  });

  describe('入力値検証', () => {
    it('SQLインジェクション対策', async () => {
      const authUser = await createAuthUser();
      const maliciousInput = "'; DROP TABLE routines; --";
      
      const response = await request(app)
        .post('/api/routines')
        .set('Cookie', await getAuthCookie(authUser))
        .send({
          name: maliciousInput,
          category: 'Test',
          goalType: 'schedule_based',
          recurrenceType: 'daily'
        });
      
      // リクエストが適切に処理され、データベースが破損していない
      expect([200, 400]).toContain(response.status);
      
      // データベース整合性確認
      const routinesCheck = await request(app)
        .get('/api/routines')
        .set('Cookie', await getAuthCookie(authUser));
      expect(routinesCheck.status).toBe(200);
    });

    it('XSS対策', async () => {
      const authUser = await createAuthUser();
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app)
        .post('/api/routines')
        .set('Cookie', await getAuthCookie(authUser))
        .send({
          name: xssPayload,
          category: 'Test',
          goalType: 'schedule_based',
          recurrenceType: 'daily'
        });
      
      if (response.status === 200) {
        // レスポンス内でスクリプトがエスケープされている
        expect(response.body.data.name).not.toContain('<script>');
        expect(response.body.data.name).toContain('&lt;script&gt;');
      }
    });

    it('過大データ送信制限', async () => {
      const authUser = await createAuthUser();
      const largeString = 'A'.repeat(10000); // 10KB文字列
      
      const response = await request(app)
        .post('/api/routines')
        .set('Cookie', await getAuthCookie(authUser))
        .send({
          name: largeString,
          category: 'Test',
          goalType: 'schedule_based',
          recurrenceType: 'daily'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('文字数');
    });
  });

  describe('レート制限・DoS対策', () => {
    it('API レート制限 (将来実装)', async () => {
      const authUser = await createAuthUser();
      
      // 短時間で大量リクエスト送信
      const promises = Array.from({ length: 100 }, () =>
        request(app)
          .get('/api/routines')
          .set('Cookie', await getAuthCookie(authUser))
      );
      
      const responses = await Promise.all(promises);
      const tooManyRequests = responses.filter(r => r.status === 429);
      
      // 一部リクエストがレート制限される
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });
});
```

### データベーステスト

```typescript
describe('データベーステスト', () => {
  describe('制約・整合性', () => {
    it('外部キー制約テスト', async () => {
      // 存在しないユーザーIDでルーチン作成試行
      await expect(
        createTestRoutine('nonexistent-user-id')
      ).rejects.toThrow('foreign key constraint');
    });

    it('ユニーク制約テスト', async () => {
      const user = await createTestUser();
      
      // 同じメールアドレスでユーザー作成試行
      await expect(
        createTestUser({ email: user.email })
      ).rejects.toThrow('unique constraint');
    });

    it('NOT NULL制約テスト', async () => {
      await expect(
        db.insert(routines).values({
          userId: 'user-1',
          // name が必須だが不足
          category: 'Test',
          goalType: 'schedule_based'
        })
      ).rejects.toThrow('not null constraint');
    });
  });

  describe('トランザクション処理', () => {
    it('ルーチン作成とプロフィール更新のトランザクション', async () => {
      const user = await createTestUser();
      
      // トランザクション中でエラーが発生した場合の rollback テスト
      try {
        await db.transaction(async (tx) => {
          await tx.insert(routines).values({
            userId: user.id,
            name: 'Test Routine',
            category: 'Test',
            goalType: 'schedule_based',
            recurrenceType: 'daily'
          });
          
          // 意図的にエラーを発生
          throw new Error('Transaction test error');
        });
      } catch {
        // トランザクションが rollback されていることを確認
        const routineCount = await db
          .select({ count: count() })
          .from(routines)
          .where(eq(routines.userId, user.id));
        
        expect(routineCount[0].count).toBe(0);
      }
    });
  });

  describe('インデックス効果テスト', () => {
    it('ユーザーIDインデックスの効果確認', async () => {
      // 大量データ準備
      const users = await Promise.all(
        Array.from({ length: 100 }, () => createTestUser())
      );
      
      for (const user of users) {
        await createTestRoutines(user.id, 10);
      }
      
      // インデックス使用クエリの性能確認
      const startTime = Date.now();
      const userRoutines = await db
        .select()
        .from(routines)
        .where(eq(routines.userId, users[0].id));
      const endTime = Date.now();
      
      expect(userRoutines).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(100); // 100ms以内
    });
  });
});
```

## 5. E2E Test Specifications

### 5.1 User Authentication E2E Tests

```typescript
// e2e/auth/authentication.spec.ts
describe('User Authentication Flow', () => {
  test('should complete signup and login flow', async ({ page }) => {
    // Signup flow
    await page.goto('/auth/signup');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'Password123!');
    await page.fill('[data-testid=confirm-password]', 'Password123!');
    await page.click('[data-testid=signup-button]');
    
    // Email verification step
    await expect(page.locator('[data-testid=verification-message]')).toBeVisible();
    
    // Login after verification
    await page.goto('/auth/signin');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'Password123!');
    await page.click('[data-testid=signin-button]');
    
    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid=user-menu]')).toBeVisible();
  });

  test('should handle authentication errors', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('[data-testid=email]', 'invalid@example.com');
    await page.fill('[data-testid=password]', 'wrongpassword');
    await page.click('[data-testid=signin-button]');
    
    await expect(page.locator('[data-testid=error-message]')).toContainText('認証に失敗しました');
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.click('[data-testid=reset-button]');
    
    await expect(page.locator('[data-testid=success-message]')).toContainText('パスワードリセットメールを送信しました');
  });
});
```

### 5.2 Routine Management E2E Tests

```typescript
// e2e/routines/routine-crud.spec.ts
describe('Routine CRUD Operations', () => {
  beforeEach(async ({ page }) => {
    // Setup authenticated user
    await page.goto('/auth/signin');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'Password123!');
    await page.click('[data-testid=signin-button]');
    await page.waitForURL('/dashboard');
  });

  test('should create new routine with full workflow', async ({ page }) => {
    // Navigate to create routine
    await page.click('[data-testid=create-routine-button]');
    await expect(page).toHaveURL('/routines/create');

    // Fill routine details
    await page.fill('[data-testid=routine-name]', 'Morning Workout');
    await page.fill('[data-testid=routine-description]', 'Daily exercise routine');
    await page.selectOption('[data-testid=category-select]', 'Health');
    await page.selectOption('[data-testid=goal-type]', 'schedule_based');
    await page.selectOption('[data-testid=recurrence-type]', 'daily');
    await page.fill('[data-testid=recurrence-interval]', '1');

    // Set schedule
    await page.click('[data-testid=schedule-time]');
    await page.fill('[data-testid=time-input]', '07:00');
    
    // Save routine
    await page.click('[data-testid=save-routine]');
    
    // Verify creation success
    await expect(page).toHaveURL('/routines');
    await expect(page.locator('[data-testid=success-message]')).toContainText('ルーティンを作成しました');
    await expect(page.locator('[data-testid=routine-card]')).toContainText('Morning Workout');
  });

  test('should edit existing routine', async ({ page }) => {
    // Navigate to routines list
    await page.goto('/routines');
    
    // Click edit on first routine
    await page.click('[data-testid=routine-card]:first-child [data-testid=edit-button]');
    
    // Edit routine details
    await page.fill('[data-testid=routine-name]', 'Updated Morning Workout');
    await page.fill('[data-testid=routine-description]', 'Updated daily exercise routine');
    
    // Save changes
    await page.click('[data-testid=save-routine]');
    
    // Verify update success
    await expect(page).toHaveURL('/routines');
    await expect(page.locator('[data-testid=success-message]')).toContainText('ルーティンを更新しました');
    await expect(page.locator('[data-testid=routine-card]')).toContainText('Updated Morning Workout');
  });

  test('should delete routine with confirmation', async ({ page }) => {
    await page.goto('/routines');
    
    // Get initial routine count
    const initialCount = await page.locator('[data-testid=routine-card]').count();
    
    // Delete first routine
    await page.click('[data-testid=routine-card]:first-child [data-testid=delete-button]');
    
    // Confirm deletion in modal
    await expect(page.locator('[data-testid=confirm-dialog]')).toBeVisible();
    await page.click('[data-testid=confirm-delete]');
    
    // Verify deletion
    await expect(page.locator('[data-testid=success-message]')).toContainText('ルーティンを削除しました');
    await expect(page.locator('[data-testid=routine-card]')).toHaveCount(initialCount - 1);
  });

  test('should validate routine form inputs', async ({ page }) => {
    await page.click('[data-testid=create-routine-button]');
    
    // Try to save empty form
    await page.click('[data-testid=save-routine]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid=name-error]')).toContainText('ルーティン名は必須です');
    await expect(page.locator('[data-testid=category-error]')).toContainText('カテゴリは必須です');
  });
});
```

### 5.3 Execution Recording E2E Tests

```typescript
// e2e/executions/execution-flow.spec.ts
describe('Execution Recording Flow', () => {
  beforeEach(async ({ page }) => {
    // Setup authenticated user with existing routines
    await page.goto('/auth/signin');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'Password123!');
    await page.click('[data-testid=signin-button]');
    await page.waitForURL('/dashboard');
  });

  test('should record routine execution from dashboard', async ({ page }) => {
    // Find today's scheduled routine
    const routineCard = page.locator('[data-testid=today-routine-card]:first-child');
    await expect(routineCard).toBeVisible();
    
    // Start execution
    await routineCard.locator('[data-testid=start-execution]').click();
    
    // Record execution details
    await page.fill('[data-testid=duration-input]', '30');
    await page.fill('[data-testid=memo-input]', 'Great workout today!');
    
    // Save execution
    await page.click('[data-testid=save-execution]');
    
    // Verify success
    await expect(page.locator('[data-testid=success-message]')).toContainText('実行を記録しました');
    await expect(routineCard.locator('[data-testid=execution-status]')).toContainText('完了');
  });

  test('should view execution history', async ({ page }) => {
    await page.goto('/executions');
    
    // Verify execution history loads
    await expect(page.locator('[data-testid=execution-list]')).toBeVisible();
    await expect(page.locator('[data-testid=execution-item]')).toHaveCount(1);
    
    // Check execution details
    const executionItem = page.locator('[data-testid=execution-item]:first-child');
    await expect(executionItem).toContainText('Morning Workout');
    await expect(executionItem).toContainText('30分');
    await expect(executionItem).toContainText('Great workout today!');
  });

  test('should filter executions by date range', async ({ page }) => {
    await page.goto('/executions');
    
    // Set date filter
    await page.fill('[data-testid=date-from]', '2024-01-01');
    await page.fill('[data-testid=date-to]', '2024-01-31');
    await page.click('[data-testid=apply-filter]');
    
    // Verify filtered results
    await expect(page.locator('[data-testid=execution-item]')).toHaveCount(0);
    
    // Reset filter
    await page.click('[data-testid=reset-filter]');
    await expect(page.locator('[data-testid=execution-item]')).toHaveCount(1);
  });
});
```

### 5.4 Gamification System E2E Tests

```typescript
// e2e/gamification/gamification-flow.spec.ts
describe('Gamification System', () => {
  beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'Password123!');
    await page.click('[data-testid=signin-button]');
    await page.waitForURL('/dashboard');
  });

  test('should display user progress and stats', async ({ page }) => {
    // Check dashboard gamification elements
    await expect(page.locator('[data-testid=user-level]')).toBeVisible();
    await expect(page.locator('[data-testid=xp-progress]')).toBeVisible();
    await expect(page.locator('[data-testid=current-streak]')).toBeVisible();
    
    // Verify initial values
    await expect(page.locator('[data-testid=user-level]')).toContainText('レベル 1');
    await expect(page.locator('[data-testid=current-xp]')).toContainText('0 XP');
  });

  test('should earn XP and level up from routine completion', async ({ page }) => {
    // Record an execution to earn XP
    const routineCard = page.locator('[data-testid=today-routine-card]:first-child');
    await routineCard.locator('[data-testid=start-execution]').click();
    await page.fill('[data-testid=duration-input]', '30');
    await page.click('[data-testid=save-execution]');
    
    // Verify XP gained notification
    await expect(page.locator('[data-testid=xp-gained-notification]')).toBeVisible();
    await expect(page.locator('[data-testid=xp-gained-notification]')).toContainText('10 XP獲得！');
    
    // Check updated XP display
    await expect(page.locator('[data-testid=current-xp]')).toContainText('10 XP');
  });

  test('should unlock and display achievements', async ({ page }) => {
    // Complete multiple executions to unlock achievement
    for (let i = 0; i < 3; i++) {
      const routineCard = page.locator('[data-testid=today-routine-card]:first-child');
      await routineCard.locator('[data-testid=start-execution]').click();
      await page.fill('[data-testid=duration-input]', '30');
      await page.click('[data-testid=save-execution]');
      
      // Wait for execution to be saved
      await expect(page.locator('[data-testid=success-message]')).toBeVisible();
      await page.waitForTimeout(1000);
    }
    
    // Check for badge unlock notification
    await expect(page.locator('[data-testid=badge-unlock-notification]')).toBeVisible();
    await expect(page.locator('[data-testid=badge-unlock-notification]')).toContainText('新しいバッジを獲得しました！');
    
    // Verify badge in profile
    await page.goto('/profile');
    await expect(page.locator('[data-testid=badge-grid] [data-testid=badge-item]')).toHaveCount(1);
  });

  test('should display and complete missions', async ({ page }) => {
    await page.goto('/missions');
    
    // Check mission list loads
    await expect(page.locator('[data-testid=mission-list]')).toBeVisible();
    await expect(page.locator('[data-testid=mission-item]')).toHaveCount(3);
    
    // Verify mission details
    const firstMission = page.locator('[data-testid=mission-item]:first-child');
    await expect(firstMission).toContainText('今日のルーティンを1つ完了する');
    await expect(firstMission).toContainText('10 XP');
    
    // Complete mission by executing routine
    await page.goto('/dashboard');
    const routineCard = page.locator('[data-testid=today-routine-card]:first-child');
    await routineCard.locator('[data-testid=start-execution]').click();
    await page.fill('[data-testid=duration-input]', '30');
    await page.click('[data-testid=save-execution]');
    
    // Verify mission completion
    await expect(page.locator('[data-testid=mission-complete-notification]')).toBeVisible();
    await expect(page.locator('[data-testid=mission-complete-notification]')).toContainText('ミッション達成！');
  });
});
```

### 5.5 Responsive Design E2E Tests

```typescript
// e2e/responsive/mobile-responsive.spec.ts
describe('Mobile Responsive Design', () => {
  beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/auth/signin');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'Password123!');
    await page.click('[data-testid=signin-button]');
    await page.waitForURL('/dashboard');
  });

  test('should display mobile navigation menu', async ({ page }) => {
    // Check mobile menu button exists
    await expect(page.locator('[data-testid=mobile-menu-button]')).toBeVisible();
    
    // Open mobile menu
    await page.click('[data-testid=mobile-menu-button]');
    
    // Verify menu items
    await expect(page.locator('[data-testid=mobile-menu]')).toBeVisible();
    await expect(page.locator('[data-testid=nav-dashboard]')).toBeVisible();
    await expect(page.locator('[data-testid=nav-routines]')).toBeVisible();
    await expect(page.locator('[data-testid=nav-executions]')).toBeVisible();
  });

  test('should display routine cards in mobile layout', async ({ page }) => {
    // Check routine cards stack vertically on mobile
    const routineCards = page.locator('[data-testid=routine-card]');
    const firstCard = routineCards.first();
    const secondCard = routineCards.nth(1);
    
    if (await secondCard.count() > 0) {
      const firstCardBox = await firstCard.boundingBox();
      const secondCardBox = await secondCard.boundingBox();
      
      // Verify cards are stacked vertically (second card is below first)
      expect(secondCardBox.y).toBeGreaterThan(firstCardBox.y + firstCardBox.height - 10);
    }
  });

  test('should handle mobile form inputs', async ({ page }) => {
    await page.click('[data-testid=create-routine-button]');
    
    // Test mobile keyboard handling
    await page.fill('[data-testid=routine-name]', 'Mobile Test Routine');
    
    // Verify input is visible after keyboard appears
    await expect(page.locator('[data-testid=routine-name]')).toBeVisible();
    
    // Test dropdown on mobile
    await page.click('[data-testid=category-select]');
    await expect(page.locator('[data-testid=category-option]')).toHaveCount(5);
  });
});
```

## 6. Performance Test Specifications

### 6.1 Load Testing

```typescript
// tests/performance/load.test.ts
describe('Load Testing', () => {
  describe('API Endpoints Performance', () => {
    it('should handle 100 concurrent routine creations', async () => {
      const authUser = await createAuthUser();
      const startTime = Date.now();
      
      const promises = Array.from({ length: 100 }, (_, i) =>
        request(app)
          .post('/api/routines')
          .set('Cookie', await getAuthCookie(authUser))
          .send({
            name: `Load Test Routine ${i}`,
            category: 'Health',
            goalType: 'schedule_based',
            recurrenceType: 'daily'
          })
      );
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      
      // All requests should succeed
      expect(responses.every(r => r.status === 201)).toBe(true);
      
      // Should complete within 10 seconds
      expect(endTime - startTime).toBeLessThan(10000);
      
      // Average response time should be under 100ms
      const avgResponseTime = (endTime - startTime) / 100;
      expect(avgResponseTime).toBeLessThan(100);
    });

    it('should handle high-frequency execution record creation', async () => {
      const authUser = await createAuthUser();
      const routine = await createTestRoutine(authUser.id);
      
      // Create 500 execution records rapidly
      const promises = Array.from({ length: 500 }, (_, i) =>
        request(app)
          .post('/api/execution-records')
          .set('Cookie', await getAuthCookie(authUser))
          .send({
            routineId: routine.id,
            executedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
            duration: 30,
            memo: `Execution ${i}`
          })
      );
      
      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      
      expect(responses.every(r => r.status === 201)).toBe(true);
      expect(endTime - startTime).toBeLessThan(15000); // 15 seconds max
    });

    it('should maintain performance with large datasets', async () => {
      // Setup user with 1000 routines and 10000 executions
      const authUser = await createAuthUser();
      await createLargeDataset(authUser.id, 1000, 10000);
      
      // Test routine list performance
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/routines')
        .set('Cookie', await getAuthCookie(authUser));
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds max
    });
  });

  describe('Database Performance', () => {
    it('should execute complex queries efficiently', async () => {
      const authUser = await createAuthUser();
      await createLargeDataset(authUser.id, 100, 1000);
      
      // Complex aggregation query for dashboard stats
      const startTime = Date.now();
      const stats = await db
        .select({
          totalRoutines: count(routines.id),
          totalExecutions: count(executionRecords.id),
          averageDuration: avg(executionRecords.duration),
          streakDays: sql<number>`COUNT(DISTINCT DATE(${executionRecords.executedAt}))`
        })
        .from(routines)
        .leftJoin(executionRecords, eq(routines.id, executionRecords.routineId))
        .where(eq(routines.userId, authUser.id));
      
      const endTime = Date.now();
      
      expect(stats).toHaveLength(1);
      expect(endTime - startTime).toBeLessThan(500); // 500ms max for complex query
    });

    it('should handle concurrent database operations', async () => {
      const users = await Promise.all(
        Array.from({ length: 50 }, () => createAuthUser())
      );
      
      // Simulate concurrent user operations
      const promises = users.map(async (user) => {
        const routine = await createTestRoutine(user.id);
        return createTestExecutionRecord(user.id, routine.id);
      });
      
      const startTime = Date.now();
      await Promise.all(promises);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds for 50 concurrent ops
    });
  });
});
```

### 6.2 Memory and Resource Usage Testing

```typescript
// tests/performance/memory.test.ts
describe('Memory Usage Testing', () => {
  it('should not leak memory during routine operations', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    const authUser = await createAuthUser();
    
    // Perform 100 routine CRUD operations
    for (let i = 0; i < 100; i++) {
      const routine = await createTestRoutine(authUser.id);
      
      // Update routine
      await request(app)
        .put(`/api/routines/${routine.id}`)
        .set('Cookie', await getAuthCookie(authUser))
        .send({ name: `Updated Routine ${i}` });
      
      // Delete routine
      await request(app)
        .delete(`/api/routines/${routine.id}`)
        .set('Cookie', await getAuthCookie(authUser));
    }
    
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (under 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });

  it('should handle large payload processing efficiently', async () => {
    const authUser = await createAuthUser();
    const largeDescription = 'A'.repeat(10000); // 10KB string
    
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Process large routine creation
    const response = await request(app)
      .post('/api/routines')
      .set('Cookie', await getAuthCookie(authUser))
      .send({
        name: 'Large Routine',
        description: largeDescription,
        category: 'Health',
        goalType: 'schedule_based',
        recurrenceType: 'daily'
      });
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(response.status).toBe(201);
    expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024); // Under 20MB
  });
});
```

## 7. Security Test Specifications

### 7.1 Authentication and Authorization Tests

```typescript
// tests/security/auth.test.ts
describe('Security - Authentication & Authorization', () => {
  describe('API Access Control', () => {
    it('should block unauthenticated access to protected endpoints', async () => {
      const protectedEndpoints = [
        { method: 'GET', path: '/api/routines' },
        { method: 'POST', path: '/api/routines' },
        { method: 'GET', path: '/api/execution-records' },
        { method: 'POST', path: '/api/execution-records' },
        { method: 'GET', path: '/api/user-profiles/me' },
        { method: 'PUT', path: '/api/user-settings' }
      ];
      
      for (const endpoint of protectedEndpoints) {
        const response = await request(app)[endpoint.method.toLowerCase()](endpoint.path);
        
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('認証が必要です');
      }
    });

    it('should prevent cross-user resource access', async () => {
      const user1 = await createAuthUser();
      const user2 = await createAuthUser();
      
      const user1Routine = await createTestRoutine(user1.id);
      const user1Execution = await createTestExecutionRecord(user1.id, user1Routine.id);
      
      // user2 tries to access user1's resources
      const routineResponse = await request(app)
        .get(`/api/routines/${user1Routine.id}`)
        .set('Cookie', await getAuthCookie(user2));
      
      const executionResponse = await request(app)
        .get(`/api/execution-records/${user1Execution.id}`)
        .set('Cookie', await getAuthCookie(user2));
      
      expect(routineResponse.status).toBe(403);
      expect(routineResponse.body.error).toBe('アクセス権限がありません');
      
      expect(executionResponse.status).toBe(403);
      expect(executionResponse.body.error).toBe('アクセス権限がありません');
    });

    it('should reject invalid JWT tokens', async () => {
      const invalidTokens = [
        'invalid.jwt.token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
        '',
        'Bearer invalid-token'
      ];
      
      for (const token of invalidTokens) {
        const response = await request(app)
          .get('/api/routines')
          .set('Cookie', `sb-access-token=${token}`);
        
        expect(response.status).toBe(401);
      }
    });

    it('should handle expired tokens properly', async () => {
      const expiredToken = jwt.sign(
        { sub: 'user-id', exp: Math.floor(Date.now() / 1000) - 3600 }, // Expired 1 hour ago
        'test-secret'
      );
      
      const response = await request(app)
        .get('/api/routines')
        .set('Cookie', `sb-access-token=${expiredToken}`);
      
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('トークンの有効期限が切れています');
    });
  });

  describe('Session Management', () => {
    it('should invalidate sessions on logout', async () => {
      const authUser = await createAuthUser();
      const cookie = await getAuthCookie(authUser);
      
      // Verify session works
      const beforeLogout = await request(app)
        .get('/api/routines')
        .set('Cookie', cookie);
      expect(beforeLogout.status).toBe(200);
      
      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookie);
      
      // Verify session is invalidated
      const afterLogout = await request(app)
        .get('/api/routines')
        .set('Cookie', cookie);
      expect(afterLogout.status).toBe(401);
    });

    it('should prevent session hijacking with proper token validation', async () => {
      const authUser = await createAuthUser();
      const validCookie = await getAuthCookie(authUser);
      
      // Extract and modify token
      const modifiedToken = validCookie.replace(/[a-z]/g, 'x');
      
      const response = await request(app)
        .get('/api/routines')
        .set('Cookie', modifiedToken);
      
      expect(response.status).toBe(401);
    });
  });
});
```

### 7.2 Input Validation and Sanitization Tests

```typescript
// tests/security/input-validation.test.ts
describe('Security - Input Validation', () => {
  let authUser: any;
  
  beforeEach(async () => {
    authUser = await createAuthUser();
  });

  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection in routine creation', async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE routines; --",
        "' OR '1'='1",
        "'; INSERT INTO routines (name) VALUES ('hacked'); --",
        "' UNION SELECT * FROM users; --"
      ];
      
      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .post('/api/routines')
          .set('Cookie', await getAuthCookie(authUser))
          .send({
            name: payload,
            category: 'Test',
            goalType: 'schedule_based',
            recurrenceType: 'daily'
          });
        
        // Request should be processed safely (either succeed or fail with validation error)
        expect([200, 201, 400]).toContain(response.status);
        
        // Verify database integrity
        const routinesCheck = await db.select().from(routines).limit(10);
        expect(Array.isArray(routinesCheck)).toBe(true);
      }
    });

    it('should sanitize search parameters', async () => {
      const maliciousQueries = [
        "'; DELETE FROM routines; --",
        "' OR 1=1 --",
        "'; INSERT INTO execution_records (memo) VALUES ('injected'); --"
      ];
      
      for (const query of maliciousQueries) {
        const response = await request(app)
          .get('/api/routines')
          .query({ search: query })
          .set('Cookie', await getAuthCookie(authUser));
        
        expect([200, 400]).toContain(response.status);
      }
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize script tags in routine content', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("XSS")',
        '<svg onload="alert(1)">',
        '"><script>alert(document.cookie)</script>'
      ];
      
      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/routines')
          .set('Cookie', await getAuthCookie(authUser))
          .send({
            name: `Test ${payload}`,
            description: payload,
            category: 'Test',
            goalType: 'schedule_based',
            recurrenceType: 'daily'
          });
        
        if (response.status === 201) {
          // Verify content is properly escaped
          expect(response.body.data.name).not.toContain('<script>');
          expect(response.body.data.description).not.toContain('<script>');
          
          // Should contain escaped version
          expect(response.body.data.name || '').toMatch(/&lt;script&gt;|&lt;img|javascript:/);
        }
      }
    });

    it('should sanitize execution record memos', async () => {
      const routine = await createTestRoutine(authUser.id);
      const xssPayload = '<script>document.location="http://malicious.com"</script>';
      
      const response = await request(app)
        .post('/api/execution-records')
        .set('Cookie', await getAuthCookie(authUser))
        .send({
          routineId: routine.id,
          executedAt: new Date().toISOString(),
          duration: 30,
          memo: xssPayload
        });
      
      if (response.status === 201) {
        expect(response.body.data.memo).not.toContain('<script>');
        expect(response.body.data.memo).toContain('&lt;script&gt;');
      }
    });
  });

  describe('Input Size Limits', () => {
    it('should reject oversized routine names', async () => {
      const oversizedName = 'A'.repeat(1001); // Assuming 1000 char limit
      
      const response = await request(app)
        .post('/api/routines')
        .set('Cookie', await getAuthCookie(authUser))
        .send({
          name: oversizedName,
          category: 'Test',
          goalType: 'schedule_based',
          recurrenceType: 'daily'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('文字数制限');
    });

    it('should reject oversized descriptions', async () => {
      const oversizedDescription = 'A'.repeat(5001); // Assuming 5000 char limit
      
      const response = await request(app)
        .post('/api/routines')
        .set('Cookie', await getAuthCookie(authUser))
        .send({
          name: 'Test Routine',
          description: oversizedDescription,
          category: 'Test',
          goalType: 'schedule_based',
          recurrenceType: 'daily'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('文字数制限');
    });

    it('should reject malformed JSON payloads', async () => {
      const malformedPayloads = [
        '{"name": "test"', // Incomplete JSON
        '{name: "test"}', // Invalid JSON (missing quotes)
        '{"name": "test", "category": }', // Invalid value
        '{"name": null, "category": "test"}' // Null required field
      ];
      
      for (const payload of malformedPayloads) {
        const response = await request(app)
          .post('/api/routines')
          .set('Cookie', await getAuthCookie(authUser))
          .set('Content-Type', 'application/json')
          .send(payload);
        
        expect([400, 422]).toContain(response.status);
      }
    });
  });

  describe('File Upload Security', () => {
    it('should validate file types and sizes (if implemented)', async () => {
      // This test would be relevant if profile image upload is implemented
      const maliciousFiles = [
        { name: 'test.php', content: '<?php system($_GET["cmd"]); ?>' },
        { name: 'test.js', content: 'alert("XSS")' },
        { name: 'large.txt', content: 'A'.repeat(10 * 1024 * 1024) } // 10MB
      ];
      
      for (const file of maliciousFiles) {
        const response = await request(app)
          .post('/api/user-profiles/upload-avatar')
          .set('Cookie', await getAuthCookie(authUser))
          .attach('file', Buffer.from(file.content), file.name);
        
        expect([400, 413, 415]).toContain(response.status); // Bad Request, Payload Too Large, Unsupported Media Type
      }
    });
  });
});
```

### 7.3 Rate Limiting and DoS Protection Tests

```typescript
// tests/security/rate-limiting.test.ts
describe('Security - Rate Limiting & DoS Protection', () => {
  describe('API Rate Limiting', () => {
    it('should limit excessive API requests from single user', async () => {
      const authUser = await createAuthUser();
      const requests = [];
      
      // Send 100 requests rapidly
      for (let i = 0; i < 100; i++) {
        requests.push(
          request(app)
            .get('/api/routines')
            .set('Cookie', await getAuthCookie(authUser))
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      // Some requests should be rate limited
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
      expect(rateLimitedResponses[0].body.error).toContain('レート制限');
    });

    it('should have different limits for different endpoints', async () => {
      const authUser = await createAuthUser();
      
      // Test creation endpoint (should have stricter limits)
      const createRequests = Array.from({ length: 50 }, () =>
        request(app)
          .post('/api/routines')
          .set('Cookie', await getAuthCookie(authUser))
          .send({
            name: 'Rate Test Routine',
            category: 'Test',
            goalType: 'schedule_based',
            recurrenceType: 'daily'
          })
      );
      
      const createResponses = await Promise.all(createRequests);
      const createRateLimited = createResponses.filter(r => r.status === 429);
      
      // Read endpoint should have more lenient limits
      const readRequests = Array.from({ length: 50 }, () =>
        request(app)
          .get('/api/routines')
          .set('Cookie', await getAuthCookie(authUser))
      );
      
      const readResponses = await Promise.all(readRequests);
      const readRateLimited = readResponses.filter(r => r.status === 429);
      
      // Creation should be more strictly limited than reads
      expect(createRateLimited.length).toBeGreaterThan(readRateLimited.length);
    });

    it('should reset rate limits after time window', async () => {
      const authUser = await createAuthUser();
      
      // Hit rate limit
      const firstBatch = Array.from({ length: 100 }, () =>
        request(app)
          .get('/api/routines')
          .set('Cookie', await getAuthCookie(authUser))
      );
      
      await Promise.all(firstBatch);
      
      // Wait for rate limit window to reset (assuming 1 minute window)
      await new Promise(resolve => setTimeout(resolve, 61000));
      
      // Should be able to make requests again
      const response = await request(app)
        .get('/api/routines')
        .set('Cookie', await getAuthCookie(authUser));
      
      expect(response.status).toBe(200);
    });
  });

  describe('Request Size Limiting', () => {
    it('should reject oversized request bodies', async () => {
      const authUser = await createAuthUser();
      const largePayload = {
        name: 'A'.repeat(1024 * 1024), // 1MB name
        category: 'Test',
        goalType: 'schedule_based',
        recurrenceType: 'daily'
      };
      
      const response = await request(app)
        .post('/api/routines')
        .set('Cookie', await getAuthCookie(authUser))
        .send(largePayload);
      
      expect([400, 413]).toContain(response.status); // Bad Request or Payload Too Large
    });

    it('should handle concurrent large requests', async () => {
      const authUser = await createAuthUser();
      const largeDescription = 'A'.repeat(4999); // Just under limit
      
      const requests = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/routines')
          .set('Cookie', await getAuthCookie(authUser))
          .send({
            name: `Large Routine ${i}`,
            description: largeDescription,
            category: 'Test',
            goalType: 'schedule_based',
            recurrenceType: 'daily'
          })
      );
      
      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      
      // Should complete within reasonable time (not hang or crash)
      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds max
      
      // Some responses should succeed
      const successResponses = responses.filter(r => r.status === 201);
      expect(successResponses.length).toBeGreaterThan(0);
    });
  });
});
```

## 不足テストの優先順位

### 🔴 高優先度（即座に実装推奨）
1. **API統合テスト** - 全22エンドポイント（推定工数: 44時間）
2. **セキュリティテスト** - 認証・認可・入力検証（推定工数: 16時間）
3. **エラーハンドリングテスト** - 統一エラー処理（推定工数: 8時間）

### 🟡 中優先度（次のスプリントで実装）
1. **UIコンポーネントテスト** - 36コンポーネント（推定工数: 36時間）
2. **パフォーマンステスト** - 負荷・応答時間テスト（推定工数: 12時間）
3. **データベーステスト** - 制約・トランザクション（推定工数: 8時間）

### 🟢 低優先度（継続的改善として実装）
1. **ブラウザ互換性テスト** - クロスブラウザ動作確認（推定工数: 8時間）
2. **アクセシビリティテスト** - a11y準拠確認（推定工数: 12時間）
3. **国際化テスト** - 多言語対応確認（推定工数: 6時間）

## テスト環境設定

### データベーステスト設定
```typescript
// jest.setup.js
import { setupTestDB, cleanupTestDB } from './test-utils/database';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await cleanupTestDB();
});

beforeEach(async () => {
  await cleanupTestData();
});
```

### モック設定
```typescript
// test-utils/mocks.ts
export const mockSupabaseAuth = {
  getSession: jest.fn(),
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChange: jest.fn()
};

// MSW設定
export const handlers = [
  rest.post('/api/auth/signin', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  })
];
```

## 実装推奨ロードマップ

### Phase 1（Week 1-2）: 基盤テスト強化
- [ ] API統合テスト（認証・ルーチン・ゲーミフィケーション）
- [ ] セキュリティテスト基礎実装
- [ ] エラーハンドリングテスト

### Phase 2（Week 3-4）: コンポーネントテスト
- [ ] 基本UIコンポーネントテスト
- [ ] ゲーミフィケーションコンポーネントテスト
- [ ] ページコンポーネント統合テスト

### Phase 3（Week 5-6）: パフォーマンス・品質保証
- [ ] パフォーマンステスト実装
- [ ] データベーステスト強化
- [ ] テストカバレッジ80%達成

### Phase 4（Week 7-8）: E2E・セキュリティテスト完成
- [ ] E2Eテスト強化・ブラウザ互換性テスト
- [ ] セキュリティテスト完全実装
- [ ] CI/CDパイプライン統合・自動テスト

## 総合テスト戦略サマリー

### 実装優先順位
1. **Phase 1**: API統合テスト + セキュリティテスト基礎 （週1-2）
2. **Phase 2**: UIコンポーネントテスト （週3-4）
3. **Phase 3**: パフォーマンス・データベーステスト （週5-6）
4. **Phase 4**: E2E・セキュリティテスト完成 （週7-8）

### 推定工数総計: **120時間**
- API統合テスト: 44時間
- UIコンポーネントテスト: 36時間
- セキュリティテスト: 16時間
- パフォーマンステスト: 12時間
- データベーステスト: 8時間
- E2Eテスト強化: 4時間

### 品質目標
- **テストカバレッジ**: 80%以上（現在13%）
- **APIレスポンス時間**: 平均100ms以下
- **セキュリティ脆弱性**: 0件（認証・認可・入力検証）
- **E2Eテスト成功率**: 95%以上
- **パフォーマンステスト合格**: 同時100ユーザー対応

### 技術スタック別テスト戦略
- **Next.js App Router**: API Route テスト + RSC テスト
- **TypeScript**: 型安全性テスト + tsc --noEmit
- **Drizzle ORM**: データベーステスト + マイグレーションテスト
- **Supabase**: 認証テスト + RLS テスト
- **Tailwind CSS**: ビジュアル回帰テスト
- **Playwright**: クロスブラウザE2Eテスト

---

*この包括的テスト仕様書により、Routine Record アプリケーションの品質向上と安定性確保を実現し、ユーザー体験の向上を目指します。*