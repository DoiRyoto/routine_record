import { cva } from 'class-variance-authority';

export const cardVariants = cva(
  'overflow-hidden rounded-xl border border-black bg-white text-black dark:border-white dark:bg-black dark:text-white'
);

export const cardHeaderVariants = cva('flex flex-col space-y-2 p-6 pb-4');

export const cardTitleVariants = cva(
  'text-lg leading-tight font-bold tracking-tight text-black dark:text-white'
);

export const cardDescriptionVariants = cva(
  'text-sm leading-relaxed text-black dark:text-white'
);

export const cardContentVariants = cva('space-y-4 p-6 pt-0');

export const cardFooterVariants = cva(
  'flex items-center justify-between gap-3 p-6 pt-0'
);
