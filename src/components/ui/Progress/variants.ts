import { cva } from 'class-variance-authority';

export const progressRootVariants = cva(
  'relative h-3 w-full overflow-hidden rounded-full bg-white shadow-inner dark:bg-black'
);

export const progressIndicatorVariants = cva(
  'h-full w-full flex-1 rounded-full bg-black shadow-sm transition-all duration-500 ease-out dark:bg-white'
);
