import { renderHook, waitFor, act } from '@testing-library/react';

import { useExecutionRecords } from '../useExecutionRecords';

const mockExecutionRecords = [
  {
    id: 'record-1',
    userId: 'user-1',
    routineId: 'routine-1',
    executedAt: new Date('2024-12-01T10:00:00Z'),
    duration: 30,
    memo: '今日は調子が良かった',
    isCompleted: true,
    createdAt: new Date('2024-12-01T10:00:00Z'),
    updatedAt: new Date('2024-12-01T10:00:00Z'),
  },
  {
    id: 'record-2',
    userId: 'user-1',
    routineId: 'routine-2',
    executedAt: new Date('2024-12-02T20:00:00Z'),
    duration: 45,
    memo: '良い本に出会えた',
    isCompleted: true,
    createdAt: new Date('2024-12-02T20:00:00Z'),
    updatedAt: new Date('2024-12-02T20:00:00Z'),
  },
];

describe('useExecutionRecords - Data Management', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should fetch execution records on mount', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockExecutionRecords })
    });
    global.fetch = mockFetch;
    
    const { result } = renderHook(() => useExecutionRecords());
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.records).toEqual(mockExecutionRecords);
    expect(mockFetch).toHaveBeenCalledWith('/api/execution-records');
  });

  test('should create new execution record', async () => {
    const newRecord = {
      routineId: 'routine-1',
      executedAt: new Date(),
      isCompleted: true,
      duration: 30,
      memo: 'Test memo'
    };
    
    const mockFetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockExecutionRecords })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          data: { ...newRecord, id: 'new-record-id' }
        })
      });
    global.fetch = mockFetch;
    
    const { result } = renderHook(() => useExecutionRecords());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.createRecord(newRecord);
    });
    
    expect(mockFetch).toHaveBeenCalledWith('/api/execution-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newRecord,
        executedAt: newRecord.executedAt.toISOString()
      })
    });
  });

  test('should handle fetch error', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch;
    
    const { result } = renderHook(() => useExecutionRecords());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('ネットワークエラーが発生しました');
    expect(result.current.records).toEqual([]);
  });
});