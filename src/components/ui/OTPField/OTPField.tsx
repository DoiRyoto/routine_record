'use client';

import * as React from 'react';
import { cn } from '@/lib/ui-utils';

export interface OTPFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const OTPField = React.forwardRef<HTMLDivElement, OTPFieldProps>(
  ({ className, length = 6, value = '', onChange, disabled = false, ...props }, ref) => {
    const [otp, setOtp] = React.useState(value.split(''));

    const inputRefs = React.useRef<HTMLInputElement[]>([]);

    React.useEffect(() => {
      setOtp(value.split('').slice(0, length));
    }, [value, length]);

    const handleChange = (index: number, newValue: string) => {
      if (newValue.length > 1) {
        newValue = newValue.slice(-1);
      }

      const newOtp = [...otp];
      newOtp[index] = newValue;
      setOtp(newOtp);

      onChange?.(newOtp.join(''));

      // Auto focus next input
      if (newValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
      const newOtp = pastedData.split('').slice(0, length);
      
      while (newOtp.length < length) {
        newOtp.push('');
      }
      
      setOtp(newOtp);
      onChange?.(newOtp.join(''));
    };

    return (
      <div
        ref={ref}
        className={cn('flex gap-2', className)}
        {...props}
      >
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => {
              if (el) inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              'h-12 w-12 rounded-md border border-gray-300 text-center text-lg font-medium',
              'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200',
              'disabled:cursor-not-allowed disabled:opacity-50',
              otp[index] && 'border-blue-500'
            )}
          />
        ))}
      </div>
    );
  }
);
OTPField.displayName = 'OTPField';

export { OTPField };