# スタイリング実装ルール

## 1. 基本原則

### デザインシステムの構築
- 統一されたカラーパレットを定義する
- コンポーネントベースのスタイリングを優先する
- 直接的なスタイル記述は最小限に留める

### コンポーネント優先アプローチ
- **基本的にUIコンポーネントを使用して実装する**
- 直接Tailwindクラスでスタイリングするのは最小限に留める
- 新しいパターンが必要な場合は、UIコンポーネントを作成または拡張する

## 2. カラーシステム

### カラー定義の原則
- プロジェクト全体で使用する色を明確に定義する
- デフォルトのフレームワーク色は無効化し、独自のパレットを使用する
- セマンティックな色の命名（primary, secondary, danger, successなど）

### 使用可能なカラーの制限
```css
/* ✅ 推奨: プロジェクト定義のカラー */
--color-primary: /* プロジェクト定義 */;
--color-secondary: /* プロジェクト定義 */;
--color-accent: /* プロジェクト定義 */;

/* ❌ 非推奨: フレームワークデフォルト色 */
--color-blue-500;
--color-red-600;
```

### 補助カラーの使用
特定の用途（disabled状態、プレースホルダーなど）のみで使用する補助カラーを定義

```tsx
// ✅ 正しい: 特定用途での使用
<button disabled className="disabled:bg-muted">
<input placeholder="..." className="placeholder:text-muted">
```

## 3. カラー使用のベストプラクティス

### 推奨パターン
```tsx
// ✅ UIコンポーネントのvariantを使用
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="outline">Outline Button</Button>

// ✅ セマンティックなカラー命名
<div className="bg-primary text-on-primary">
<Card className="border-secondary">
```

### 非推奨パターン
```tsx
// ❌ フレームワークデフォルト色の使用
<div className="bg-blue-500">
<p className="text-red-600">

// ❌ 不透明度の過度な使用
<div className="bg-black/60">
<p className="text-white/80">

// ❌ カスタム色の直接指定
<div className="bg-[#3b82f6]">
<p className="text-[#ef4444]">
```

## 4. UIコンポーネントの使用

### Button コンポーネント
```tsx
// variant で色やスタイルを指定
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// size で大きさを指定
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

### Card コンポーネント
```tsx
<Card>
  <CardHeader>
    <CardTitle>タイトル</CardTitle>
    <CardDescription>説明文</CardDescription>
  </CardHeader>
  <CardContent>
    コンテンツ
  </CardContent>
  <CardFooter>
    <Button>アクション</Button>
  </CardFooter>
</Card>
```

### Input コンポーネント
```tsx
<Input type="text" placeholder="入力してください" />
<Input type="email" placeholder="email@example.com" />
<Input type="password" placeholder="••••••••" />
```

### Progress コンポーネント
```tsx
<Progress value={50} />
<Progress value={75} className="h-2" />
<Progress value={100} />
```

## 5. 直接スタイリングが必要な場合

### インタラクション状態
```tsx
// ✅ 推奨: セマンティックなホバー状態
<button className="bg-primary hover:bg-primary-hover">

// ✅ 推奨: フォーカス状態
<input className="border-primary focus:border-primary-focus">
```

### 無効化状態
```tsx
// ✅ 推奨: disabled状態のスタイリング
<button disabled className="disabled:bg-muted disabled:text-muted-foreground">
<input disabled className="disabled:opacity-50">
```

## 6. ダークモード対応

### 基本パターン
```tsx
// ✅ 推奨: dark: プレフィックスで制御
<div className="bg-background dark:bg-background-dark">
<p className="text-foreground dark:text-foreground-dark">
```

### UIコンポーネントは自動対応
```tsx
// ✅ UIコンポーネントは自動的にダークモード対応
<Button variant="primary">自動対応</Button>
<Card>自動対応</Card>
<Input placeholder="自動対応" />
```

## 7. フォントシステム

### フォント定義
```typescript
// フォントファミリーの定義
fontFamily: {
  primary: ['Primary Font', 'system-ui', 'sans-serif'],
  secondary: ['Secondary Font', 'system-ui', 'sans-serif'],
  mono: ['Monospace Font', 'monospace'],
}
```

### フォント使用例
```tsx
<p className="font-primary">Primary Font</p>
<p className="font-secondary">Secondary Font</p>
<code className="font-mono">Monospace Font</code>
```

## 8. 新しいUIコンポーネントの作成

### 作成時のルール
1. `components/ui/` 配下に配置
2. class-variance-authority（cva）を使用してバリアント定義
3. プロジェクト定義の色のみ使用
4. ダークモード対応を含める
5. TypeScript型定義を明確にする
6. Storybookストーリーを作成する

### コンポーネント基本構造
```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/ui-utils';

