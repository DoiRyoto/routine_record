import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { CategoryId, UserId } from '../../domain/valueObjects';
import { 
  DefaultCategoryModificationError,
  CategoryInUseError,
  CategoryAccessForbiddenError,
  CategoryNotFoundError
} from '../../shared/types/CategoryErrors';
import { DeleteCategoryDto } from '../dtos/DeleteCategoryDto';

export class DeleteCategoryUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(dto: DeleteCategoryDto): Promise<void> {
    const categoryId = new CategoryId(dto.categoryId);
    const userId = new UserId(dto.userId);

    // カテゴリの存在確認
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new CategoryNotFoundError(dto.categoryId);
    }

    // アクセス権限チェック
    if (!category.belongsToUser(userId)) {
      throw new CategoryAccessForbiddenError(dto.categoryId);
    }

    // デフォルトカテゴリ保護
    if (category.isDefaultCategory()) {
      throw new DefaultCategoryModificationError(dto.categoryId);
    }

    // 使用中カテゴリ保護
    const isUsed = await this.categoryRepository.isUsedInRoutines(categoryId);
    if (isUsed) {
      const usedCount = await this.categoryRepository.countUsedInRoutines(categoryId);
      throw new CategoryInUseError(dto.categoryId, usedCount);
    }

    // 削除
    await this.categoryRepository.delete(categoryId);
  }
}