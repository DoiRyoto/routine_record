import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CategoryDistributionChart } from '@/components/charts/CategoryDistributionChart';

// Rechartsのモック
jest.mock('recharts', () => ({
  PieChart: ({ children, ...props }: any) => (
    <div data-testid="pie-chart" {...props}>
      {children}
    </div>
  ),
  Pie: ({ dataKey }: any) => <div data-testid={`pie-${dataKey}`} />,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe('CategoryDistributionChart', () => {
  const mockData = [
    { category: '健康', count: 10, percentage: 50 },
    { category: '学習', count: 6, percentage: 30 },
    { category: '仕事', count: 4, percentage: 20 }
  ];

  test('カテゴリ別データが円グラフで正しく表示される', () => {
    render(<CategoryDistributionChart data={mockData} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-count')).toBeInTheDocument();
  });
  
  test('空データの場合、適切なメッセージが表示される', () => {
    render(<CategoryDistributionChart data={[]} />);
    expect(screen.getByText('データがありません')).toBeInTheDocument();
  });
});