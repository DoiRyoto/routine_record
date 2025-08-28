export class RoutineId {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('RoutineIdは空にできません');
    }
    
    // UUIDフォーマットの簡易チェック
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('RoutineIdはUUID形式である必要があります');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: RoutineId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}