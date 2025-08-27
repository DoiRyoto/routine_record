'use client';

import React from 'react';
import { Button as UIButton, type ButtonProps } from '../ui/Button';

// Legacy compatibility wrapper
interface LegacyButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function Button({
  variant = 'primary',
  ...props
}: LegacyButtonProps) {
  // Map legacy variants to new variants
  const variantMap = {
    primary: 'primary' as const,
    secondary: 'secondary' as const,
    danger: 'danger' as const,
  };

  return (
    <UIButton
      variant={variantMap[variant]}
      {...props}
    />
  );
}
