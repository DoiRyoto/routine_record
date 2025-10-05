'use client';

import * as React from 'react';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HabitForm({ open, onOpenChange }: HabitFormProps) {
  const [name, setName] = React.useState('');
  const [targetCount, setTargetCount] = React.useState('');
  const [frequencyType, setFrequencyType] = React.useState<'weekly' | 'monthly' | ''>('');
  const [errors, setErrors] = React.useState<{
    name?: string;
    targetCount?: string;
    frequencyType?: string;
  }>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = '習慣名を入力してください';
    }

    if (!targetCount.trim()) {
      newErrors.targetCount = '目標回数を入力してください';
    } else {
      const count = parseInt(targetCount, 10);
      if (isNaN(count) || count < 1) {
        newErrors.targetCount = '目標回数は1以上の数値を入力してください';
      }
    }

    if (!frequencyType) {
      newErrors.frequencyType = '頻度タイプを選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          targetCount: parseInt(targetCount, 10),
          frequencyType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create habit');
      }

      setName('');
      setTargetCount('');
      setFrequencyType('');
      setErrors({});
      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to create habit:', error);
      setErrors({ name: '習慣の作成に失敗しました。もう一度お試しください。' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setTargetCount('');
    setFrequencyType('');
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="habit-form-dialog">
        <DialogHeader>
          <DialogTitle data-testid="habit-form-title">新しい習慣を追加</DialogTitle>
          <DialogDescription data-testid="habit-form-description">
            習慣の名前、目標回数、頻度を入力してください
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" data-testid="habit-name-label">
                習慣名
              </Label>
              <Input
                id="name"
                data-testid="habit-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: ランニング"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-black dark:text-white" data-testid="habit-name-error">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="targetCount" data-testid="habit-target-label">
                目標回数
              </Label>
              <Input
                id="targetCount"
                data-testid="habit-target-input"
                type="number"
                min="1"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                placeholder="例: 3"
                disabled={isLoading}
              />
              {errors.targetCount && (
                <p className="text-sm text-black dark:text-white" data-testid="habit-target-error">
                  {errors.targetCount}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequencyType" data-testid="habit-frequency-label">
                頻度
              </Label>
              <Select
                value={frequencyType}
                onValueChange={(value) => setFrequencyType(value as 'weekly' | 'monthly')}
                disabled={isLoading}
              >
                <SelectTrigger id="frequencyType" data-testid="habit-frequency-select">
                  <SelectValue placeholder="頻度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly" data-testid="habit-frequency-weekly">
                    週間
                  </SelectItem>
                  <SelectItem value="monthly" data-testid="habit-frequency-monthly">
                    月間
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.frequencyType && (
                <p className="text-sm text-black dark:text-white" data-testid="habit-frequency-error">
                  {errors.frequencyType}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              data-testid="habit-form-cancel-button"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="habit-form-submit-button"
            >
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
