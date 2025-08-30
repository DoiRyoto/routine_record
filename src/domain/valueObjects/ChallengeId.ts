export class ChallengeId {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('ChallengeIdは空にできません');
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('ChallengeIdはUUID形式である必要があります');
    }
  }

  public static generate(): ChallengeId {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return new ChallengeId(uuid);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: ChallengeId): boolean {
    return this.value === other.value;
  }
}