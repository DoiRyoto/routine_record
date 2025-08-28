export class UserId {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('UserIdは空にできません');
    }
    
    // UUIDフォーマットの簡易チェック
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('UserIdはUUID形式である必要があります');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: UserId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}