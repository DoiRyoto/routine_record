// UUID生成のユーティリティ関数
// crypto.randomUUID()の互換性を確保するため、ポリフィルを提供

export function generateUUID(): string {
  // crypto.randomUUID()が利用可能な場合はそれを使用
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // フォールバック実装: RFC 4122準拠のUUID v4を生成
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
