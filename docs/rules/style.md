# スタイリング実装ルール

## 1. 基本原則

### カラーシステム
- **白（white）と黒（black）のみを使用**
- **不透明度（opacity）は使用禁止**
  - `text-black/60`、`bg-white/20`、`opacity-*`などは使用不可
- **gray は disabled 状態などの特定の用途でのみ使用可能**
- Tailwind CSS v4の@theme機能により、`--color-*: initial;`でデフォルト色を無効化
- `text-blue-600` や `bg-red-500` などのTailwind標準色は使用不可

### コンポーネント優先
- **基本的にUIコンポーネント（components/ui配下）を使用して実装する**
- 直接Tailwindクラスでスタイリングするのは最小限に留める
- 新しいパターンが必要な場合は、UIコンポーネントを作成または拡張する

## 2. 利用可能なカラー

### 基本カラー（主要）
```css
/* 白と黒のみ使用 */
--color-white: var(--white);      /* hsl(0, 0%, 100%) - #ffffff */
--color-black: var(--black);      /* hsl(0, 0%, 0%) - #000000 */
```

### 補助カラー（特定用途のみ）
```css
/* disabled状態などの特定用途でのみ使用可能 */
--color-gray: var(--gray);        /* hsl(200, 15%, 75%) */
```

### 廃止されたカラー（使用禁止）
以下の色は定義されていますが、使用禁止です：
```css
/* ❌ 使用禁止 - 白と黒のみ使用 */
--color-blue、--color-green、--color-red、--color-yellow、
--color-purple、--color-orange、--color-pink、--color-teal、
--color-indigo、--color-deep-*系すべて
```

## 3. カラー使用例

### 正しい使用例
```tsx
// ✅ 正しい - 白と黒のみ使用
<div className="bg-black text-white dark:bg-white dark:text-black">
<Button variant="primary">Primary Button</Button>
<p className="text-black dark:text-white">Text</p>
<Card className="border-black dark:border-white">

// ✅ 正しい - disabled状態でgrayを使用
<Button disabled className="disabled:bg-gray">
<Input disabled className="disabled:text-gray">

// ✅ 正しい - UIコンポーネントのvariantを使用
<Button variant="primary">
<Button variant="outline">
<Button variant="ghost">
```

### 間違った使用例
```tsx
// ❌ 間違い - 不透明度の使用
<div className="bg-black/60">
<p className="text-white/80">
<div className="opacity-50">

// ❌ 間違い - 白黒以外の色の使用
<div className="bg-blue">
<p className="text-red">
<Card className="border-green">

// ❌ 間違い - Tailwind標準色
<div className="bg-blue-500">
<p className="text-red-600">
<Card className="border-gray-300">

// ❌ 間違い - カスタム16進数カラーを直接使用
<div className="bg-[#3b82f6]">
<p className="text-[#ef4444]">
```

## 4. カラーの使用方法

### Tailwind CSS v4での使用
- `@theme`ブロックで定義した色は、`bg-*`、`text-*`、`border-*`などのユーティリティクラスとして使用できる
- 例: `bg-blue`、`text-red`、`border-gray`
- デフォルトのTailwind色（`blue-500`など）は使用できない

## 5. UIコンポーネントの使用

### Button
```tsx
// variant で色を指定
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="info">Info</Button>

// size で大きさを指定
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

### Card
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

### Input
```tsx
<Input type="text" placeholder="入力してください" />
<Input type="email" placeholder="email@example.com" />
<Input type="password" placeholder="••••••••" />
<Input type="number" />
```

### Progress
```tsx
<Progress value={50} />
<Progress value={75} className="h-2" />
<Progress value={100} className="h-5" />
```

## 6. 直接スタイリングが必要な場合

### ホバーやフォーカス
```tsx
// ✅ 正しい - 白黒でインタラクション
<button className="bg-black text-white hover:bg-white hover:text-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white">
<input className="border-black focus:border-black dark:border-white dark:focus:border-white">

// ✅ 正しい - grayを使った控えめなホバー
<div className="hover:bg-gray">
```

### 無効化状態
```tsx
// ✅ 正しい - grayを使った無効化
<button disabled className="disabled:bg-gray">
<input disabled className="disabled:text-gray">
```

## 7. ダークモード対応

### 基本パターン
```tsx
// ✅ 正しい - dark: プレフィックスで制御
<div className="bg-white dark:bg-black">
<p className="text-gray dark:text-white">
<Card className="border-gray/20 dark:border-gray/10">
```

### UIコンポーネントは自動対応
```tsx
// ✅ UIコンポーネントは自動的にダークモード対応
<Button variant="primary">自動対応</Button>
<Card>自動対応</Card>
<Input placeholder="自動対応" />
```

## 8. フォント

### 利用可能なフォント
```typescript
fontFamily: {
  japanese: ['var(--font-noto-sans-jp)', 'system-ui', 'sans-serif'],
  english: ['var(--font-roboto)', 'system-ui', 'sans-serif'],
  sans: ['var(--font-noto-sans-jp)', 'var(--font-roboto)', 'system-ui', 'sans-serif'],
}
```

### フォント使用例
```tsx
<p className="font-japanese">日本語テキスト</p>
<p className="font-english">English Text</p>
<p className="font-sans">Mixed 混合テキスト</p>
```

## 9. 新しいUIコンポーネントの作成

### 作成時のルール
1. `src/components/ui/` 配下に配置
2. class-variance-authority（cva）を使用してバリアント定義
3. globals.cssの@themeで定義された色のみ使用
4. ダークモード対応を含める
5. TypeScript型定義を明確にする
6. Storybookストーリーを作成する

### コンポーネント例
```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/ui-utils';

