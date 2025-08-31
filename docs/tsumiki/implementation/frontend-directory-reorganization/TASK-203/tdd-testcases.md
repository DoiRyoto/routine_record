# TASK-203: ユーザー関連コンポーネント移行 - テストケース定義

## テスト戦略

### 1. 移行テスト
移行作業自体の正当性を検証するテストケース

### 2. 機能テスト  
移行後のコンポーネント機能が正常動作することを検証

### 3. 統合テスト
設定ページ全体での統合動作を検証

## 詳細テストケース

### A. 移行完了性テスト

#### A1. ファイル移行の完了性
- **テスト対象**: ファイル移行の完全性
- **検証内容**:
  - `src/model/user/components/profile/ProfileSettings.tsx` が存在する
  - `src/model/user/components/settings/AppSettings.tsx` が存在する
  - `src/model/user/components/profile/__tests__/ProfileSettings.test.tsx` が存在する
  - `src/model/user/components/settings/__tests__/AppSettings.test.tsx` が存在する

#### A2. Import パス更新の完了性
- **テスト対象**: import 文の正しい更新
- **検証内容**:
  - 移行先ファイル内のimport文が新しいパス構造に準拠している
  - 移行されたコンポーネントを使用する箇所のimport文が更新されている
  - 循環依存が発生していない

### B. ProfileSettings コンポーネントテスト

#### B1. 基本表示テスト
```typescript
test('現在のプロフィール情報が正しく表示される', () => {
  const mockUser = {
    displayName: 'テストユーザー',
    email: 'test@example.com',
    avatarUrl: '/images/avatar.jpg'
  };
  
  render(<ProfileSettings user={mockUser} />);
  
  expect(screen.getByDisplayValue('テストユーザー')).toBeInTheDocument();
  expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'アバター' })).toHaveAttribute('src', '/images/avatar.jpg');
});
```

#### B2. プロフィール編集テスト
```typescript
test('表示名変更が正常に動作する', async () => {
  const user = userEvent.setup();
  const mockOnSave = jest.fn();
  
  render(<ProfileSettings user={mockUser} onSave={mockOnSave} />);
  
  const nameInput = screen.getByLabelText('表示名');
  await user.clear(nameInput);
  await user.type(nameInput, '新しい名前');
  await user.click(screen.getByRole('button', { name: '保存' }));
  
  expect(mockOnSave).toHaveBeenCalledWith({
    displayName: '新しい名前'
  });
});
```

#### B3. バリデーションテスト
```typescript
test('必須項目の入力なしでエラーメッセージが表示される', async () => {
  const user = userEvent.setup();
  render(<ProfileSettings user={mockUser} />);
  
  const nameInput = screen.getByLabelText('表示名');
  await user.clear(nameInput);
  await user.tab();
  
  expect(screen.getByText('表示名は必須です')).toBeInTheDocument();
});

test('メールアドレス形式が不正な場合エラーメッセージが表示される', async () => {
  const user = userEvent.setup();
  render(<ProfileSettings user={mockUser} />);
  
  const emailInput = screen.getByLabelText('メールアドレス');
  await user.clear(emailInput);
  await user.type(emailInput, '不正なメール');
  await user.tab();
  
  expect(screen.getByText('正しいメールアドレス形式で入力してください')).toBeInTheDocument();
});
```

#### B4. data-testid 属性テスト
```typescript
test('E2Eテスト用のdata-testid属性が正しく設定されている', () => {
  render(<ProfileSettings user={mockUser} />);
  
  expect(screen.getByTestId('profile-avatar')).toBeInTheDocument();
});
```

### C. AppSettings コンポーネントテスト

#### C1. テーマ切り替えテスト
```typescript
test('テーマ切り替えが即座に反映される', async () => {
  const user = userEvent.setup();
  const mockOnThemeChange = jest.fn();
  
  render(<AppSettings onThemeChange={mockOnThemeChange} />);
  
  await user.click(screen.getByLabelText('ダークモード'));
  
  expect(mockOnThemeChange).toHaveBeenCalledWith('dark');
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
});
```

