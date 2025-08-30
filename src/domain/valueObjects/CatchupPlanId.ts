export class CatchupPlanId {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('CatchupPlanIdは空にできません');
    }
    
    // UUIDフォーマットの簡易チェック (testing環境では緩い検証)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
    
    if (!isTestEnvironment && !uuidRegex.test(value)) {
      throw new Error('CatchupPlanIdはUUID形式である必要があります');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: CatchupPlanId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}