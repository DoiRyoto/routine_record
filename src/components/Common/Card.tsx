'use client';

import React from 'react';
import { Card as UICard, type CardProps as UICardProps } from '../ui/Card';

interface CardProps extends UICardProps {
  children: React.ReactNode;
}

export default function Card({
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <UICard
      className={className}
      {...props}
    >
      {children}
    </UICard>
  );
}
