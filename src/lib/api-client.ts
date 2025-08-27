/**
 * API呼び出しクライアント
 * 標準的なHTTP APIクライアント
 */

interface ApiClientOptions {
  timeout?: number;
}

const DEFAULT_TIMEOUT = 10000; // 10秒

/**
 * 標準的なフェッチクライアント
 */
export async function apiClient<T>(
  url: string,
  options: RequestInit & ApiClientOptions = {}
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  // タイムアウト制御
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`API call failed: ${url}`, error);
    throw error;
  }
}

/**
 * MSW環境変数制御
 */
export const shouldUseMSW = (): boolean => {
  return process.env.NODE_ENV === 'development' && 
         process.env.NEXT_PUBLIC_USE_MSW !== 'false';
};