const componentVariants = cva(
  'base-classes', // 共通クラス
  {
    variants: {
      variant: {
        default: 'bg-blue text-white',
        success: 'bg-green text-white',
        danger: 'bg-red text-white',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        default: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
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

## 10. Tailwind CSSの品質管理（eslint-plugin-better-tailwindcss）

### プラグインの導入
このプロジェクトでは`eslint-plugin-better-tailwindcss`を使用してTailwind CSSの品質を自動的に管理しています。

**参考:**
- [eslint-plugin-better-tailwindcss](https://github.com/schoero/eslint-plugin-better-tailwindcss)
- [Tailwind CSSの未定義クラスを検出するESLintプラグイン](https://zenn.dev/chot/articles/ddea76b29e60f2)

### 主な機能
1. **クラスの順序統一**: Tailwindクラスを一貫した順序で自動整列
2. **重複クラスの検出**: 同じクラスの重複を検出してエラー表示
3. **未定義クラスの警告**: カスタム設定にないクラスを使用すると警告

### 設定内容（eslint.config.mjs）
```javascript
plugins: {
  'better-tailwindcss': betterTailwindcss,
},
rules: {
  'better-tailwindcss/sort-classes': 'warn',        // クラスの順序
  'better-tailwindcss/no-duplicate-classes': 'error', // 重複検出
},
settings: {
  'better-tailwindcss': {
    callees: ['cn', 'cva', 'clsx'],  // 関数内のクラスも検証
    entryPoint: 'src/app/globals.css', // CSSエントリポイント
  },
}
```

### 自動修正
多くの問題は自動修正可能です:
```bash
# 自動修正を実行
npm run lint:fix
```

### 検出される問題例
```tsx
// ❌ 間違い - クラスの順序が不適切
<div className="mt-4 flex items-center">

// ✅ 正しい - 自動修正後
<div className="flex items-center mt-4">

// ❌ 間違い - 重複クラス
<div className="text-sm text-sm">

// ✅ 正しい
<div className="text-sm">
```

### cn()、cva()、clsx()内の検証
このプラグインは以下の関数内のクラスも検証します:
```tsx
// cn() での使用
<div className={cn('flex items-center', className)}>

// cva() でのバリアント定義
const variants = cva('base-class', {
  variants: {
    variant: {
      primary: 'bg-blue text-white',
    }
  }
})
```

### 現在のLint実行コマンド
```bash
# 問題を検出
npm run lint

# 自動修正を実行
npm run lint:fix

# 型チェックとLintの両方を実行
npm run type-check && npm run lint
```

## 11. 品質チェック

### スタイリング実装時の確認項目
- [ ] 白（white）と黒（black）のみを使用している
- [ ] 不透明度（`/数値`、`opacity-*`）を使用していない
- [ ] grayはdisabled状態などの特定用途でのみ使用している
- [ ] 可能な限りUIコンポーネントを使用している
- [ ] ダークモード対応が必要な場合、適切に実装している
- [ ] 新しいコンポーネントにはStorybookストーリーがある
- [ ] TypeScript型チェックが通る
- [ ] ESLintエラー・警告がない

### 禁止事項
- ❌ 白黒以外の色の使用（blue、red、greenなど全て禁止）
- ❌ 不透明度の使用（`text-black/60`、`bg-white/20`、`opacity-*`など）
- ❌ Tailwind標準色（blue-500、red-600など）の使用
- ❌ 16進数カラーコードの直接指定
- ❌ RGBカラーの直接指定
- ❌ インラインstyle属性でのカラー指定（特別な理由がない限り）

### 推奨事項
- ✅ UIコンポーネントのvariantを優先的に使用
- ✅ 新しいスタイルパターンはUIコンポーネント化
- ✅ 白と黒のコントラストを活用したデザイン
- ✅ ダークモード対応は `dark:` プレフィックスで実装
- ✅ Storybookで全バリエーションを確認
- ✅ コミット前に必ず `npm run type-check && npm run lint` を実行
