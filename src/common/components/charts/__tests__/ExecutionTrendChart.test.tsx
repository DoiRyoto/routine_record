import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ExecutionTrendChart } from '@/common/components/charts/ExecutionTrendChart';

// Rechartsのモック
jest.mock('recharts', () => ({
  LineChart: ({ children, ...props }: any) => (
    <div data-testid="line-chart" {...props}>
      {children}
    </div>
  ),
  Line: ({ dataKey }: any) => <div data-testid={`line-${dataKey}`} />,
  XAxis: ({ dataKey }: any) => <div data-testid={`xaxis-${dataKey}`} />,
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: ({ content }: any) => <div data-testid="tooltip">{content}</div>,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe('ExecutionTrendChart', () => {
  const mockData = [
    { date: '2025-08-01', count: 5 },
    { date: '2025-08-02', count: 3 },
    { date: '2025-08-03', count: 7 }
  ];

  test('正常なデータで折れ線グラフが表示される', () => {
    render(<ExecutionTrendChart data={mockData} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-count')).toBeInTheDocument();
  });
  
  test('空データの場合、適切なメッセージが表示される', () => {
    render(<ExecutionTrendChart data={[]} />);
    expect(screen.getByText('データがありません')).toBeInTheDocument();
  });
  
  test('チャートにaria-labelが設定されている', () => {
    render(<ExecutionTrendChart data={mockData} />);
    
    const chart = screen.getByTestId('line-chart');
    expect(chart).toHaveAttribute('aria-label', expect.stringContaining('実行回数推移チャート'));
  });
});