import { validate } from 'class-validator';
import { ValidationError } from '../types/DomainError';

/**
 * DTOのバリデーションを実行
 */
export async function validateDto<T extends object>(dto: T): Promise<void> {
  const errors = await validate(dto);
  
  if (errors.length > 0) {
    const errorMessages = errors
      .map(error => Object.values(error.constraints || {}))
      .flat()
      .join(', ');
    
    throw new ValidationError(errorMessages);
  }
}

/**
 * 複数のDTOのバリデーションを実行
 */
export async function validateDtos<T extends object>(dtos: T[]): Promise<void> {
  const validationPromises = dtos.map(dto => validateDto(dto));
  await Promise.all(validationPromises);
}

/**
 * UUIDフォーマットかどうかをチェック
 */
export function isValidUuid(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * メールアドレスの形式をチェック
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 文字列が空かどうかをチェック（null、undefined、空文字、空白文字のみも空とみなす）
 */
export function isEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === '';
}

/**
 * 数値が正の数かどうかをチェック
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * 日付が有効かどうかをチェック
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 日付が未来かどうかをチェック
 */
export function isFutureDate(date: Date): boolean {
  return isValidDate(date) && date.getTime() > Date.now();
}

/**
 * 日付が過去かどうかをチェック
 */
export function isPastDate(date: Date): boolean {
  return isValidDate(date) && date.getTime() < Date.now();
}

/**
 * 文字列の長さをチェック
 */
export function isValidLength(
  value: string, 
  minLength: number = 0, 
  maxLength: number = Number.MAX_SAFE_INTEGER
): boolean {
  if (typeof value !== 'string') return false;
  return value.length >= minLength && value.length <= maxLength;
}

/**
 * 値が指定された列挙値に含まれているかチェック
 */
export function isValidEnum<T extends readonly string[]>(
  value: string, 
  enumValues: T
): value is T[number] {
  return enumValues.includes(value);
}

/**
 * オブジェクトが必須プロパティを持っているかチェック
 */
export function hasRequiredProperties<T extends object>(
  obj: T,
  requiredProperties: (keyof T)[]
): boolean {
  return requiredProperties.every(prop => 
    obj.hasOwnProperty(prop) && obj[prop] !== null && obj[prop] !== undefined
  );
}

/**
 * 文字列をサニタイズ（HTMLエスケープ）
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * 深いオブジェクトの比較
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 === null || obj2 === null) return false;
  
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}