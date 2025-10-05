import { cva } from 'class-variance-authority';

export const labelVariants = cva(
  'text-sm leading-relaxed font-semibold text-black peer-disabled:cursor-not-allowed peer-disabled:text-gray dark:text-white dark:peer-disabled:text-gray'
);
