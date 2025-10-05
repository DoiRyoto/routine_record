import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:bg-gray dark:focus-visible:ring-white dark:disabled:bg-gray',
  {
    variants: {
      variant: {
        primary: 'bg-black text-white dark:bg-white dark:text-black',
        outline: 'border-2 border-black bg-transparent text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black',
        ghost: 'bg-transparent text-black hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-md',
        default: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);
