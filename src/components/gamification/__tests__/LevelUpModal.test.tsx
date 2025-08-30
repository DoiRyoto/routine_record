import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { LevelUpModal } from '../LevelUpModal';

describe('LevelUpModal - Level Up Notification', () => {
  const user = userEvent.setup();

  test('should not render when no level up', () => {
    render(<LevelUpModal levelUpData={null} onClose={jest.fn()} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should render level up information', () => {
    const levelUpData = {
      newLevel: 5,
      previousLevel: 4,
      xpGained: 150,
      nextLevelXp: 500,
      currentXp: 450,
      rewards: ['新しいバッジ: "継続は力なり"']
    };
    
    render(<LevelUpModal levelUpData={levelUpData} onClose={jest.fn()} />);
    
    expect(screen.getByText('レベルアップ！')).toBeInTheDocument();
    expect(screen.getByText('レベル 5 に到達しました')).toBeInTheDocument();
    expect(screen.getByText('150 XP 獲得')).toBeInTheDocument();
    expect(screen.getByText('新しいバッジ: "継続は力なり"')).toBeInTheDocument();
  });

  test('should show progress to next level', () => {
    const levelUpData = {
      newLevel: 5,
      previousLevel: 4,
      xpGained: 150,
      nextLevelXp: 500,
      currentXp: 450,
      rewards: []
    };
    
    render(<LevelUpModal levelUpData={levelUpData} onClose={jest.fn()} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '90'); // 450/500 = 90%
  });

  test('should close when continue button is clicked', async () => {
    const mockOnClose = jest.fn();
    const levelUpData = {
      newLevel: 5,
      previousLevel: 4,
      xpGained: 150,
      nextLevelXp: 500,
      currentXp: 450,
      rewards: []
    };
    
    render(<LevelUpModal levelUpData={levelUpData} onClose={mockOnClose} />);
    
    const continueButton = screen.getByRole('button', { name: /続ける/i });
    await user.click(continueButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should show celebration animation', () => {
    const levelUpData = {
      newLevel: 5,
      previousLevel: 4,
      xpGained: 150,
      nextLevelXp: 500,
      currentXp: 450,
      rewards: []
    };
    
    render(<LevelUpModal levelUpData={levelUpData} onClose={jest.fn()} />);
    
    const celebrationElement = screen.getByTestId('celebration-animation');
    expect(celebrationElement).toBeInTheDocument();
    expect(celebrationElement).toHaveClass('animate-celebration');
  });

  test('should display rewards section when rewards exist', () => {
    const levelUpData = {
      newLevel: 5,
      previousLevel: 4,
      xpGained: 150,
      nextLevelXp: 500,
      currentXp: 450,
      rewards: ['新しいバッジ: "継続は力なり"', '特典: "週次ボーナスXP +10"']
    };
    
    render(<LevelUpModal levelUpData={levelUpData} onClose={jest.fn()} />);
    
    const rewardsSection = screen.getByTestId('rewards-section');
    expect(rewardsSection).toBeInTheDocument();
    expect(screen.getByText(/新しい特典を獲得しました/)).toBeInTheDocument();
    expect(screen.getByText('新しいバッジ: "継続は力なり"')).toBeInTheDocument();
    expect(screen.getByText('特典: "週次ボーナスXP +10"')).toBeInTheDocument();
  });
});