const componentVariants = cva(
  'base-classes', // 共通クラス
  {
    variants: {
      variant: {
        default: 'bg-primary text-on-primary',
        secondary: 'bg-secondary text-on-secondary',
      },
      size: {
        sm: 'text-sm px-3 py-1',
        default: 'text-base px-4 py-2',
        lg: 'text-lg px-6 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(componentVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Component.displayName = 'Component';

export { Component, componentVariants };
```

## 9. Tailwind CSS品質管理

### Lintプラグインの活用
- クラスの順序を統一
- 重複クラスを検出
- 未定義クラスを警告

### 自動修正
```bash
# Lint実行
npm run lint

# 自動修正
npm run lint:fix
```

### よくある問題と修正
```tsx
// ❌ 間違い: クラスの順序が不適切
<div className="mt-4 flex items-center">

// ✅ 正しい: 自動修正後
<div className="flex items-center mt-4">

// ❌ 間違い: 重複クラス
<div className="text-sm text-sm">

// ✅ 正しい
<div className="text-sm">
```

### cn()、cva()内の検証
```tsx
// cn() での使用
<div className={cn('flex items-center', className)}>

// cva() でのバリアント定義
const variants = cva('base-class', {
  variants: {
    variant: {
      primary: 'bg-primary text-on-primary',
    }
  }
})
```

## 10. レスポンシブデザイン

### ブレークポイントの使用
```tsx
// ✅ 推奨: モバイルファーストアプローチ
<div className="flex flex-col md:flex-row lg:gap-6">
<p className="text-sm md:text-base lg:text-lg">
```

### コンテナとグリッド
```tsx
// ✅ 推奨: レスポンシブグリッド
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

## 11. アニメーションとトランジション

### 基本的なトランジション
```tsx
// ✅ 推奨: シンプルなトランジション
<button className="transition-colors duration-200 hover:bg-primary-hover">
<div className="transition-all duration-300 ease-in-out">
```

### アニメーション定義
```css
/* tailwind.config で定義 */
animation: {
  'fade-in': 'fadeIn 0.3s ease-in',
  'slide-up': 'slideUp 0.3s ease-out',
}
```

## 12. 品質チェック

### スタイリング実装時の確認項目
- [ ] プロジェクト定義のカラーのみ使用している
- [ ] 可能な限りUIコンポーネントを使用している
- [ ] ダークモード対応が必要な場合、適切に実装している
- [ ] 新しいコンポーネントにはStorybookストーリーがある
- [ ] TypeScript型チェックが通る
- [ ] ESLintエラー・警告がない
- [ ] レスポンシブデザインが機能している

### 禁止事項
- ❌ フレームワークデフォルト色の使用（例: blue-500、red-600）
- ❌ 16進数カラーコードの直接指定（例: bg-[#3b82f6]）
- ❌ 過度な不透明度の使用
- ❌ インラインstyle属性でのカラー指定（特別な理由がない限り）

### 推奨事項
- ✅ UIコンポーネントのvariantを優先的に使用
- ✅ 新しいスタイルパターンはUIコンポーネント化
- ✅ セマンティックなカラー命名
- ✅ ダークモード対応は `dark:` プレフィックスで実装
- ✅ Storybookで全バリエーションを確認
- ✅ コミット前に必ず `npm run lint` を実行
