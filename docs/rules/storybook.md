# Storybook実装ルール

## 1. 基本原則

### ファイル配置
- Storyファイルはコンポーネントと同じディレクトリに配置
- 命名規則: `{ComponentName}.stories.tsx`

### 基本構造
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta = {
  title: 'UI/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered', // or 'fullscreen', 'padded'
  },
  tags: ['autodocs'],
  argTypes: {
    // プロパティの設定
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // デフォルトプロパティ
  },
};
```

## 2. UIコンポーネントのStory実装

### Button コンポーネント
- 全てのvariant（primary, secondary, outline, ghost, danger, success, warning, info）をカバー
- 全てのsize（xs, sm, default, lg, xl, icon, icon-sm, icon-lg）をカバー
- disabled状態も含める

### Card コンポーネント
- Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter の組み合わせを表示
- 基本的なレイアウトパターンを複数用意

### Input コンポーネント
- text, password, email, number などの type をカバー
- placeholder, disabled 状態を含める

### Label コンポーネント
- 単体表示
- Input と組み合わせた表示

### Progress コンポーネント
- 0%, 50%, 100% などの進捗状態を表示
- 異なるサイズバリエーション

### Separator コンポーネント
- horizontal と vertical の両方
- 異なる色やスタイル

## 3. Page コンポーネントのStory実装

### 基本構造
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import PageComponent from './PageComponent';

const meta = {
  title: 'Pages/PageName',
  component: PageComponent,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PageComponent>;

export default meta;
type Story = StoryObj<typeof meta>;
```

### データモック
- Page コンポーネントで使用するデータは `src/mocks/data/` から取得
- MSWハンドラーとの整合性を保つ
- スキーマ定義と型を一致させる

### ユーザー状態のモック
```typescript
export const Default: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  // 必要に応じてMSWハンドラーを追加
};
```

## 4. インタラクティブな要素

### Actions
```typescript
argTypes: {
  onClick: { action: 'clicked' },
  onChange: { action: 'changed' },
},
```

### Controls
```typescript
argTypes: {
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'outline'],
  },
  disabled: {
    control: 'boolean',
  },
},
```

## 5. アクセシビリティ

### ARIA属性のテスト
- aria-label, aria-describedby などが適切に設定されているか確認
- キーボードナビゲーションが機能するか確認

### コントラスト比
- 色のコントラスト比が適切か視覚的に確認

## 6. レスポンシブデザイン

### Viewport設定
```typescript
parameters: {
  viewport: {
    defaultViewport: 'mobile1', // or 'tablet', 'desktop'
  },
},
```

### 複数のViewportストーリー
```typescript
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};
```

## 7. ダークモード対応

### テーマ切り替え
```typescript
parameters: {
  backgrounds: {
    default: 'dark',
  },
},
```

## 8. デコレーターの使用

### 共通レイアウト
```typescript
decorators: [
  (Story) => (
    <div style={{ padding: '2rem' }}>
      <Story />
    </div>
  ),
],
```

## 9. 品質チェック

### Storybook起動確認
```bash
npm run storybook
```

### 確認項目
- 全てのストーリーがエラーなく表示される
- インタラクティブな要素が正しく動作する
- レスポンシブデザインが適切に機能する
- アクセシビリティチェックが通る
- TypeScriptエラーがない

## 10. ベストプラクティス

### DO
- コンポーネントの全バリエーションをカバーする
- 実際の使用例に近いストーリーを作成する
- 適切な args と argTypes を設定する
- ドキュメントとして機能するように記述する

### DON'T
- 実装されていない機能のストーリーは作成しない
- 複雑すぎるストーリーは避ける（単一責任の原則）
- Mockデータを直接ストーリー内にハードコードしない