#### C2. 言語設定テスト
```typescript
test('言語切り替えが正常動作する', async () => {
  const user = userEvent.setup();
  const mockOnLanguageChange = jest.fn();
  
  render(<AppSettings onLanguageChange={mockOnLanguageChange} />);
  
  await user.selectOptions(screen.getByLabelText('言語'), 'en');
  
  expect(mockOnLanguageChange).toHaveBeenCalledWith('en');
});
```

#### C3. 設定保存テスト
```typescript
test('アプリケーション設定の保存が正常動作する', async () => {
  const user = userEvent.setup();
  const mockOnSave = jest.fn();
  
  render(<AppSettings onSave={mockOnSave} />);
  
  await user.click(screen.getByLabelText('12時間形式'));
  await user.click(screen.getByRole('button', { name: '保存' }));
  
  expect(mockOnSave).toHaveBeenCalledWith({
    timeFormat: '12h'
  });
});
```

#### C4. 設定リセットテスト
```typescript
test('デフォルト設定への復元が正常動作する', async () => {
  const user = userEvent.setup();
  const mockOnReset = jest.fn();
  
  render(<AppSettings onReset={mockOnReset} />);
  
  await user.click(screen.getByRole('button', { name: 'デフォルトに戻す' }));
  
  expect(mockOnReset).toHaveBeenCalled();
});
```

### D. 統合テスト

#### D1. 設定ページ統合テスト
```typescript
test('設定ページでプロフィールとアプリ設定が同時に表示される', () => {
  render(
    <SettingsPage>
      <ProfileSettings user={mockUser} />
      <AppSettings />
    </SettingsPage>
  );
  
  expect(screen.getByText('プロフィール設定')).toBeInTheDocument();
  expect(screen.getByText('アプリケーション設定')).toBeInTheDocument();
});
```

#### D2. スタイリングルール準拠テスト
```typescript
test('Tailwind CSSのtext-text-*, bg-bg-*パターンが使用されている', () => {
  const { container } = render(<ProfileSettings user={mockUser} />);
  
  const textElements = container.querySelectorAll('[class*="text-text-"]');
  const bgElements = container.querySelectorAll('[class*="bg-bg-"]');
  
  expect(textElements.length).toBeGreaterThan(0);
  expect(bgElements.length).toBeGreaterThan(0);
});
```

### E. パフォーマンステスト

#### E1. レンダリング性能テスト
```typescript
test('コンポーネントが高速にレンダリングされる', () => {
  const startTime = performance.now();
  render(<ProfileSettings user={mockUser} />);
  const endTime = performance.now();
  
  expect(endTime - startTime).toBeLessThan(100); // 100ms以下
});
```

#### E2. メモ化確認テスト
```typescript
test('不要な再レンダリングが発生しない', () => {
  const renderSpy = jest.fn();
  const TestComponent = React.memo(() => {
    renderSpy();
    return <ProfileSettings user={mockUser} />;
  });
  
  const { rerender } = render(<TestComponent />);
  rerender(<TestComponent />);
  
  expect(renderSpy).toHaveBeenCalledTimes(1);
});
```

### F. エラーハンドリングテスト

#### F1. API エラー処理テスト
```typescript
test('保存APIエラー時に適切なエラーメッセージが表示される', async () => {
  const user = userEvent.setup();
  const mockOnSave = jest.fn().mockRejectedValue(new Error('保存に失敗しました'));
  
  render(<ProfileSettings user={mockUser} onSave={mockOnSave} />);
  
  await user.click(screen.getByRole('button', { name: '保存' }));
  
  expect(await screen.findByText('保存に失敗しました')).toBeInTheDocument();
});
```

## テスト実行計画

### フェーズ1: 単体テスト
1. ProfileSettings コンポーネント単体テスト実行
2. AppSettings コンポーネント単体テスト実行
3. テストカバレッジ 90% 以上確保

### フェーズ2: 統合テスト
1. 設定ページ全体の統合テスト実行
2. 他ページからの設定コンポーネント利用テスト

### フェーズ3: E2Eテスト
1. ブラウザでの実際の設定変更フロー確認
2. data-testid を使用したE2E自動テスト実行

## 品質基準

### 成功基準
- 全テストケースが pass する
- テストカバレッジが 90% 以上
- 実行時間が移行前と同等以下
- メモリ使用量が増加しない

### 失敗基準
- テストが失敗する
- カバレッジが低下する
- パフォーマンスが著しく劣化する
- メモリリークが発生する