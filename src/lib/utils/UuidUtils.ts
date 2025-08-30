import { randomUUID } from 'crypto';

/**
 * UUID生成ユーティリティ
 */
export class UuidUtils {
  /**
   * ランダムなUUID v4を生成
   */
  static generateUuid(): string {
    return randomUUID();
  }

  /**
   * UUIDの形式をチェック
   */
  static isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}