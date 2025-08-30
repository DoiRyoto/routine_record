/**
 * TASK-101: 認証API実装 - テストファイル (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST as signinPOST } from '../signin/route';
import { POST as signupPOST } from '../signup/route';
import { POST as signoutPOST } from '../signout/route';

// Supabase モックセットアップ
jest.mock('@/lib/supabase/server', () => ({
  supabaseAdmin: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// テストユーティリティ関数
function createMockRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('POST /api/auth/signin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('バリデーション', () => {
    it('有効な email と password で成功する', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      });

      // このテストは実装が完了するまで失敗します
      const response = await signinPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('サインインに成功しました');
    });

    it('email が空文字の場合エラーになる', async () => {
      const request = createMockRequest({
        email: '',
        password: 'password123',
      });

      const response = await signinPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('email');
    });

    it('email形式が不正な場合エラーになる', async () => {
      const request = createMockRequest({
        email: 'invalid-email',
        password: 'password123',
      });

      const response = await signinPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('email');
    });

    it('password が8文字未満の場合エラーになる', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: 'short',
      });

      const response = await signinPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('password');
    });

    it('password が空文字の場合エラーになる', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: '',
      });

      const response = await signinPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('password');
    });
  });

  describe('Supabase認証', () => {
    it('無効な認証情報でエラーになる', async () => {
      const { supabaseAdmin } = require('@/lib/supabase/server');
      supabaseAdmin.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      });

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      const response = await signinPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('認証情報が正しくありません');
    });

    it('ネットワークエラー時に適切なエラーレスポンスを返す', async () => {
      const { supabaseAdmin } = require('@/lib/supabase/server');
      supabaseAdmin.auth.signInWithPassword.mockRejectedValue(
        new Error('Network error')
      );

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      });

      const response = await signinPOST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('一時的なエラーが発生しました。しばらく経ってから再度お試しください');
    });
  });
});

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('新規ユーザーの登録が成功する', async () => {
    const { supabaseAdmin } = require('@/lib/supabase/server');
    supabaseAdmin.auth.signUp.mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'newuser@example.com' },
        session: null,
      },
      error: null,
    });

    const request = createMockRequest({
      email: 'newuser@example.com',
      password: 'password123',
    });

    const response = await signupPOST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('アカウントが作成されました。確認メールをご確認ください。');
  });

  it('既存のメールアドレスでエラーになる', async () => {
    const { supabaseAdmin } = require('@/lib/supabase/server');
    supabaseAdmin.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    });

    const request = createMockRequest({
      email: 'existing@example.com',
      password: 'password123',
    });

    const response = await signupPOST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error).toBe('このメールアドレスは既に登録されています');
  });

  it('バリデーションエラーが正しく処理される', async () => {
    const request = createMockRequest({
      email: 'invalid-email',
      password: 'short',
    });

    const response = await signupPOST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });
});

describe('POST /api/auth/signout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('サインアウトが成功する', async () => {
    const { supabaseAdmin } = require('@/lib/supabase/server');
    supabaseAdmin.auth.signOut.mockResolvedValue({ error: null });

    const request = createMockRequest({});

    const response = await signoutPOST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('サインアウトしました');
  });

  it('サインアウトエラー時も適切にレスポンスを返す', async () => {
    const { supabaseAdmin } = require('@/lib/supabase/server');
    supabaseAdmin.auth.signOut.mockRejectedValue(new Error('Signout error'));

    const request = createMockRequest({});

    const response = await signoutPOST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });
});

describe('Cookie設定テスト', () => {
  it('サインイン時にHTTPOnly Cookieが正しく設定される', async () => {
    const { supabaseAdmin } = require('@/lib/supabase/server');
    supabaseAdmin.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
        },
      },
      error: null,
    });

    const request = createMockRequest({
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await signinPOST(request);

    // Cookieヘッダーの確認
    const setCookieHeader = response.headers.get('set-cookie');
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('SameSite=Lax');
  });

  it('サインアウト時にCookieがクリアされる', async () => {
    const { supabaseAdmin } = require('@/lib/supabase/server');
    supabaseAdmin.auth.signOut.mockResolvedValue({ error: null });

    const request = createMockRequest({});

    const response = await signoutPOST(request);

    const setCookieHeader = response.headers.get('set-cookie');
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader).toContain('Max-Age=0');
  });
});

// セキュリティテスト
describe('セキュリティテスト', () => {
  it('XSSペイロードがサニタイズされる', async () => {
    const request = createMockRequest({
      email: '<script>alert("xss")</script>@example.com',
      password: 'password123',
    });

    const response = await signinPOST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(JSON.stringify(data)).not.toContain('<script>');
  });
});

// パフォーマンステスト
describe('パフォーマンステスト', () => {
  it('サインインのレスポンス時間が500ms以下である', async () => {
    const { supabaseAdmin } = require('@/lib/supabase/server');
    supabaseAdmin.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: { access_token: 'token', refresh_token: 'refresh' },
      },
      error: null,
    });

    const startTime = Date.now();

    const request = createMockRequest({
      email: 'test@example.com',
      password: 'password123',
    });

    await signinPOST(request);

    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(500);
  });
});