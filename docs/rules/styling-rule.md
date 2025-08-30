# スタイリングルール

## 1. Tailwindカラー指定の統一

### カラー指定パターン
- **テキストカラー**: `text-text-xx` パターンを使用
- **背景カラー**: `bg-bg-xx` パターンを使用
- 直接的なカラー指定（`text-black`、`bg-white`など）は禁止

### 正しいカラー指定例
```typescript
// ✅ 正しい - 統一されたカラーパターン
<div className="bg-bg-primary text-text-primary">
  <h1 className="text-text-secondary">タイトル</h1>
  <p className="text-text-muted bg-bg-secondary">説明文</p>
</div>

// ❌ 間違い - 直接的なカラー指定
<div className="bg-white text-black">
  <h1 className="text-gray-800">タイトル</h1>
  <p className="text-gray-500 bg-gray-100">説明文</p>
</div>
```

### 実装時のチェックポイント
- 全てのテキストカラーは`text-text-*`パターンを使用
- 全ての背景カラーは`bg-bg-*`パターンを使用
- カラーの一貫性を保つ
- ダークモード対応を考慮する

## 2. 品質チェック

### コミット前チェック
- **Tailwindカラー指定がルールに従っていることを確認**
- デザインシステムとの整合性を確認
- ダークモード・ライトモードでの表示確認