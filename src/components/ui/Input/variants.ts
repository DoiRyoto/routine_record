import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'flex h-11 w-full rounded-lg border-2 border-black bg-white px-4 py-2 text-sm font-medium text-black file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-black focus:border-black focus:shadow-lg focus:outline-none disabled:cursor-not-allowed disabled:bg-gray disabled:text-gray dark:border-white dark:bg-black dark:text-white dark:file:text-white dark:disabled:bg-gray dark:disabled:text-gray'
);
