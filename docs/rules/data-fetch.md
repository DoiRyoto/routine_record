# データフェッチ実装ルール

## 1. アーキテクチャ概要

このプロジェクトではBFF（Backend for Frontend）パターンを採用し、厳格なレイヤー分離を実施しています。

### レイヤー構成
```
┌─────────────────────────────────────┐
│  UI Layer (Components)              │
│  - Client Components                │
│  - Page Components (Server)         │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  Data Fetch Layer                   │
│  - Server Actions (src/lib/actions) │
│  - serverTypedGet/Post              │
│  - fetch (Client)                   │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  API Layer (app/api)                │
│  - 認証チェック                      │
│  - バリデーション                    │
│  - ビジネスロジック                  │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  Database Layer (lib/db/queries)    │
│  - 純粋なデータ操作                  │
│  - 型安全性                          │
└─────────────────────────────────────┘
```

## 2. Server Actions

### 配置場所
- ✅ **推奨:** `src/lib/actions/` 配下
- ❌ **禁止:** `src/app/actions/` 配下

### 実装パターン

#### 基本構造
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { serverTypedPost } from '@/lib/api-client/server-fetch';
import { ResponseSchema } from '@/lib/schemas/api-response';

export async function someAction(data: SomeData) {
  try {
    // API Routes経由でデータ操作
    const result = await serverTypedPost(
      '/api/resource',
      ResponseSchema,
      data
    );

    // キャッシュ無効化
    revalidatePath('/path');

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Action failed:', error);
    return {
      success: false,
      error: 'エラーメッセージ',
    };
  }
}
```

#### 禁止事項
```typescript
// ❌ 絶対に禁止: lib/db/queriesを直接呼び出し
import { getEntities } from '@/lib/db/queries/entities';

export async function someAction() {
  const data = await getEntities(); // NG!
  return data;
}

// ❌ 禁止: Server Actionsでの認証チェック
import { requireAuth } from '@/lib/auth/server';

export async function someAction() {
  await requireAuth('/'); // NG! API Routeで行う
  // ...
}
```

### 使用箇所
- Client Componentsからの呼び出し
- フォーム送信
- ユーザーインタラクション後のデータ更新

## 3. Page Components（Server Components）

### データフェッチパターン
```typescript
import { serverTypedGet } from '@/lib/api-client/server-fetch';
import { ResponseSchema } from '@/lib/schemas/api-response';

export default async function Page() {
  const data = await serverTypedGet('/api/resource', ResponseSchema);

  return <PageComponent data={data} />;
}
```

### 禁止事項
```typescript
// ❌ 禁止: lib/db/queriesを直接呼び出し
import { getEntities } from '@/lib/db/queries/entities';

export default async function Page() {
  const data = await getEntities(); // NG!
  return <PageComponent data={data} />;
}
```

## 4. Client Components

### データフェッチパターン

#### Option 1: fetch + router.refresh()
```typescript
'use client';

import { useRouter } from 'next/navigation';

export default function Component() {
  const router = useRouter();

  const handleAction = async () => {
    const response = await fetch('/api/resource', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      router.refresh(); // Server Componentを再取得
    }
  };

  return <button onClick={handleAction}>実行</button>;
}
```

#### Option 2: Server Actions + useOptimistic
```typescript
'use client';

import { useOptimistic } from 'react';
import { someAction } from '@/lib/actions/some-action';

export default function Component({ data }) {
  const [optimisticData, addOptimistic] = useOptimistic(
    data,
    (state, newItem) => [...state, newItem]
  );

  const handleAction = async (item) => {
    // 楽観的更新
    addOptimistic(item);

    // Server Action呼び出し
    const result = await someAction(item);

    if (!result.success) {
      // エラー処理（自動でロールバック）
    }
  };

  return <div>{/* UI */}</div>;
}
```

## 5. API Routes

### 責任範囲
- 認証チェック（`requireAuth`, Supabase認証）
- バリデーション（入力データの検証）
- ビジネスロジック（データ加工、条件判定）
- データベース操作（`lib/db/queries`の呼び出し）
- レスポンス生成

### 実装パターン
```typescript
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createEntity } from '@/lib/db/queries/entities';

