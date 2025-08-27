'use client';

import React from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';

export interface HoverCardProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root> {}

export interface HoverCardTriggerProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger> {}

export interface HoverCardContentProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> {
  children: React.ReactNode;
}

export const HoverCard = HoverCardPrimitive.Root;

export const HoverCardTrigger = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Trigger>,
  HoverCardTriggerProps
>(({ className, ...props }, ref) => (
  <HoverCardPrimitive.Trigger
    ref={ref}
    className={className}
    {...props}
  />
));
HoverCardTrigger.displayName = HoverCardPrimitive.Trigger.displayName;

export const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  HoverCardContentProps
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={`z-50 w-64 rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className || ''}`}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;