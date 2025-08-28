export class ExecutionRecordId {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('ExecutionRecordIdは空にできません');
    }
    
    // UUIDフォーマットの簡易チェック
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('ExecutionRecordIdはUUID形式である必要があります');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: ExecutionRecordId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}