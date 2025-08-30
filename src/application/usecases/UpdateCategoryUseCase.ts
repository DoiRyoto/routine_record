import { Category } from '../../domain/entities/Category';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { CategoryId, UserId } from '../../domain/valueObjects';
import { UpdateCategoryDto } from '../dtos/UpdateCategoryDto';
import { 
  DefaultCategoryModificationError,
  CategoryAccessForbiddenError,
  CategoryNotFoundError,
  CategoryNameConflictError
} from '../../shared/types/CategoryErrors';

export class UpdateCategoryUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository
  ) {}

  private async validateCategoryAccess(
    categoryId: CategoryId, 
    userId: UserId, 
    categoryIdString: string
  ): Promise<Category> {
    // カテゴリの存在確認
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new CategoryNotFoundError(categoryIdString);
    }

    // アクセス権限チェック
    if (!category.belongsToUser(userId)) {
      throw new CategoryAccessForbiddenError(categoryIdString);
    }

    return category;
  }

  private async validateNameUpdate(
    dto: UpdateCategoryDto, 
    category: Category, 
    userId: UserId
  ): Promise<void> {
    if (dto.name !== undefined && dto.name !== category.getName()) {
      // バリデーション（空の名前もここで検証される）
      Category.validateCategoryData(dto.name);
      
      const existingCategory = await this.categoryRepository.findByUserIdAndName(userId, dto.name);
      if (existingCategory && !existingCategory.equals(category)) {
        throw new CategoryNameConflictError(dto.name);
      }
    }
  }

  private updateCategoryProperties(dto: UpdateCategoryDto, category: Category): void {
    // 名前更新
    if (dto.name !== undefined && dto.name !== category.getName()) {
      category.updateName(dto.name);
    }

    // カラー更新
    if (dto.color) {
      category.updateColor(dto.color);
    }

    // アクティブ状態更新
    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        category.activate();
      } else {
        category.deactivate();
      }
    }
  }

  async execute(dto: UpdateCategoryDto): Promise<Category> {
    const categoryId = new CategoryId(dto.categoryId);
    const userId = new UserId(dto.userId);

    // カテゴリの存在確認とアクセス権限チェック
    const category = await this.validateCategoryAccess(categoryId, userId, dto.categoryId);

    // デフォルトカテゴリ保護
    if (category.isDefaultCategory()) {
      throw new DefaultCategoryModificationError(dto.categoryId);
    }

    // 名前変更バリデーション
    await this.validateNameUpdate(dto, category, userId);

    // プロパティ更新
    this.updateCategoryProperties(dto, category);

    // 保存
    await this.categoryRepository.save(category);

    return category;
  }
}