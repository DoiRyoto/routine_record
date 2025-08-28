import { z } from 'zod';

// API呼び出し時のエラー
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// 型安全なfetchクライアント
export async function typedFetch<T>(
  url: string,
  schema: z.ZodSchema<T>,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new APIError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    const text = await response.text();
    let jsonData: unknown;

    try {
      jsonData = JSON.parse(text);
    } catch {
      throw new APIError(
        `Invalid JSON response: ${text.slice(0, 100)}`,
        response.status,
        text
      );
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

// GET リクエスト用のヘルパー
export async function typedGet<T>(
  url: string,
  schema: z.ZodSchema<T>
): Promise<T> {
  return typedFetch(url, schema, {
    method: 'GET',
  });
}

// POST リクエスト用のヘルパー
export async function typedPost<T>(
  url: string,
  schema: z.ZodSchema<T>,
  data?: unknown
): Promise<T> {
  return typedFetch(url, schema, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PUT リクエスト用のヘルパー
export async function typedPut<T>(
  url: string,
  schema: z.ZodSchema<T>,
  data?: unknown
): Promise<T> {
  return typedFetch(url, schema, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// DELETE リクエスト用のヘルパー
export async function typedDelete<T>(
  url: string,
  schema: z.ZodSchema<T>
): Promise<T> {
  return typedFetch(url, schema, {
    method: 'DELETE',
  });
}

// PATCH リクエスト用のヘルパー
export async function typedPatch<T>(
  url: string,
  schema: z.ZodSchema<T>,
  data?: unknown
): Promise<T> {
  return typedFetch(url, schema, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}