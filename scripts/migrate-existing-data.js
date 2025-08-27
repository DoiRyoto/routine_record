import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { routines } from '../src/lib/db/schema.js';
import dotenv from 'dotenv';

// 環境変数を読み込み
dotenv.config({ path: '.env.local' });

async function migrateExistingData() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    console.log('Starting data migration...');

    // 既存のルーチンで goalType が NULL のものを検索
    const existingRoutines = await db
      .select()
      .from(routines)
      .where(eq(routines.goalType, null));

    console.log(`Found ${existingRoutines.length} routines to migrate`);

    for (const routine of existingRoutines) {
      // targetFrequency フィールドが存在する場合（以前の構造）
      // デフォルトでスケジュールベースに設定
      const updates = {
        goalType: 'schedule_based',
        targetPeriod: null, // スケジュールベースの場合は NULL
      };

      await db
        .update(routines)
        .set(updates)
        .where(eq(routines.id, routine.id));

      console.log(`Updated routine ${routine.id}: ${routine.name}`);
    }

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Error during data migration:', error);
  } finally {
    await client.end();
  }
}

migrateExistingData();