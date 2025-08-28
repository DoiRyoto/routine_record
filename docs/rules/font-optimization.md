# フォント最適化ルール

## 1. フォント設定

### 使用フォント
- **日本語**: Noto Sans JP
- **英語**: Roboto
- **フォールバック**: system-ui, -apple-system, sans-serif

### Next.js フォント設定
```typescript
// src/app/layout.tsx
import { Noto_Sans_JP, Roboto } from 'next/font/google';

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap', // パフォーマンス最適化
});

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap', // パフォーマンス最適化
});
```

## 2. パフォーマンス最適化

### preconnect設定
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```

### CSS最適化
```css
body {
  font-display: swap;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@font-face {
  font-family: 'Noto Sans JP';
  font-display: swap;
}

@font-face {
  font-family: 'Roboto';
  font-display: swap;
}
```

## 3. Tailwind CSS設定

### フォントファミリー設定
```typescript
// tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      japanese: ['var(--font-noto-sans-jp)', 'system-ui', 'sans-serif'],
      english: ['var(--font-roboto)', 'system-ui', 'sans-serif'],
      sans: ['var(--font-noto-sans-jp)', 'var(--font-roboto)', 'system-ui', '-apple-system', 'sans-serif'],
    },
  },
}
```

### クラス使用例
```typescript
// 日本語フォントを指定
<div className="font-japanese">日本語テキスト</div>

// 英語フォントを指定
<div className="font-english">English Text</div>

// デフォルト（両言語対応）
<div>Mixed 日本語 and English text</div>
```

## 4. パフォーマンス原則

### フォント読み込み
- `display: 'swap'` を必ず指定
- 必要最小限のweight指定
- preconnectでDNS解決を高速化

### レンダリング最適化
- `text-rendering: optimizeLegibility` で可読性向上
- `antialiased` でフォント表示を滑らかに
- fallbackフォントで読み込み前の表示を確保

## 5. 実装チェックリスト

### 必須項目
- [ ] Next.js Google Fontsでフォント定義
- [ ] `display: 'swap'` 設定
- [ ] preconnect設定
- [ ] CSS最適化プロパティ追加
- [ ] Tailwind設定更新
- [ ] TypeScript・Lint エラーチェック

### パフォーマンス確認
- [ ] フォント読み込み時間確認
- [ ] FOUT（Flash of Unstyled Text）対策
- [ ] fallbackフォント表示確認