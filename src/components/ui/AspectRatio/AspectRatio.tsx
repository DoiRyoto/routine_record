'use client';

import React from 'react';
import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

export interface AspectRatioProps
  extends React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root> {
  children: React.ReactNode;
  ratio?: number;
}

export const AspectRatio = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  AspectRatioProps
>(({ className, ratio = 1, ...props }, ref) => {
  return (
    <AspectRatioPrimitive.Root
      ref={ref}
      ratio={ratio}
      className={className}
      {...props}
    />
  );
});
AspectRatio.displayName = AspectRatioPrimitive.Root.displayName;