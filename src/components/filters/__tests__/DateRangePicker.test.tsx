import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DateRangePicker } from '@/components/filters/DateRangePicker';

describe('DateRangePicker', () => {
  test('プリセット期間ボタンが表示される', () => {
    const mockOnChange = jest.fn();
    render(<DateRangePicker onChange={mockOnChange} />);
    
    expect(screen.getByRole('button', { name: '1週間' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1ヶ月' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3ヶ月' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1年' })).toBeInTheDocument();
  });
  
  test('プリセット期間ボタンクリックでonChangeが呼ばれる', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    render(<DateRangePicker onChange={mockOnChange} />);
    
    await user.click(screen.getByRole('button', { name: '1週間' }));
    
    expect(mockOnChange).toHaveBeenCalledWith({
      startDate: expect.any(Date),
      endDate: expect.any(Date),
      preset: '1week'
    });
  });
});