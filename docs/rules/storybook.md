# Storybook実装ルール

## 1. 基本原則

### Storybookの目的
- コンポーネントの視覚的なカタログを作成する
- 独立した環境でコンポーネントを開発・テストする
- デザインシステムのドキュメントとして機能させる

### ファイル配置
- Storyファイルはコンポーネントと同じディレクトリに配置
- 命名規則: `{ComponentName}.stories.tsx`

## 2. 基本構造

### Story基本テンプレート
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta = {
  title: 'Category/ComponentName',
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

### レイアウトの種類
```typescript
parameters: {
  layout: 'centered',   // コンポーネントを中央配置
  // layout: 'fullscreen', // 全画面表示（ページコンポーネント向け）
  // layout: 'padded',     // パディング付き表示
}
```

## 3. UIコンポーネントのStory実装

### Button コンポーネント例
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基本パターン
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled Button',
    disabled: true,
  },
};
```

### Card コンポーネント例
```typescript
export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};
```

### Input コンポーネント例
```typescript
export const Text: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
};

export const Disabled: Story = {
  args: {
    type: 'text',
    placeholder: 'Disabled input',
    disabled: true,
  },
};
```

## 4. Page コンポーネントのStory実装

### 基本構造
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import PageComponent from './PageComponent';

const meta = {
  title: 'Pages/PageName',
  component: PageComponent,
  parameters: {
    layout: 'fullscreen', // ページは全画面表示
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PageComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // モックデータをpropsとして渡す
  },
};
```

## 5. インタラクティブな要素

### Actions
ユーザーのインタラクションをStorybookで確認する

```typescript
argTypes: {
  onClick: { action: 'clicked' },
  onChange: { action: 'changed' },
  onSubmit: { action: 'submitted' },
},
```

### Controls
プロパティの値を動的に変更する

```typescript
argTypes: {
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'outline'],
  },
  disabled: {
    control: 'boolean',
  },
  size: {
    control: 'radio',
    options: ['sm', 'md', 'lg'],
  },
  label: {
    control: 'text',
  },
},
```

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
  args: {
    // モバイル用のprops
  },
};

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
  args: {
    // デスクトップ用のprops
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

### 複数テーマのストーリー
```typescript
export const LightTheme: Story = {
  parameters: {
    backgrounds: {
      default: 'light',
    },
  },
};

export const DarkTheme: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};
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

### Context Provider
認証やテーマなどのContextが必要なコンポーネント

```typescript
import { AuthProvider } from '@/context/AuthContext';

const meta = {
  title: 'Pages/AuthenticatedPage',
  component: AuthenticatedPage,
  decorators: [
    (Story) => (
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
} satisfies Meta<typeof AuthenticatedPage>;
```

### 複数のProvider
```typescript
decorators: [
  (Story) => (
    <ThemeProvider>
      <AuthProvider>
        <Story />
      </AuthProvider>
    </ThemeProvider>
  ),
],
```

## 9. モックデータの使用

### データソースの統一
```typescript
// モックデータのインポート
import { mockItems } from '@/mocks/data/items';

export const WithData: Story = {
  args: {
    items: mockItems,
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};
```

### 複数の状態を表現
```typescript
export const Loading: Story = {
  args: {
    isLoading: true,
    items: [],
  },
};

export const Error: Story = {
  args: {
    isLoading: false,
    error: 'Failed to load items',
    items: [],
  },
};

export const Success: Story = {
  args: {
    isLoading: false,
    items: mockItems,
  },
};
```

## 10. アクセシビリティ

### ARIA属性のテスト
- aria-label, aria-describedby などが適切に設定されているか確認
- キーボードナビゲーションが機能するか確認

### アクセシビリティアドオン
```typescript
// .storybook/main.ts
export default {
  addons: [
    '@storybook/addon-a11y', // アクセシビリティチェック
  ],
};
```

## 11. ドキュメント生成

### JSDoc コメント
```typescript
/**
 * Primary UI component for user interaction
 */
export const Button = ({ variant = 'primary', size = 'default', ...props }) => {
  // ...
};
```

### MDX形式のドキュメント
```mdx
import { Meta, Story } from '@storybook/blocks';
import { Button } from './Button';

<Meta title="UI/Button" component={Button} />

# Button

Primary UI component for user interaction.

<Story of={Button} />
```

## 12. 品質チェック

### Storybook起動確認
```bash
npm run storybook
```

### 確認項目
- [ ] 全てのストーリーがエラーなく表示される
- [ ] インタラクティブな要素が正しく動作する
- [ ] レスポンシブデザインが適切に機能する
- [ ] ダークモード対応が機能している
- [ ] アクセシビリティチェックが通る
- [ ] TypeScriptエラーがない

## 13. ベストプラクティス

### DO（推奨事項）
- コンポーネントの全バリエーションをカバーする
- 実際の使用例に近いストーリーを作成する
- 適切な args と argTypes を設定する
- ドキュメントとして機能するように記述する
- モックデータを適切に活用する

### DON'T（非推奨事項）
- 複雑すぎるストーリーは避ける（単一責任の原則）
- Mockデータを直接ストーリー内にハードコードしない
- 実装されていない機能のストーリーは作成しない
- 過度に抽象化しすぎない

## 14. よくあるパターン

### フォームコンポーネント
```typescript
export const LoginForm: Story = {
  render: () => (
    <form>
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Button type="submit">Login</Button>
    </form>
  ),
};
```

### リストコンポーネント
```typescript
export const ItemList: Story = {
  args: {
    items: mockItems,
    onItemClick: (id: string) => console.log(`Item ${id} clicked`),
  },
};

export const EmptyList: Story = {
  args: {
    items: [],
  },
};
```

### 条件付きレンダリング
```typescript
export const WithOptionalContent: Story = {
  args: {
    showHeader: true,
    showFooter: false,
    content: 'Main content',
  },
};
```
