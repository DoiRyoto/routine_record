# ユーザー設定管理API テストケース設計書
## TASK-105: ユーザー設定API実装

### 1. テスト概要

本書は、ユーザー設定管理APIの包括的なテストケースを定義する。TDD手法に基づき、実装前にテストを作成し、品質保証を徹底する。

### 2. テスト対象

#### 2.1 ユースケース
- `GetUserSettingsUseCase`
- `UpdateUserSettingsUseCase`

#### 2.2 エンティティ・値オブジェクト
- `UserSettings` エンティティ
- `UserSettingsId` 値オブジェクト

### 3. GetUserSettingsUseCase テストケース

#### 3.1 正常系テストケース

**TC001: 既存設定の正常取得**
```typescript
// テスト内容: 既に設定が存在するユーザーの設定を正常に取得する
// 前提条件: ユーザー設定がデータベースに存在
// 実行: GetUserSettingsUseCase.execute({ userId })
// 期待結果: 既存設定が正しく返却される
```

**TC002: 非存在設定の自動作成と取得**
```typescript
// テスト内容: 設定が存在しないユーザーのデフォルト設定を自動作成・取得する
// 前提条件: ユーザー設定がデータベースに存在しない
// 実行: GetUserSettingsUseCase.execute({ userId })
// 期待結果: 
//   - デフォルト値で新規設定が作成される
//   - theme='auto', language='ja', timeFormat='24h'
//   - 作成された設定が返却される
```

#### 3.2 境界値テストケース

**TC003: 有効なUUID形式のユーザーID**
```typescript
// テスト内容: 正しいUUID形式のユーザーIDで正常動作を確認
// 実行: 標準UUID形式でリクエスト
// 期待結果: 正常に処理される
```

#### 3.3 異常系テストケース

**TC004: 無効なユーザーID形式**
```typescript
// テスト内容: UUID形式ではないユーザーIDでエラーになることを確認
// 実行: 無効な形式のユーザーIDでリクエスト
// 期待結果: ValidationErrorがスローされる
```

**TC005: 空のユーザーID**
```typescript
// テスト内容: 空文字列のユーザーIDでエラーになることを確認
// 実行: 空文字列のユーザーIDでリクエスト
// 期待結果: ValidationErrorがスローされる
```

### 4. UpdateUserSettingsUseCase テストケース

#### 4.1 正常系テストケース

**TC006: theme設定の更新**
```typescript
// テスト内容: themeフィールドのみ更新する
// 前提条件: 既存設定が存在
// 実行: UpdateUserSettingsUseCase.execute({ userId, theme: 'dark' })
// 期待結果: 
//   - themeが'dark'に更新される
//   - 他のフィールドは変更されない
//   - updatedAtが更新される
```

**TC007: language設定の更新**
```typescript
// テスト内容: languageフィールドのみ更新する
// 前提条件: 既存設定が存在
// 実行: UpdateUserSettingsUseCase.execute({ userId, language: 'en' })
// 期待結果: 
//   - languageが'en'に更新される
//   - 他のフィールドは変更されない
//   - updatedAtが更新される
```

**TC008: timeFormat設定の更新**
```typescript
// テスト内容: timeFormatフィールドのみ更新する
// 前提条件: 既存設定が存在
// 実行: UpdateUserSettingsUseCase.execute({ userId, timeFormat: '12h' })
// 期待結果: 
//   - timeFormatが'12h'に更新される
//   - 他のフィールドは変更されない
//   - updatedAtが更新される
```

**TC009: 複数フィールド同時更新**
```typescript
// テスト内容: 複数のフィールドを同時に更新する
// 前提条件: 既存設定が存在
// 実行: UpdateUserSettingsUseCase.execute({ 
//   userId, 
//   theme: 'light', 
//   language: 'en', 
//   timeFormat: '12h' 
// })
// 期待結果: 
//   - 全ての指定フィールドが更新される
//   - updatedAtが更新される
```

**TC010: 設定が存在しない場合の自動作成と更新**
```typescript
// テスト内容: 設定が存在しないユーザーに対して更新を実行し、自動作成される
// 前提条件: ユーザー設定が存在しない
// 実行: UpdateUserSettingsUseCase.execute({ userId, theme: 'dark' })
// 期待結果: 
//   - デフォルト値で設定が自動作成される
//   - 指定されたthemeが適用される
//   - 他のフィールドはデフォルト値
```

