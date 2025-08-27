'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../ui/Dialog';
import { Button } from '../ui/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 p-2 h-auto"
              onClick={onClose}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="sr-only">閉じる</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="pt-2">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
