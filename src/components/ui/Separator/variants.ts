import { cva } from 'class-variance-authority';

export const separatorVariants = cva('shrink-0 bg-black dark:bg-white', {
  variants: {
    orientation: {
      horizontal: 'h-[1px] w-full',
      vertical: 'h-full w-[1px]',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});