#### 4.2 境界値テストケース

**TC011: theme境界値テスト**
```typescript
// テスト内容: theme値の有効な選択肢をすべてテストする
// 実行: 'light', 'dark', 'auto' の各値で更新
// 期待結果: 全ての値で正常に更新される
```

**TC012: language境界値テスト**
```typescript
// テスト内容: language値の有効な選択肢をすべてテストする
// 実行: 'ja', 'en' の各値で更新
// 期待結果: 全ての値で正常に更新される
```

**TC013: timeFormat境界値テスト**
```typescript
// テスト内容: timeFormat値の有効な選択肢をすべてテストする
// 実行: '12h', '24h' の各値で更新
// 期待結果: 全ての値で正常に更新される
```

#### 4.3 異常系テストケース

**TC014: 無効なtheme値**
```typescript
// テスト内容: 無効なtheme値でエラーになることを確認
// 実行: UpdateUserSettingsUseCase.execute({ userId, theme: 'invalid' })
// 期待結果: UserSettingsInvalidThemeErrorがスローされる
```

**TC015: 無効なlanguage値**
```typescript
// テスト内容: 無効なlanguage値でエラーになることを確認
// 実行: UpdateUserSettingsUseCase.execute({ userId, language: 'invalid' })
// 期待結果: UserSettingsInvalidLanguageErrorがスローされる
```

**TC016: 無効なtimeFormat値**
```typescript
// テスト内容: 無効なtimeFormat値でエラーになることを確認
// 実行: UpdateUserSettingsUseCase.execute({ userId, timeFormat: 'invalid' })
// 期待結果: UserSettingsInvalidTimeFormatErrorがスローされる
```

**TC017: 空のリクエスト**
```typescript
// テスト内容: 更新フィールドが指定されていない場合のエラー確認
// 実行: UpdateUserSettingsUseCase.execute({ userId })
// 期待結果: UserSettingsEmptyUpdateErrorがスローされる
```

**TC018: 無効なユーザーID**
```typescript
// テスト内容: 無効なユーザーID形式でエラーになることを確認
// 実行: 無効なユーザーIDで更新実行
// 期待結果: ValidationErrorがスローされる
```

### 5. UserSettings エンティティテストケース

#### 5.1 インスタンス作成テスト

**TC019: 正常なエンティティ作成**
```typescript
// テスト内容: 有効なパラメータでUserSettingsインスタンスが作成される
// 実行: new UserSettings(validParameters)
// 期待結果: インスタンスが正常に作成される
```

**TC020: デフォルト値でのエンティティ作成**
```typescript
// テスト内容: デフォルト値でUserSettingsインスタンスが作成される
// 実行: UserSettings.createDefault(userId)
// 期待結果: デフォルト値でインスタンスが作成される
```

#### 5.2 更新メソッドテスト

**TC021: theme更新メソッド**
```typescript
// テスト内容: updateTheme()メソッドが正常動作する
// 実行: userSettings.updateTheme('dark')
// 期待結果: themeが更新され、updatedAtが更新される
```

**TC022: language更新メソッド**
```typescript
// テスト内容: updateLanguage()メソッドが正常動作する
// 実行: userSettings.updateLanguage('en')
// 期待結果: languageが更新され、updatedAtが更新される
```

**TC023: timeFormat更新メソッド**
```typescript
// テスト内容: updateTimeFormat()メソッドが正常動作する
// 実行: userSettings.updateTimeFormat('12h')
// 期待結果: timeFormatが更新され、updatedAtが更新される
```

#### 5.3 バリデーションテスト

**TC024: 無効なtheme値でのエンティティ作成拒否**
```typescript
// テスト内容: 無効なtheme値でエンティティ作成が拒否される
// 実行: new UserSettings({ ..., theme: 'invalid' })
// 期待結果: UserSettingsInvalidThemeErrorがスローされる
```

### 6. UserSettingsId 値オブジェクトテストケース

#### 6.1 正常系テスト

**TC025: 有効なUUIDでのインスタンス作成**
```typescript
// テスト内容: 有効なUUID文字列でUserSettingsIdが作成される
// 実行: new UserSettingsId(validUuid)
// 期待結果: インスタンスが正常に作成される
```

**TC026: UUIDの生成**
```typescript
// テスト内容: UserSettingsId.generate()が有効なUUIDを生成する
// 実行: UserSettingsId.generate()
// 期待結果: 有効なUUID形式のインスタンスが作成される
```

