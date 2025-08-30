/**
 * 【機能概要】: ユーザープロフィール自動作成機能（P0課題解決）
 * 【実装方針】: 新規ユーザーのエラー状態を解決する自動プロフィール作成を実装
 * 【テスト対応】: auto-profile-creation.test.ts の全テストケースを通すための実装
 * 🔴 信頼性レベル: P0課題解決のための推測ベース実装
 */

import { getCurrentUser } from '@/lib/auth';
import { 
  getUserProfile, 
  createUserProfile
} from '@/lib/db/queries/user-profiles';
import { type UserProfile, type InsertUserProfile } from '@/lib/db/schema';

// 【型定義】: 自動プロフィール作成結果の構造定義
// 🟡 信頼性レベル: テストケースから妥当な推測
export interface AutoProfileCreationResult {
  success: boolean;
  created: boolean;
  profile: UserProfile | null;
  error?: string;
}

/**
 * 【機能概要】: 必要に応じてユーザープロフィールを自動作成（P0課題解決メイン機能）
 * 【実装方針】: プロフィール未作成によるエラー状態を防ぐための自動作成処理
 * 【テスト対応】: 4つのテストケース（新規作成、スキップ、認証エラー、DBエラー）を通す
 * 🔴 信頼性レベル: P0課題の具体的解決方法は推測ベース
 * @param {string} userId - 対象ユーザーのID
 * @returns {Promise<AutoProfileCreationResult>} - 作成結果（成功/失敗、作成有無、プロフィール情報）
 */
export async function autoCreateUserProfileIfNeeded(
  userId: string
): Promise<AutoProfileCreationResult> {
  try {
    // 【認証チェック】: セキュリティ確保のための認証状態確認
    // 【テスト対応】: 「認証エラー時の適切なエラーハンドリング」テストケースに対応
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      // 【セキュリティ処理】: 未認証ユーザーの処理を拒否
      // 🟢 信頼性レベル: セキュリティ要件から確実に導出
      return {
        success: false,
        created: false,
        profile: null,
        error: '認証が必要です' // 【エラーメッセージ】: テストで期待される認証エラー
      };
    }

    // 【入力値検証】: 不正なユーザーIDを早期に検出
    if (!userId || typeof userId !== 'string') {
      // 【エラー処理】: 不正な入力値に対する適切な処理
      return {
        success: false,
        created: false,
        profile: null,
        error: 'ユーザーIDが不正です'
      };
    }

    // 【既存プロフィール確認】: プロフィールが既に存在するかチェック
    // 【テスト対応】: 「既存プロフィールがある場合は作成をスキップ」テストケースに対応
    let existingProfile: UserProfile | null;
    
    try {
      existingProfile = await getUserProfile(userId);
    } catch (dbError) {
      // 【データベースエラー処理】: DB接続エラーを適切にハンドリング
      // 【テスト対応】: 「データベースエラー時の適切なエラーハンドリング」テストケースに対応
      console.error('Database error during profile check:', dbError);
      return {
        success: false,
        created: false,
        profile: null,
        error: 'プロフィールの取得または作成に失敗しました' // 【エラーメッセージ】: テストで期待されるDBエラー
      };
    }

    // 【既存プロフィール処理】: 既に存在する場合はそのまま返却
    if (existingProfile) {
      // 【スキップ処理】: 既存データを保持し、不要な作成処理を回避
      // 🟡 信頼性レベル: 一般的な動作パターンから妥当な推測
      return {
        success: true,
        created: false, // 【作成フラグ】: 新規作成ではないことを明示
        profile: existingProfile
      };
    }

    // 【新規プロフィール作成】: P0課題解決のメイン処理
    // 【テスト対応】: 「新規ユーザーのプロフィール自動作成」テストケースに対応
    const newProfileData: InsertUserProfile = {
      userId,
      // 【デフォルト値設定】: 新規ユーザーの初期状態を定義
      // 🟡 信頼性レベル: 既存API Routes構造から妥当な推測
      level: 1,           // 【初期レベル】: 新規ユーザーは1レベルから開始
      totalXP: 0,         // 【初期XP】: 経験値は0から開始
      currentXP: 0,       // 【現在XP】: レベル内XPも0から開始
      nextLevelXP: 100,   // 【次レベル必要XP】: レベル2に必要なXP
      streak: 0,          // 【初期ストリーク】: 連続実行日数は0から
      longestStreak: 0,   // 【最長ストリーク】: 最長記録も0から
      totalRoutines: 0,   // 【ルーティン総数】: 作成したルーティン数は0から
      totalExecutions: 0, // 【実行総数】: 実行した回数は0から
    };

    try {
      // 【プロフィール作成実行】: データベースに新規プロフィールを作成
      const createdProfile = await createUserProfile(newProfileData);
      
      // 【成功結果返却】: P0課題解決の成功を確認できる結果構造
      // 🟢 信頼性レベル: テストケースから確実に導出
      return {
        success: true,
        created: true,      // 【作成成功フラグ】: 新規作成が完了したことを明示
        profile: createdProfile
      };
      
    } catch (createError) {
      // 【作成エラー処理】: プロフィール作成失敗時の適切な処理
      console.error('Failed to create user profile:', createError);
      return {
        success: false,
        created: false,
        profile: null,
        error: 'プロフィールの作成に失敗しました'
      };
    }

  } catch (error) {
    // 【予期しないエラー処理】: システム全体のエラーを適切にハンドリング
    // 【テスト要件対応】: テストでの例外ケース検証に対応
    console.error('Unexpected error in autoCreateUserProfileIfNeeded:', error);
    return {
      success: false,
      created: false,
      profile: null,
      error: '予期しないエラーが発生しました'
    };
  }
}