import { cookies } from 'next/headers';
import { z } from 'zod';

import { APIError } from './fetch-client';

// サーバーサイド用の型安全なfetchクライアント
export async function serverTypedFetch<T>(
  url: string,
  schema: z.ZodSchema<T>,
  options?: RequestInit
): Promise<T> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // サーバーサイドでは相対URLを絶対URLに変換
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new APIError(`HTTP error! status: ${response.status}`, response.status);
    }

    const text = await response.text();
    let jsonData: unknown;

    try {
      jsonData = JSON.parse(text);
    } catch {
      throw new APIError(`Invalid JSON response: ${text.slice(0, 100)}`, response.status, text);
    }

    // Zodでバリデーション
    const result = schema.safeParse(jsonData);

    if (!result.success) {
      console.error('API Response validation failed:', {
        url,
        status: response.status,
        data: jsonData,
        errors: result.error.issues,
      });

      throw new APIError(
        `API Response validation failed: ${result.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
        response.status,
        jsonData
      );
    }

    return result.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // ネットワークエラーなど
    throw new APIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    );
  }
}

// サーバーサイド用のGETリクエストヘルパー
export async function serverTypedGet<T>(url: string, schema: z.ZodSchema<T>): Promise<T> {
  return serverTypedFetch(url, schema, {
    method: 'GET',
  });
}

// サーバーサイド用のPOSTリクエストヘルパー
export async function serverTypedPost<T>(
  url: string,
  schema: z.ZodSchema<T>,
  data?: unknown
): Promise<T> {
  return serverTypedFetch(url, schema, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}
