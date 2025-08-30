import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { badges, missions } from '../src/lib/db/schema';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, {
  prepare: false,
  onnotice: () => {},
  connection: {
    timezone: 'Asia/Tokyo',
  },
});

const db = drizzle(client, {
  schema: { badges, missions },
});

// Initial Badges Data
const initialBadges = [
  // ストリーク系バッジ
  {
    name: '初心者',
    description: '初回のルーチンを完了',
    rarity: 'common' as const,
    category: '実績',
    iconUrl: '/badges/first-routine.svg',
  },
  {
    name: '継続の第一歩',
    description: '3日連続でルーチンを実行',
    rarity: 'common' as const,
    category: 'ストリーク',
    iconUrl: '/badges/3-day-streak.svg',
  },
  {
    name: '習慣の芽',
    description: '7日連続でルーチンを実行',
    rarity: 'rare' as const,
    category: 'ストリーク',
    iconUrl: '/badges/7-day-streak.svg',
  },
  {
    name: '継続力',
    description: '30日連続でルーチンを実行',
    rarity: 'epic' as const,
    category: 'ストリーク',
    iconUrl: '/badges/30-day-streak.svg',
  },
  {
    name: '習慣マスター',
    description: '100日連続でルーチンを実行',
    rarity: 'legendary' as const,
    category: 'ストリーク',
    iconUrl: '/badges/100-day-streak.svg',
  },
  
  // 実行回数系バッジ
  {
    name: 'アクティブユーザー',
    description: 'ルーチンを50回実行',
    rarity: 'common' as const,
    category: '実績',
    iconUrl: '/badges/50-executions.svg',
  },
  {
    name: '努力家',
    description: 'ルーチンを200回実行',
    rarity: 'rare' as const,
    category: '実績',
    iconUrl: '/badges/200-executions.svg',
  },
  {
    name: '継続の達人',
    description: 'ルーチンを500回実行',
    rarity: 'epic' as const,
    category: '実績',
    iconUrl: '/badges/500-executions.svg',
  },
  
  // レベル系バッジ
  {
    name: 'レベルアップ！',
    description: 'レベル5に到達',
    rarity: 'common' as const,
    category: 'レベル',
    iconUrl: '/badges/level-5.svg',
  },
  {
    name: '成長実感',
    description: 'レベル10に到達',
    rarity: 'rare' as const,
    category: 'レベル',
    iconUrl: '/badges/level-10.svg',
  },
  {
    name: '熟練者',
    description: 'レベル25に到達',
    rarity: 'epic' as const,
    category: 'レベル',
    iconUrl: '/badges/level-25.svg',
  },
  
  // 多様性系バッジ
  {
    name: '多角的な取り組み',
    description: '5つ以上の異なるカテゴリでルーチンを実行',
    rarity: 'rare' as const,
    category: '多様性',
    iconUrl: '/badges/5-categories.svg',
  },
];

// Initial Missions Data
const initialMissions = [
  // Streak系ミッション
  {
    title: '3日間継続チャレンジ',
    description: 'どのルーチンでも良いので3日連続で実行してください',
    type: 'streak' as const,
    targetValue: 3,
    xpReward: 50,
    difficulty: 'easy' as const,
  },
  {
    title: '週間継続チャレンジ',
    description: 'どのルーチンでも良いので7日連続で実行してください',
    type: 'streak' as const,
    targetValue: 7,
    xpReward: 150,
    difficulty: 'medium' as const,
  },
  {
    title: '月間継続チャレンジ',
    description: 'どのルーチンでも良いので30日連続で実行してください',
    type: 'streak' as const,
    targetValue: 30,
    xpReward: 500,
    difficulty: 'hard' as const,
  },
  
  // Count系ミッション
  {
    title: '10回実行チャレンジ',
    description: '今週中にルーチンを合計10回実行してください',
    type: 'count' as const,
    targetValue: 10,
    xpReward: 100,
    difficulty: 'easy' as const,
  },
  {
    title: '50回実行チャレンジ',
    description: '今月中にルーチンを合計50回実行してください',
    type: 'count' as const,
    targetValue: 50,
    xpReward: 300,
    difficulty: 'medium' as const,
  },
  {
    title: '100回実行チャレンジ',
    description: '今月中にルーチンを合計100回実行してください',
    type: 'count' as const,
    targetValue: 100,
    xpReward: 800,
    difficulty: 'hard' as const,
  },
  
  // Variety系ミッション
  {
    title: '多様性チャレンジ',
    description: '3つ以上の異なるカテゴリでルーチンを実行してください',
    type: 'variety' as const,
    targetValue: 3,
    xpReward: 120,
    difficulty: 'easy' as const,
  },
  {
    title: 'カテゴリマスター',
    description: '5つ以上の異なるカテゴリでルーチンを実行してください',
    type: 'variety' as const,
    targetValue: 5,
    xpReward: 200,
    difficulty: 'medium' as const,
  },
  
  // Consistency系ミッション
  {
    title: '週間一貫性チャレンジ',
    description: '1週間中、毎日少なくとも1つのルーチンを実行してください',
    type: 'consistency' as const,
    targetValue: 7,
    xpReward: 180,
    difficulty: 'medium' as const,
  },
  {
    title: '月間一貫性チャレンジ',
    description: '1ヶ月中、毎日少なくとも1つのルーチンを実行してください',
    type: 'consistency' as const,
    targetValue: 30,
    xpReward: 600,
    difficulty: 'hard' as const,
  },
];

async function seedInitialData() {
  try {
    console.log('🌱 Starting initial data seeding...');
    
    // Insert badges
    console.log('📛 Inserting initial badges...');
    const insertedBadges = await db.insert(badges).values(initialBadges).returning();
    console.log(`✅ Inserted ${insertedBadges.length} badges`);
    
    // Insert missions (with badge references where applicable)
    console.log('🎯 Inserting initial missions...');
    const insertedMissions = await db.insert(missions).values(initialMissions).returning();
    console.log(`✅ Inserted ${insertedMissions.length} missions`);
    
    console.log('🎉 Initial data seeding completed successfully!');
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log(`- Badges: ${insertedBadges.length}`);
    console.log(`- Missions: ${insertedMissions.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding initial data:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔚 Database connection closed');
  }
}

// Run the seeding
if (require.main === module) {
  seedInitialData();
}

export { seedInitialData, initialBadges, initialMissions };