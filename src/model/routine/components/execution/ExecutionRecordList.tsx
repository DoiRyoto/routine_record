import React, { useState } from 'react';

interface Routine {
  id: string;
  name: string;
  categoryId: string;
  isActive: boolean;
}

interface ExecutionRecord {
  id: string;
  userId: string;
  routineId: string;
  executedAt: Date;
  duration?: number;
  memo?: string;
  isCompleted: boolean;
  xpEarned?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ExecutionRecordListProps {
  records: ExecutionRecord[];
  routines: Routine[];
  onEdit: (record: ExecutionRecord) => void;
  onDelete: (recordId: string) => void;
}

export const ExecutionRecordList: React.FC<ExecutionRecordListProps> = ({
  records,
  routines,
  onEdit,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    routineId: '',
    startDate: '',
    endDate: '',
    showFilters: false,
  });

  // Empty state
  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">実行記録がありません</p>
        <p className="text-sm text-gray-400 mt-2">最初の記録を作成してください</p>
      </div>
    );
  }

  // Sort records by execution date (newest first)
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
  );

  // Apply filters
  const filteredRecords = sortedRecords.filter(record => {
    if (filters.routineId && record.routineId !== filters.routineId) {
      return false;
    }
    
    if (filters.startDate) {
      const recordDate = new Date(record.executedAt).toDateString();
      const startDate = new Date(filters.startDate).toDateString();
      if (recordDate < startDate) return false;
    }
    
    if (filters.endDate) {
      const recordDate = new Date(record.executedAt).toDateString();
      const endDate = new Date(filters.endDate).toDateString();
      if (recordDate > endDate) return false;
    }
    
    return true;
  });

  const handleDeleteClick = (recordId: string) => {
    setShowDeleteConfirm(recordId);
  };

  const handleDeleteConfirm = (recordId: string) => {
    onDelete(recordId);
    setShowDeleteConfirm(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(null);
  };

  const getRoutineName = (routineId: string) => {
    const routine = routines.find(r => r.id === routineId);
    return routine?.name || 'Unknown Routine';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  const applyFilters = () => {
    setFilters(prev => ({ ...prev, showFilters: false }));
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">実行記録一覧</h3>
        <button
          onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
          className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
        >
          フィルター
        </button>
      </div>

      {/* Filter Panel */}
      {filters.showFilters && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="routine-filter" className="block text-sm font-medium">
                ルーチンで絞り込み
              </label>
              <select
                id="routine-filter"
                value={filters.routineId}
                onChange={(e) => setFilters(prev => ({ ...prev, routineId: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300"
              >
                <option value="">すべて</option>
                {routines.map(routine => (
                  <option key={routine.id} value={routine.id}>
                    {routine.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium">
                開始日
              </label>
              <input
                type="date"
                id="start-date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>
            
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium">
                終了日
              </label>
              <input
                type="date"
                id="end-date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setFilters({ routineId: '', startDate: '', endDate: '', showFilters: false })}
              className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
            >
              クリア
            </button>
            <button
              onClick={applyFilters}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              適用
            </button>
          </div>
        </div>
      )}

      {/* Records List */}
      <div className="space-y-2">
        {filteredRecords.map(record => (
          <div
            key={record.id}
            data-testid="execution-record-item"
            className="border rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <h4 className="font-medium">{getRoutineName(record.routineId)}</h4>
                  <span className="text-sm text-gray-500">
                    {formatDate(record.executedAt)}
                  </span>
                  {record.duration && (
                    <span className="text-sm text-gray-500">
                      {record.duration}分
                    </span>
                  )}
                  {record.xpEarned && (
                    <span className="text-sm font-medium text-green-600">
                      {record.xpEarned} XP
                    </span>
                  )}
                </div>
                
                {record.memo && (
                  <p className="mt-2 text-sm text-gray-600">{record.memo}</p>
                )}
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onEdit(record)}
                  className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDeleteClick(record.id)}
                  className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">確認</h3>
              <p className="text-sm text-gray-600 mb-6">
                この実行記録を削除しますか？
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};