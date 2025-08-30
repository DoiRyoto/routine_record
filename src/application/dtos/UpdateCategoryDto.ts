export interface UpdateCategoryDto {
  userId: string;
  categoryId: string;
  name?: string;
  color?: string;
  isActive?: boolean;
}