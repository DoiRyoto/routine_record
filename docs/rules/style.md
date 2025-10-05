# スタイリング実装ルール

## 1. 基本原則

### カラーシステム
- **Tailwind設定で定義された色のみ使用可能**
- `text-blue-600` や `bg-red-500` などのTailwind標準色は使用不可
- カスタムカラー変数（globals.cssとtailwind.config.tsで定義）を使用する

### コンポーネント優先
- **基本的にUIコンポーネント（components/ui配下）を使用して実装する**
- 直接Tailwindクラスでスタイリングするのは最小限に留める
- 新しいパターンが必要な場合は、UIコンポーネントを作成または拡張する

## 2. 利用可能なカラー

### 基本カラー
```typescript
// tailwind.config.ts で定義されている色のみ使用可能
colors: {
  white: 'var(--white)',      // hsl(0, 0%, 100%)
  black: 'var(--black)',      // hsl(0, 0%, 0%)
  blue: 'var(--blue)',        // hsl(210, 35%, 75%)
  green: 'var(--green)',      // hsl(140, 30%, 75%)
  red: 'var(--red)',          // hsl(0, 35%, 75%)
  yellow: 'var(--yellow)',    // hsl(45, 40%, 75%)
  purple: 'var(--purple)',    // hsl(270, 35%, 75%)
  orange: 'var(--orange)',    // hsl(25, 40%, 75%)
  pink: 'var(--pink)',        // hsl(330, 30%, 75%)
  teal: 'var(--teal)',        // hsl(180, 30%, 75%)
  indigo: 'var(--indigo)',    // hsl(240, 35%, 75%)
  gray: 'var(--gray)',        // hsl(200, 15%, 75%)
}
```

### 濃い色（Deep Colors）
```typescript
"deep-blue": 'var(--deep-blue)',      // hsl(210, 35%, 25%)
"deep-green": 'var(--deep-green)',    // hsl(140, 30%, 25%)
"deep-red": 'var(--deep-red)',        // hsl(0, 35%, 25%)
"deep-yellow": 'var(--deep-yellow)',  // hsl(45, 40%, 25%)
"deep-purple": 'var(--deep-purple)',  // hsl(270, 35%, 25%)
"deep-orange": 'var(--deep-orange)',  // hsl(25, 40%, 25%)
"deep-pink": 'var(--deep-pink)',      // hsl(330, 30%, 25%)
"deep-teal": 'var(--deep-teal)',      // hsl(180, 30%, 25%)
"deep-indigo": 'var(--deep-indigo)',  // hsl(240, 35%, 25%)
"deep-gray": 'var(--deep-gray)',      // hsl(200, 15%, 25%)
```

## 3. カラー使用例

### 正しい使用例
```tsx
// ✅ 正しい - tailwind.config.tsで定義された色を使用
<div className="bg-blue text-white">
<Button variant="primary" className="bg-green">
<p className="text-red">
<Card className="border-gray">

// ✅ 正しい - UIコンポーネントのvariantを使用
<Button variant="primary">
<Button variant="danger">
<Button variant="success">
```

### 間違った使用例
```tsx
// ❌ 間違い - Tailwind標準色は定義されていない
<div className="bg-blue-500">
<p className="text-red-600">
<Card className="border-gray-300">

// ❌ 間違い - カスタム16進数カラーを直接使用
<div className="bg-[#3b82f6]">
<p className="text-[#ef4444]">

// ❌ 間違い - 定義されていない色
<div className="bg-primary">
<p className="text-secondary">
```

## 4. セマンティックカラー（ライトモード/ダークモード対応）

### テキストカラー
```typescript
// ライトモード: 濃い色、ダークモード: 薄い色
text: {
  blue: 'light-dark(var(--deep-blue), var(--blue))',
  green: 'light-dark(var(--deep-green), var(--green))',
  red: 'light-dark(var(--deep-red), var(--red))',
  // ... 以下同様
}
```

### 背景カラー
```typescript
// ライトモード: 薄い色、ダークモード: 濃い色
bg: {
  white: 'light-dark(var(--white), var(--black))',
  black: 'light-dark(var(--black), var(--white))',
  blue: 'light-dark(var(--blue), var(--deep-blue))',
  green: 'light-dark(var(--green), var(--deep-green))',
  // ... 以下同様
}
```

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

### 透明度の指定
```tsx
// ✅ 正しい - 定義された色に透明度を追加
<div className="bg-blue/20">
<p className="text-gray/70">
<div className="border-gray/30">
```

### グラデーション
```tsx
// ✅ 正しい - 定義された色でグラデーション
<div className="bg-gradient-to-r from-blue to-teal">
<div className="bg-gradient-to-b from-purple to-pink">
```

### ホバーやフォーカス
```tsx
// ✅ 正しい - 定義された色でインタラクション
<button className="bg-blue hover:bg-deep-blue">
<input className="border-gray/30 focus:border-blue">
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
3. Tailwind設定の色のみ使用
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
    config: 'tailwind.config.ts',     // Tailwind設定ファイル
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
- [ ] Tailwind設定で定義された色のみ使用している
- [ ] 可能な限りUIコンポーネントを使用している
- [ ] `text-blue-600` などの未定義色を使用していない
- [ ] ダークモード対応が必要な場合、適切に実装している
- [ ] 新しいコンポーネントにはStorybookストーリーがある
- [ ] TypeScript型チェックが通る
- [ ] ESLintエラー・警告がない

### 禁止事項
- ❌ Tailwind標準色（blue-500, red-600など）の使用
- ❌ 16進数カラーコードの直接指定
- ❌ RGBカラーの直接指定
- ❌ 未定義のカスタムカラー名の使用
- ❌ インラインstyle属性でのカラー指定（特別な理由がない限り）

### 推奨事項
- ✅ UIコンポーネントのvariantを優先的に使用
- ✅ 新しいスタイルパターンはUIコンポーネント化
- ✅ 透明度が必要な場合は `/20`, `/50`, `/70` などを使用
- ✅ ダークモード対応は `dark:` プレフィックスで実装
- ✅ Storybookで全バリエーションを確認
- ✅ コミット前に必ず `npm run type-check && npm run lint` を実行