#### 6.2 異常系テスト

**TC027: 無効なUUID形式での作成拒否**
```typescript
// テスト内容: 無効なUUID形式でインスタンス作成が拒否される
// 実行: new UserSettingsId('invalid-uuid')
// 期待結果: エラーがスローされる
```

**TC028: 空文字列での作成拒否**
```typescript
// テスト内容: 空文字列でインスタンス作成が拒否される
// 実行: new UserSettingsId('')
// 期待結果: エラーがスローされる
```

### 7. テストデータ定義

#### 7.1 正常テストデータ

```typescript
export const validUserId = '550e8400-e29b-41d4-a716-446655440000';
export const validUserSettingsId = '550e8400-e29b-41d4-a716-446655440001';

export const defaultUserSettings = {
  id: validUserSettingsId,
  userId: validUserId,
  theme: 'auto' as const,
  language: 'ja' as const,
  timeFormat: '24h' as const,
  createdAt: new Date('2025-08-30T00:00:00Z'),
  updatedAt: new Date('2025-08-30T00:00:00Z')
};

export const customUserSettings = {
  id: validUserSettingsId,
  userId: validUserId,
  theme: 'dark' as const,
  language: 'en' as const,
  timeFormat: '12h' as const,
  createdAt: new Date('2025-08-30T00:00:00Z'),
  updatedAt: new Date('2025-08-30T01:00:00Z')
};
```

#### 7.2 異常テストデータ

```typescript
export const invalidUserIds = [
  'invalid-uuid',
  '12345',
  '',
  null,
  undefined
];

export const invalidThemes = [
  'invalid',
  'bright',
  'system',
  '',
  null,
  123
];

export const invalidLanguages = [
  'invalid',
  'fr',
  'zh',
  '',
  null,
  123
];

export const invalidTimeFormats = [
  'invalid',
  '24hour',
  '12hour',
  '',
  null,
  123
];
```

### 8. モック設定

#### 8.1 Repository Mock

```typescript
export const mockUserSettingsRepository: IUserSettingsRepository = {
  findByUserId: jest.fn(),
  save: jest.fn(),
  create: jest.fn()
};
```

#### 8.2 モック動作定義

```typescript
// 設定存在パターン
mockUserSettingsRepository.findByUserId
  .mockResolvedValue(existingUserSettings);

// 設定非存在パターン  
mockUserSettingsRepository.findByUserId
  .mockResolvedValue(null);

// 保存成功パターン
mockUserSettingsRepository.save
  .mockResolvedValue(void 0);

// 作成成功パターン
mockUserSettingsRepository.create
  .mockResolvedValue(newUserSettings);
```

### 9. テスト実行計画

#### 9.1 単体テスト実行順序
1. UserSettingsId 値オブジェクト（TC025-028）
2. UserSettings エンティティ（TC019-024）
3. GetUserSettingsUseCase（TC001-005）
4. UpdateUserSettingsUseCase（TC006-018）

#### 9.2 統合テストポイント
- データベース連携テスト
- トランザクション整合性テスト
- エラーハンドリング統合テスト

### 10. 品質メトリクス

#### 10.1 カバレッジ目標
- **行カバレッジ**: 100%
- **分岐カバレッジ**: 100%
- **関数カバレッジ**: 100%

#### 10.2 テストケース分布
- **正常系**: 14ケース (50%)
- **境界値**: 6ケース (21.4%)
- **異常系**: 8ケース (28.6%)
- **合計**: 28ケース

### 11. 実装チェックリスト

#### 11.1 テストファイル作成
- [ ] `UserSettingsId.test.ts`
- [ ] `UserSettings.test.ts` 
- [ ] `GetUserSettingsUseCase.test.ts`
- [ ] `UpdateUserSettingsUseCase.test.ts`

#### 11.2 テストデータ・Mock作成
- [ ] テストデータファイル作成
- [ ] モックRepository作成
- [ ] テストヘルパー関数作成

#### 11.3 テスト実行確認
- [ ] 全テストケース実装済み
- [ ] 全テスト実行でRED（失敗）確認
- [ ] テストカバレッジ計測設定

---

**総テストケース数**: 28ケース
**予想実装時間**: 3-4時間
**テスト実行時間**: < 5秒（全ケース）