export async function POST(request: Request) {
  try {
    // 認証チェック
    const cookieStore = await cookies();
    const supabase = createServerClient(/* ... */);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // リクエストボディ取得
    const body = await request.json();

    // バリデーション
    if (!body.name) {
      return NextResponse.json({ error: 'nameが必要です' }, { status: 400 });
    }

    // データベース操作
    const entity = await createEntity({
      userId: user.id,
      name: body.name,
    });

    return NextResponse.json({
      success: true,
      data: entity,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
```

## 6. 型安全性の保証

### Zodスキーマの使用
すべてのAPI ResponseにはZodスキーマを定義し、型安全性を保証します。

#### スキーマ定義 (`lib/schemas/api-response.ts`)
```typescript
import { z } from 'zod';

export const EntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.string().datetime().transform(val => new Date(val)),
});

export const EntitiesGetResponseSchema = APIResponseSchema(
  z.array(EntitySchema)
);

export const EntityPostResponseSchema = APIResponseSchema(EntitySchema);
```

#### Server Actionsでの使用
```typescript
import { serverTypedPost } from '@/lib/api-client/server-fetch';
import { EntityPostResponseSchema } from '@/lib/schemas/api-response';

const result = await serverTypedPost(
  '/api/entities',
  EntityPostResponseSchema, // 型安全性を保証
  { name: 'Entity Name' }
);
```

#### Page Componentsでの使用
```typescript
import { serverTypedGet } from '@/lib/api-client/server-fetch';
import { EntitiesGetResponseSchema } from '@/lib/schemas/api-response';

const data = await serverTypedGet(
  '/api/entities',
  EntitiesGetResponseSchema // 型安全性を保証
);
```

## 7. データベースクエリ（lib/db/queries）

### 配置と責任
- **配置:** `src/lib/db/queries/` 配下
- **責任:** 純粋なデータ操作のみ
- **呼び出し元:** API Routesのみ

### 実装パターン
```typescript
import { db } from '../index';
import { entities, type Entity, type InsertEntity } from '../schema';
import { eq } from 'drizzle-orm';

export async function getEntities(userId: string): Promise<Entity[]> {
  return await db
    .select()
    .from(entities)
    .where(eq(entities.userId, userId));
}

export async function createEntity(data: InsertEntity): Promise<Entity> {
  const [entity] = await db
    .insert(entities)
    .values(data)
    .returning();
  return entity;
}
```

### 禁止事項
```typescript
// ❌ 禁止: lib/db/queries内で認証チェック
export async function getEntities(userId: string) {
  await requireAuth(); // NG! API Routeで行う
  // ...
}

// ❌ 禁止: lib/db/queries内でビジネスロジック
export async function createEntity(data: InsertEntity) {
  // 複雑なバリデーション、データ加工などはAPI Routeで行う
  // ここは純粋なDB操作のみ
}
```

## 8. 実装チェックリスト

### Server Actions実装時
- [ ] `src/lib/actions/` 配下に配置
- [ ] `serverTypedPost/Get` を使用してAPI経由でアクセス
- [ ] `lib/db/queries` を直接呼び出していない
- [ ] Zodスキーマで型安全性を保証
- [ ] `revalidatePath` または `revalidateTag` でキャッシュ無効化
- [ ] エラーハンドリングを実装

### Page Components実装時
- [ ] `serverTypedGet` を使用してAPI経由でアクセス
- [ ] `lib/db/queries` を直接呼び出していない
- [ ] Zodスキーマで型安全性を保証
- [ ] エラー時の表示を実装

### API Routes実装時
- [ ] 認証チェックを実装
- [ ] バリデーションを実装
- [ ] `lib/db/queries` を呼び出してデータ操作
- [ ] 適切なエラーレスポンスを返す
- [ ] 型安全なレスポンスを返す

### Client Components実装時
- [ ] `fetch` または Server Actions でデータ更新
- [ ] `router.refresh()` または `useOptimistic` で UI 更新
- [ ] エラーハンドリングを実装

## 9. よくある間違い

### ❌ Server Actionsから直接DB呼び出し
```typescript
// NG!
'use server';
import { createEntity } from '@/lib/db/queries/entities';

export async function someAction(data) {
  const entity = await createEntity(data); // 直接呼び出しはNG
  return entity;
}
```

### ✅ 正しい実装
```typescript
// OK!
'use server';
import { serverTypedPost } from '@/lib/api-client/server-fetch';
import { EntityPostResponseSchema } from '@/lib/schemas/api-response';

export async function someAction(data) {
  const result = await serverTypedPost(
    '/api/entities',
    EntityPostResponseSchema,
    data
  );
  return result;
}
```

### ❌ Page Componentsから直接DB呼び出し
```typescript
// NG!
import { getEntities } from '@/lib/db/queries/entities';

export default async function Page() {
  const entities = await getEntities(userId); // 直接呼び出しはNG
  return <div>{/* ... */}</div>;
}
```

### ✅ 正しい実装
```typescript
// OK!
import { serverTypedGet } from '@/lib/api-client/server-fetch';
import { EntitiesGetResponseSchema } from '@/lib/schemas/api-response';

export default async function Page() {
  const response = await serverTypedGet(
    '/api/entities',
    EntitiesGetResponseSchema
  );
  return <div>{/* ... */}</div>;
}
```

## 10. まとめ

### 基本原則
1. **BFFパターンを厳守** - すべてのデータアクセスはAPI Routes経由
2. **レイヤー分離を徹底** - 各レイヤーの責任を明確に
3. **型安全性を保証** - Zodスキーマで全レスポンスを検証
4. **Server Actionsは`lib/actions`** - `app/actions`は使用しない

### データフロー
```
UI Layer → Server Actions/serverTyped → API Routes → DB Queries → Database
```

この階層を守ることで：
- 型安全性が保証される
- テストしやすいコードになる
- 認証・バリデーションが一箇所に集約される
- 変更の影響範囲が限定される
