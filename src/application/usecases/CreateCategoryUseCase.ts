import { Category } from '../../domain/entities/Category';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { CategoryId, UserId } from '../../domain/valueObjects';
import { CategoryNameConflictError } from '../../shared/types/CategoryErrors';
import { CreateCategoryDto } from '../dtos/CreateCategoryDto';

export class CreateCategoryUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(dto: CreateCategoryDto): Promise<Category> {
    // バリデーション（エンティティで実行される）
    Category.validateCategoryData(dto.name, dto.color);

    const userId = new UserId(dto.userId);

    // 重複チェック
    const existingCategory = await this.categoryRepository.findByUserIdAndName(userId, dto.name);
    if (existingCategory) {
      throw new CategoryNameConflictError(dto.name);
    }

    // カテゴリ作成
    const category = new Category(
      CategoryId.generate(),
      userId,
      dto.name,
      dto.color || Category.DEFAULT_COLOR,
      false, // isDefault
      true   // isActive
    );

    // 保存
    await this.categoryRepository.save(category);

    return category;
  }
}